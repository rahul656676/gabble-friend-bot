import { useState, useCallback, useRef, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import { useSessionId } from '@/hooks/useSessionId';
import { useUserPreferences } from '@/hooks/useUserPreferences';
import { useAnalytics } from '@/hooks/useAnalytics';

export interface Message {
  id: string;
  role: 'user' | 'assistant';
  content: string;
  timestamp: Date;
  feedback?: number;
}

// Define SpeechRecognition types
interface SpeechRecognitionResult {
  isFinal: boolean;
  [index: number]: {
    transcript: string;
    confidence: number;
  };
}

interface SpeechRecognitionResultList {
  length: number;
  [index: number]: SpeechRecognitionResult;
}

interface SpeechRecognitionEvent extends Event {
  resultIndex: number;
  results: SpeechRecognitionResultList;
}

interface SpeechRecognitionErrorEvent extends Event {
  error: string;
}

interface SpeechRecognitionInstance extends EventTarget {
  continuous: boolean;
  interimResults: boolean;
  lang: string;
  start(): void;
  stop(): void;
  onresult: ((event: SpeechRecognitionEvent) => void) | null;
  onerror: ((event: SpeechRecognitionErrorEvent) => void) | null;
  onend: (() => void) | null;
}

type SpeechRecognitionConstructor = new () => SpeechRecognitionInstance;

export const useVoiceAgent = () => {
  const [isListening, setIsListening] = useState(false);
  const [isSpeaking, setIsSpeaking] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);
  const [messages, setMessages] = useState<Message[]>([]);
  const [hasStarted, setHasStarted] = useState(false);
  const [speechSupported, setSpeechSupported] = useState(true);
  const { toast } = useToast();
  
  const sessionId = useSessionId();
  const { preferences, updatePreferences, availableVoices, loading: prefsLoading, hasCompletedOnboarding } = useUserPreferences(sessionId);
  const { trackEvent } = useAnalytics(sessionId);
  
  const recognitionRef = useRef<SpeechRecognitionInstance | null>(null);
  const currentTranscriptRef = useRef<string>('');
  const messagesRef = useRef<Message[]>([]);

  // Keep messagesRef in sync
  useEffect(() => {
    messagesRef.current = messages;
  }, [messages]);

  // Use browser's built-in speech synthesis with preferences
  const speak = useCallback((text: string): Promise<void> => {
    return new Promise<void>((resolve) => {
      if (!('speechSynthesis' in window)) {
        console.log('Speech synthesis not supported');
        resolve();
        return;
      }

      // Cancel any ongoing speech
      window.speechSynthesis.cancel();

      const utterance = new SpeechSynthesisUtterance(text);
      
      // Apply user preferences
      utterance.rate = preferences.voiceRate;
      utterance.pitch = preferences.voicePitch;
      utterance.volume = 1.0;
      utterance.lang = preferences.language;

      // Get the preferred voice
      const voices = window.speechSynthesis.getVoices();
      let selectedVoice: SpeechSynthesisVoice | undefined;

      if (preferences.voiceName !== 'default') {
        selectedVoice = voices.find(v => v.name === preferences.voiceName);
      }

      if (!selectedVoice) {
        // Find a voice matching the language
        selectedVoice = voices.find(v => v.lang.startsWith(preferences.language.split('-')[0])) ||
          voices.find(v => v.lang.startsWith('en')) ||
          voices[0];
      }
      
      if (selectedVoice) {
        utterance.voice = selectedVoice;
      }

      utterance.onstart = () => {
        setIsSpeaking(true);
      };

      utterance.onend = () => {
        setIsSpeaking(false);
        resolve();
      };

      utterance.onerror = () => {
        setIsSpeaking(false);
        resolve();
      };

      setTimeout(() => {
        window.speechSynthesis.speak(utterance);
      }, 100);
    });
  }, [preferences.voiceRate, preferences.voicePitch, preferences.voiceName, preferences.language]);

  const stopSpeaking = useCallback(() => {
    if ('speechSynthesis' in window) {
      window.speechSynthesis.cancel();
    }
    setIsSpeaking(false);
  }, []);

  const getAIResponse = useCallback(async (userMessage: string) => {
    try {
      setIsProcessing(true);
      
      const conversationHistory = messagesRef.current.map(m => ({
        role: m.role,
        content: m.content,
      }));
      
      conversationHistory.push({ role: 'user', content: userMessage });

      const { data, error } = await supabase.functions.invoke('voice-chat', {
        body: { 
          messages: conversationHistory,
          personality: preferences.personality,
          language: preferences.language,
        },
      });

      if (error) throw error;

      const aiResponse = data.response;
      
      const assistantMessage: Message = {
        id: Date.now().toString(),
        role: 'assistant',
        content: aiResponse,
        timestamp: new Date(),
      };
      
      setMessages(prev => [...prev, assistantMessage]);
      setIsProcessing(false);
      
      await trackEvent('message_received', { messageLength: aiResponse.length });
      
      // Speak the response
      await speak(aiResponse);
      
    } catch (error) {
      console.error('Error getting AI response:', error);
      await trackEvent('error_occurred', { error: 'ai_response_failed' });
      toast({
        title: 'Error',
        description: 'Failed to get AI response. Please try again.',
        variant: 'destructive',
      });
      setIsProcessing(false);
    }
  }, [speak, toast, preferences.personality, preferences.language, trackEvent]);

  const sendTextMessage = useCallback(async (text: string, isQuickReply = false) => {
    if (!text.trim() || isProcessing || isSpeaking) return;
    
    if (!hasStarted) {
      setHasStarted(true);
      await trackEvent('conversation_started', {});
    }
    
    const userMessage: Message = {
      id: Date.now().toString(),
      role: 'user',
      content: text.trim(),
      timestamp: new Date(),
    };
    setMessages(prev => [...prev, userMessage]);
    
    await trackEvent(isQuickReply ? 'quick_reply_used' : 'text_used', { 
      messageLength: text.length 
    });
    
    await getAIResponse(text.trim());
  }, [hasStarted, isProcessing, isSpeaking, getAIResponse, trackEvent]);

  const giveFeedback = useCallback(async (messageId: string, feedback: number) => {
    setMessages(prev => prev.map(m => 
      m.id === messageId ? { ...m, feedback } : m
    ));
    
    await trackEvent('feedback_given', { messageId, feedback });
  }, [trackEvent]);

  const clearChat = useCallback(() => {
    setMessages([]);
    setHasStarted(false);
  }, []);

  const startListening = useCallback(async () => {
    try {
      const windowWithSpeech = window as typeof window & {
        SpeechRecognition?: SpeechRecognitionConstructor;
        webkitSpeechRecognition?: SpeechRecognitionConstructor;
      };
      
      const SpeechRecognitionAPI = windowWithSpeech.SpeechRecognition || windowWithSpeech.webkitSpeechRecognition;
      
      if (!SpeechRecognitionAPI) {
        setSpeechSupported(false);
        toast({
          title: 'Voice Not Supported',
          description: 'Use the text input below to chat with the AI.',
          variant: 'default',
        });
        return;
      }

      const recognition = new SpeechRecognitionAPI();
      recognition.continuous = false;
      recognition.interimResults = true;
      recognition.lang = preferences.language;

      currentTranscriptRef.current = '';

      recognition.onresult = (event: SpeechRecognitionEvent) => {
        let finalTranscript = '';

        for (let i = event.resultIndex; i < event.results.length; i++) {
          const transcript = event.results[i][0].transcript;
          if (event.results[i].isFinal) {
            finalTranscript += transcript;
          }
        }

        if (finalTranscript) {
          currentTranscriptRef.current += finalTranscript;
        }
      };

      recognition.onerror = (event: SpeechRecognitionErrorEvent) => {
        console.error('Speech recognition error:', event.error);
        setIsListening(false);
        
        if (event.error === 'no-speech') {
          return;
        }
        
        setSpeechSupported(false);
        toast({
          title: 'Voice Recognition Unavailable',
          description: 'Please use the text input below to chat.',
          variant: 'default',
        });
      };

      recognition.onend = () => {
        setIsListening(false);
        if (currentTranscriptRef.current.trim()) {
          const userMessage: Message = {
            id: Date.now().toString(),
            role: 'user',
            content: currentTranscriptRef.current.trim(),
            timestamp: new Date(),
          };
          setMessages(prev => [...prev, userMessage]);
          trackEvent('voice_used', { messageLength: currentTranscriptRef.current.length });
          getAIResponse(currentTranscriptRef.current.trim());
        }
      };

      recognition.start();
      recognitionRef.current = recognition;
      setIsListening(true);

    } catch (error) {
      console.error('Error starting speech recognition:', error);
      setSpeechSupported(false);
      toast({
        title: 'Voice Recognition Unavailable',
        description: 'Please use the text input below to chat.',
        variant: 'default',
      });
    }
  }, [toast, getAIResponse, preferences.language, trackEvent]);

  const stopListening = useCallback(() => {
    if (recognitionRef.current) {
      recognitionRef.current.stop();
      recognitionRef.current = null;
    }
  }, []);

  const handleOrbClick = useCallback(async () => {
    if (isProcessing) return;

    if (!hasStarted) {
      setHasStarted(true);
      await trackEvent('conversation_started', {});
      
      const greetings: Record<string, string> = {
        'en-US': "Hello! I'm your AI voice assistant. How can I help you today?",
        'en-GB': "Hello! I'm your AI voice assistant. How may I assist you?",
        'es-ES': "¡Hola! Soy tu asistente de voz AI. ¿Cómo puedo ayudarte hoy?",
        'fr-FR': "Bonjour! Je suis votre assistant vocal IA. Comment puis-je vous aider?",
        'de-DE': "Hallo! Ich bin Ihr KI-Sprachassistent. Wie kann ich Ihnen helfen?",
        'it-IT': "Ciao! Sono il tuo assistente vocale AI. Come posso aiutarti?",
        'pt-BR': "Olá! Sou seu assistente de voz AI. Como posso ajudá-lo?",
        'zh-CN': "你好！我是你的AI语音助手。我能帮你什么？",
        'ja-JP': "こんにちは！私はあなたのAI音声アシスタントです。何かお手伝いできますか？",
        'ko-KR': "안녕하세요! 저는 AI 음성 도우미입니다. 무엇을 도와드릴까요?",
        'hi-IN': "नमस्ते! मैं आपका AI वॉइस असिस्टेंट हूं। मैं आपकी कैसे मदद कर सकता हूं?",
        'ar-SA': "مرحبا! أنا مساعدك الصوتي AI. كيف يمكنني مساعدتك؟",
      };
      
      const greeting = greetings[preferences.language] || greetings['en-US'];
      
      const assistantMessage: Message = {
        id: Date.now().toString(),
        role: 'assistant',
        content: greeting,
        timestamp: new Date(),
      };
      setMessages([assistantMessage]);
      
      await speak(greeting);
    } else if (isListening) {
      stopListening();
    } else if (speechSupported) {
      await startListening();
    }
  }, [hasStarted, isListening, isProcessing, speechSupported, startListening, stopListening, speak, preferences.language, trackEvent]);

  const handleStopSpeaking = useCallback(() => {
    stopSpeaking();
    if (speechSupported) {
      setTimeout(() => {
        startListening();
      }, 300);
    }
  }, [stopSpeaking, speechSupported, startListening]);

  return {
    isListening,
    isSpeaking,
    isProcessing,
    messages,
    hasStarted,
    speechSupported,
    handleOrbClick,
    handleStopSpeaking,
    sendTextMessage,
    giveFeedback,
    clearChat,
    preferences,
    updatePreferences,
    availableVoices,
    sessionId,
    prefsLoading,
    hasCompletedOnboarding,
  };
};
