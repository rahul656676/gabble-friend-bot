import { useState, useCallback, useRef } from 'react';
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
  const { toast } = useToast();
  
  const recognitionRef = useRef<SpeechRecognitionInstance | null>(null);
  const currentTranscriptRef = useRef<string>('');

  const playAudio = useCallback(async (text: string) => {
    try {
      setIsSpeaking(true);
      
      const response = await fetch(
        `${import.meta.env.VITE_SUPABASE_URL}/functions/v1/text-to-speech`,
        {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'apikey': import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY,
            'Authorization': `Bearer ${import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY}`,
          },
          body: JSON.stringify({ text }),
        }
      );

      if (!response.ok) {
        throw new Error('Failed to generate speech');
      }

      const data = await response.json();
      
      if (data.error) {
        throw new Error(data.error);
      }

      const audioUrl = `data:audio/mpeg;base64,${data.audioContent}`;
      const audio = new Audio(audioUrl);
      
      audio.onended = () => {
        setIsSpeaking(false);
      };
      
      audio.onerror = () => {
        setIsSpeaking(false);
        console.error('Audio playback error');
      };
      
      await audio.play();
    } catch (error) {
      console.error('Error playing audio:', error);
      setIsSpeaking(false);
      toast({
        title: 'Audio Error',
        description: 'Failed to play audio response',
        variant: 'destructive',
      });
    }
  }, [toast]);

  const getAIResponse = useCallback(async (userMessage: string) => {
    try {
      setIsProcessing(true);
      
      const conversationHistory = messages.map(m => ({
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
      
      // Play the response
      await playAudio(aiResponse);
      
    } catch (error) {
      console.error('Error getting AI response:', error);
      toast({
        title: 'Error',
        description: 'Failed to get AI response',
        variant: 'destructive',
      });
    } finally {
      setIsProcessing(false);
    }
  }, [messages, playAudio, toast]);

  const startListening = useCallback(async () => {
    try {
      // Check for browser support
      const windowWithSpeech = window as typeof window & {
        SpeechRecognition?: SpeechRecognitionConstructor;
        webkitSpeechRecognition?: SpeechRecognitionConstructor;
      };
      
      const SpeechRecognitionAPI = windowWithSpeech.SpeechRecognition || windowWithSpeech.webkitSpeechRecognition;
      
      if (!SpeechRecognitionAPI) {
        toast({
          title: 'Not Supported',
          description: 'Speech recognition is not supported in this browser. Please use Chrome or Edge.',
          variant: 'destructive',
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
        
        if (event.error !== 'aborted') {
          toast({
            title: 'Recognition Error',
            description: `Speech recognition error: ${event.error}`,
            variant: 'destructive',
          });
        }
      };

      recognition.onend = () => {
        // Only process if we have a transcript
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
      toast({
        title: 'Microphone Error',
        description: 'Failed to access microphone. Please check permissions.',
        variant: 'destructive',
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
    if (isSpeaking || isProcessing) return;

    if (!hasStarted) {
      setHasStarted(true);
      const greeting = "Hello! I'm your AI voice assistant. Tap the orb and speak when you're ready.";
      
      const assistantMessage: Message = {
        id: Date.now().toString(),
        role: 'assistant',
        content: greeting,
        timestamp: new Date(),
      };
      setMessages([assistantMessage]);
      
      await playAudio(greeting);
    } else if (isListening) {
      stopListening();
    } else {
      await startListening();
    }
  }, [hasStarted, isListening, isSpeaking, isProcessing, startListening, stopListening, playAudio]);

  return {
    isListening,
    isSpeaking,
    isProcessing,
    messages,
    hasStarted,
    handleOrbClick,
  };
};
