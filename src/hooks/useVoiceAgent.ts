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
  // Clean text for speech - remove special characters that get pronounced
  const cleanTextForSpeech = (text: string): string => {
    return text
      .replace(/\[\d+\]/g, '') // Remove citation markers like [1], [4], [1][4]
      .replace(/\p{Emoji_Presentation}/gu, '') // Remove emojis with presentation
      .replace(/\p{Emoji}\uFE0F/gu, '') // Remove emojis with variation selector
      .replace(/[\u{1F600}-\u{1F64F}]/gu, '') // Remove emoticons
      .replace(/[\u{1F300}-\u{1F5FF}]/gu, '') // Remove misc symbols and pictographs
      .replace(/[\u{1F680}-\u{1F6FF}]/gu, '') // Remove transport and map symbols
      .replace(/[\u{1F1E0}-\u{1F1FF}]/gu, '') // Remove flags
      .replace(/[\u{2600}-\u{26FF}]/gu, '') // Remove misc symbols
      .replace(/[\u{2700}-\u{27BF}]/gu, '') // Remove dingbats
      .replace(/\*\*/g, '') // Remove bold markers
      .replace(/\*/g, '')   // Remove single asterisks
      .replace(/_{2,}/g, '') // Remove underscores used for emphasis
      .replace(/#{1,6}\s?/g, '') // Remove markdown headers
      .replace(/`{1,3}/g, '') // Remove code backticks
      .replace(/~~/g, '')   // Remove strikethrough
      .replace(/\[([^\]]+)\]\([^)]+\)/g, '$1') // Convert links to just text
      .replace(/[•◦▪▫●○■□]/g, '') // Remove bullet points
      .replace(/[\u2022\u2023\u25E6\u2043\u2219]/g, '') // Remove more bullet characters
      .replace(/\s{2,}/g, ' ') // Collapse multiple spaces
      .trim();
  };

  const audioRef = useRef<HTMLAudioElement | null>(null);

  // Browser speech synthesis - reliable and works everywhere
  const speak = useCallback((text: string): Promise<void> => {
    return new Promise<void>((resolve) => {
      if (!('speechSynthesis' in window)) {
        console.log('Speech synthesis not supported');
        resolve();
        return;
      }

      // Cancel any ongoing speech
      window.speechSynthesis.cancel();

      // Clean the text before speaking
      const cleanedText = cleanTextForSpeech(text);
      
      if (!cleanedText.trim()) {
        console.log('No text to speak');
        resolve();
        return;
      }

      console.log('Speaking:', cleanedText.substring(0, 50) + '...');
      
      const utterance = new SpeechSynthesisUtterance(cleanedText);
      
      // Apply user preferences
      utterance.rate = preferences.voiceRate;
      utterance.pitch = preferences.voicePitch;
      utterance.volume = 1.0;
      
      // Map Hinglish to Hindi for speech synthesis
      const speechLang = preferences.language === 'hi-EN' ? 'hi-IN' : preferences.language;
      utterance.lang = speechLang;

      // Get voices and select the best one
      const getVoicesAndSpeak = () => {
        const voices = window.speechSynthesis.getVoices();
        console.log('Available voices:', voices.length);
        
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
          console.log('Using voice:', selectedVoice.name);
        }

        utterance.onstart = () => {
          console.log('Speech started');
          setIsSpeaking(true);
        };

        utterance.onend = () => {
          console.log('Speech ended');
          setIsSpeaking(false);
          resolve();
        };

        utterance.onerror = (e) => {
          console.error('Speech error:', e);
          setIsSpeaking(false);
          resolve();
        };

        // Small delay to ensure voice is ready
        setTimeout(() => {
          window.speechSynthesis.speak(utterance);
        }, 50);
      };

      // Voices might not be loaded immediately
      if (window.speechSynthesis.getVoices().length === 0) {
        window.speechSynthesis.onvoiceschanged = getVoicesAndSpeak;
      } else {
        getVoicesAndSpeak();
      }
    });
  }, [preferences.voiceRate, preferences.voicePitch, preferences.voiceName, preferences.language]);

  // Keep speech synthesis alive for long texts (Chrome bug workaround)
  useEffect(() => {
    if (!isSpeaking) return;
    
    const interval = setInterval(() => {
      if (window.speechSynthesis.speaking) {
        window.speechSynthesis.pause();
        window.speechSynthesis.resume();
      }
    }, 10000); // Every 10 seconds
    
    return () => clearInterval(interval);
  }, [isSpeaking]);

  // Preload voices on mount
  useEffect(() => {
    if ('speechSynthesis' in window) {
      window.speechSynthesis.getVoices();
    }
  }, []);

  const stopSpeaking = useCallback(() => {
    // Stop ElevenLabs audio if any
    if (audioRef.current) {
      audioRef.current.pause();
      audioRef.current = null;
    }
    // Stop browser speech synthesis
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
    
    // Track feedback event with message content for model improvement
    const message = messagesRef.current.find(m => m.id === messageId);
    await trackEvent('feedback_given', { 
      messageId, 
      feedback,
      feedbackType: feedback === 1 ? 'helpful' : 'not_helpful',
      messageContent: message?.content?.substring(0, 200), // First 200 chars for context
    });
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
      
      // Map Hinglish to Hindi for speech recognition (browser doesn't support hi-EN)
      const speechLang = preferences.language === 'hi-EN' ? 'hi-IN' : preferences.language;
      recognition.lang = speechLang;

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
        'hi-IN': "नमस्ते! मैं आपका AI वॉइस असिस्टेंट हूं। मैं आपकी कैसे मदद कर सकता हूं?",
        'hi-EN': "Namaste! Main aapka AI voice assistant hoon. Aapki kaise help kar sakta hoon?",
        'es-ES': "¡Hola! Soy tu asistente de voz AI. ¿Cómo puedo ayudarte hoy?",
        'fr-FR': "Bonjour! Je suis votre assistant vocal IA. Comment puis-je vous aider?",
        'de-DE': "Hallo! Ich bin Ihr KI-Sprachassistent. Wie kann ich Ihnen helfen?",
        'pt-BR': "Olá! Sou seu assistente de voz AI. Como posso ajudá-lo?",
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
