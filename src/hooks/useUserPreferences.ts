import { useState, useEffect, useCallback } from 'react';
import { supabase } from '@/integrations/supabase/client';

export interface UserPreferences {
  voiceName: string;
  voicePitch: number;
  voiceRate: number;
  language: string;
  personality: string;
}

const defaultPreferences: UserPreferences = {
  voiceName: 'default',
  voicePitch: 1.0,
  voiceRate: 1.0,
  language: 'en-US',
  personality: 'helpful',
};

export const useUserPreferences = (sessionId: string) => {
  const [preferences, setPreferences] = useState<UserPreferences>(defaultPreferences);
  const [loading, setLoading] = useState(true);
  const [hasCompletedOnboarding, setHasCompletedOnboarding] = useState(true);
  const [availableVoices, setAvailableVoices] = useState<SpeechSynthesisVoice[]>([]);

  // Load available voices
  useEffect(() => {
    const loadVoices = () => {
      const voices = window.speechSynthesis?.getVoices() || [];
      setAvailableVoices(voices);
    };

    loadVoices();
    
    if (window.speechSynthesis) {
      window.speechSynthesis.onvoiceschanged = loadVoices;
    }

    return () => {
      if (window.speechSynthesis) {
        window.speechSynthesis.onvoiceschanged = null;
      }
    };
  }, []);

  // Load preferences from database
  useEffect(() => {
    if (!sessionId) return;

    const loadPreferences = async () => {
      try {
        const { data, error } = await supabase
          .from('user_preferences')
          .select('*')
          .eq('session_id', sessionId)
          .maybeSingle();

        if (error) throw error;

        if (data) {
          setPreferences({
            voiceName: data.voice_name || 'default',
            voicePitch: data.voice_pitch || 1.0,
            voiceRate: data.voice_rate || 1.0,
            language: data.language || 'en-US',
            personality: data.personality || 'helpful',
          });
          setHasCompletedOnboarding(true);
        } else {
          // No preferences found, show onboarding
          setHasCompletedOnboarding(false);
        }
      } catch (error) {
        console.error('Error loading preferences:', error);
        setHasCompletedOnboarding(false);
      } finally {
        setLoading(false);
      }
    };

    loadPreferences();
  }, [sessionId]);

  const updatePreferences = useCallback(async (newPreferences: Partial<UserPreferences>) => {
    if (!sessionId) return;

    const updated = { ...preferences, ...newPreferences };
    setPreferences(updated);
    setHasCompletedOnboarding(true);

    try {
      const { error } = await supabase
        .from('user_preferences')
        .upsert({
          session_id: sessionId,
          voice_name: updated.voiceName,
          voice_pitch: updated.voicePitch,
          voice_rate: updated.voiceRate,
          language: updated.language,
          personality: updated.personality,
          updated_at: new Date().toISOString(),
        }, { onConflict: 'session_id' });

      if (error) throw error;
    } catch (error) {
      console.error('Error saving preferences:', error);
    }
  }, [sessionId, preferences]);

  return { preferences, updatePreferences, loading, availableVoices, hasCompletedOnboarding };
};
