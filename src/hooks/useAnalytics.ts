import { useCallback } from 'react';
import { supabase } from '@/integrations/supabase/client';
import type { Json } from '@/integrations/supabase/types';

type EventType = 
  | 'conversation_started'
  | 'message_sent'
  | 'message_received'
  | 'feedback_given'
  | 'voice_used'
  | 'text_used'
  | 'quick_reply_used'
  | 'settings_changed'
  | 'error_occurred';

export const useAnalytics = (sessionId: string) => {
  const trackEvent = useCallback(async (
    eventType: EventType,
    eventData: Json = {}
  ) => {
    if (!sessionId) return;

    try {
      await supabase.from('analytics').insert([{
        session_id: sessionId,
        event_type: eventType,
        event_data: eventData,
      }]);
    } catch (error) {
      console.error('Error tracking event:', error);
    }
  }, [sessionId]);

  return { trackEvent };
};
