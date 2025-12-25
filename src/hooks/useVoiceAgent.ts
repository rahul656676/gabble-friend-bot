import { useState, useCallback, useRef, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';

interface Message {
  id: string;
  role: 'user' | 'assistant';
  content: string;
  timestamp: Date;
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
  
  const recognitionRef = useRef<SpeechRecognitionInstance | null>(null);
  const currentTranscriptRef = useRef<string>('');
  const messagesRef = useRef<Message[]>([]);

  // Keep messagesRef in sync
  useEffect(() => {
    messagesRef.current = messages;
  }, [messages]);

  // Use browser's built-in speech synthesis (FREE!)
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
      
      // Configure voice settings
      utterance.rate = 1.0;
      utterance.pitch = 1.0;
      utterance.volume = 1.0;
      utterance.lang = 'en-US';

      // Try to get a good voice
      const voices = window.speechSynthesis.getVoices();
      const preferredVoice = voices.find(
        (voice) => 
          voice.name.includes('Google') || 
          voice.name.includes('Samantha') ||
          voice.name.includes('Alex') ||
          voice.name.includes('Microsoft')
      ) || voices.find(v => v.lang.startsWith('en')) || voices[0];
      
      if (preferredVoice) {
        utterance.voice = preferredVoice;
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

      // Small delay to ensure voices are loaded
      setTimeout(() => {
        window.speechSynthesis.speak(utterance);
      }, 100);
    });
  }, []);

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
        body: { messages: conversationHistory },
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
      
      // Speak the response using browser TTS
      await speak(aiResponse);
      
    } catch (error) {
      console.error('Error getting AI response:', error);
      toast({
        title: 'Error',
        description: 'Failed to get AI response. Please try again.',
        variant: 'destructive',
      });
      setIsProcessing(false);
    }
  }, [speak, toast]);

  const sendTextMessage = useCallback(async (text: string) => {
    if (!text.trim() || isProcessing || isSpeaking) return;
    
    if (!hasStarted) {
      setHasStarted(true);
    }
    
    const userMessage: Message = {
      id: Date.now().toString(),
      role: 'user',
      content: text.trim(),
      timestamp: new Date(),
    };
    setMessages(prev => [...prev, userMessage]);
    await getAIResponse(text.trim());
  }, [hasStarted, isProcessing, isSpeaking, getAIResponse]);

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
      recognition.continuous = true;
      recognition.interimResults = true;
      recognition.lang = 'en-US';

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
        setSpeechSupported(false);
        
        toast({
          title: 'Voice Recognition Unavailable',
          description: 'Please use the text input below to chat.',
          variant: 'default',
        });
      };

      recognition.onend = () => {
        if (currentTranscriptRef.current.trim()) {
          const userMessage: Message = {
            id: Date.now().toString(),
            role: 'user',
            content: currentTranscriptRef.current.trim(),
            timestamp: new Date(),
          };
          setMessages(prev => [...prev, userMessage]);
          getAIResponse(currentTranscriptRef.current.trim());
        }
        setIsListening(false);
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
  }, [toast, getAIResponse]);

  const stopListening = useCallback(() => {
    if (recognitionRef.current) {
      recognitionRef.current.stop();
      recognitionRef.current = null;
    }
    setIsListening(false);
  }, []);

  const handleOrbClick = useCallback(async () => {
    if (isProcessing) return;
    
    if (isSpeaking) {
      stopSpeaking();
      return;
    }

    if (!hasStarted) {
      setHasStarted(true);
      const greeting = "Hello! I'm your AI voice assistant. How can I help you today?";
      
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
  }, [hasStarted, isListening, isSpeaking, isProcessing, speechSupported, startListening, stopListening, speak, stopSpeaking]);

  return {
    isListening,
    isSpeaking,
    isProcessing,
    messages,
    hasStarted,
    speechSupported,
    handleOrbClick,
    sendTextMessage,
  };
};
