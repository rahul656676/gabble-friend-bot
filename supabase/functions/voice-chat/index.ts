import "https://deno.land/x/xhr@0.1.0/mod.ts";
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

// Emotion detection keywords
const emotionKeywords = {
  sad: ['sad', 'lonely', 'depressed', 'down', 'unhappy', 'crying', 'hurt', 'pain', 'alone', 'empty', 'hopeless'],
  stressed: ['stressed', 'anxious', 'overwhelmed', 'worried', 'nervous', 'panic', 'pressure', 'tension', 'frustrated'],
  angry: ['angry', 'mad', 'furious', 'annoyed', 'irritated', 'upset', 'hate', 'frustrated'],
  happy: ['happy', 'excited', 'great', 'amazing', 'wonderful', 'fantastic', 'good', 'awesome', 'love', 'grateful'],
  confused: ['confused', 'lost', 'unsure', 'don\'t know', 'help me', 'what should', 'advice']
};

const detectEmotion = (text: string): string => {
  const lowerText = text.toLowerCase();
  for (const [emotion, keywords] of Object.entries(emotionKeywords)) {
    if (keywords.some(keyword => lowerText.includes(keyword))) {
      return emotion;
    }
  }
  return 'neutral';
};

const extractUserName = (messages: { role: string; content: string }[]): string | null => {
  const namePatterns = [
    /my name is (\w+)/i, /i'm (\w+)/i, /i am (\w+)/i, /call me (\w+)/i,
    /this is (\w+)/i, /मेरा नाम (\w+)/i, /mera naam (\w+)/i,
  ];
  for (const msg of messages) {
    if (msg.role === 'user') {
      for (const pattern of namePatterns) {
        const match = msg.content.match(pattern);
        if (match && match[1] && match[1].length > 1 && match[1].length < 20) {
          return match[1];
        }
      }
    }
  }
  return null;
};

const detectMoodTrend = (messages: { role: string; content: string }[]): string => {
  const emotions = messages.filter(m => m.role === 'user').map(m => detectEmotion(m.content));
  const emotionCounts: Record<string, number> = {};
  for (const emotion of emotions) {
    emotionCounts[emotion] = (emotionCounts[emotion] || 0) + 1;
  }
  const sorted = Object.entries(emotionCounts).sort((a, b) => b[1] - a[1]);
  return sorted[0]?.[0] || 'neutral';
};

const getTimeBasedContext = (): string => {
  const hour = new Date().getUTCHours();
  if (hour >= 5 && hour < 12) return 'morning';
  if (hour >= 12 && hour < 17) return 'afternoon';
  if (hour >= 17 && hour < 21) return 'evening';
  return 'night';
};

const emotionResponses: Record<string, string> = {
  sad: 'The user seems sad or lonely. Respond with extra warmth, empathy, and compassion.',
  stressed: 'The user appears stressed or anxious. Help them feel calm. Be soothing and reassuring.',
  angry: 'The user seems frustrated or angry. Acknowledge their feelings without judgment.',
  happy: 'The user is in a good mood! Match their energy with enthusiasm and positivity.',
  confused: 'The user needs guidance. Be patient and offer clear, helpful advice.',
  neutral: 'Maintain a friendly, supportive tone.'
};

const personalityPrompts: Record<string, string> = {
  helpful: `You are Voice Agent, a friendly and intelligent AI companion.
    - Your name is "Voice Agent" - if anyone asks your name, always say "I am Voice Agent, your personal AI companion"
    - You are warm, supportive, and speak naturally
    - You remember context from the conversation
    - You ask follow-up questions to show genuine interest
    - You validate emotions before offering solutions`,
  professional: 'You are Voice Agent, a professional AI assistant. If asked your name, say "I am Voice Agent." Be precise and professional while maintaining warmth.',
  casual: 'You are Voice Agent, a friendly AI companion. If asked your name, say "I am Voice Agent." Use conversational language and keep things engaging.',
  creative: 'You are Voice Agent, a creative AI companion. If asked your name, say "I am Voice Agent." Offer unique perspectives and encourage imagination.',
  concise: 'You are Voice Agent, an efficient AI assistant. If asked your name, say "Voice Agent." Give clear, precise answers. Be friendly but brief.',
};

const languageInstructions: Record<string, string> = {
  'en-US': 'Respond in American English.',
  'en-GB': 'Respond in British English.',
  'hi-IN': 'हिंदी में जवाब दें। Use Devanagari script.',
  'hi-EN': 'Respond in Hinglish - a natural mix of Hindi and English. Use Roman script.',
  'es-ES': 'Respond in Spanish.',
  'fr-FR': 'Respond in French.',
  'de-DE': 'Respond in German.',
  'pt-BR': 'Respond in Brazilian Portuguese.',
  'ta-IN': 'Respond in Tamil.',
  'te-IN': 'Respond in Telugu.',
  'bn-IN': 'Respond in Bengali.',
  'mr-IN': 'Respond in Marathi.',
  'gu-IN': 'Respond in Gujarati.',
  'kn-IN': 'Respond in Kannada.',
  'ml-IN': 'Respond in Malayalam.',
  'pa-IN': 'Respond in Punjabi.',
  'ur-IN': 'Respond in Urdu.',
};

const detectLanguage = (text: string): string => {
  if (/[\u0900-\u097F]/.test(text)) return 'hi-IN';
  if (/[\u0B80-\u0BFF]/.test(text)) return 'ta-IN';
  if (/[\u0C00-\u0C7F]/.test(text)) return 'te-IN';
  if (/[\u0980-\u09FF]/.test(text)) return 'bn-IN';
  if (/[\u0A80-\u0AFF]/.test(text)) return 'gu-IN';
  if (/[\u0C80-\u0CFF]/.test(text)) return 'kn-IN';
  if (/[\u0D00-\u0D7F]/.test(text)) return 'ml-IN';
  if (/[\u0A00-\u0A7F]/.test(text)) return 'pa-IN';
  if (/[\u0600-\u06FF]/.test(text)) return 'ur-IN';
  const hinglishPatterns = /\b(kya|kaise|kahan|kab|kaun|kyun|haan|nahi|acha|theek|mujhe|tumhe|aapka|mera|tera|humara|bahut|bohot|accha|bhai|yaar|bolo|batao|samajh|dekho|suno|jao|aao|karo|karna|raha|rahi|rahe|wala|wali|wale|hai|hain|tha|thi|the|hoga|hogi|lekin|aur|ya|par|se|ko|ka|ki|ke|ne|ho|main|hum|tum|aap|wo|woh|ye|yeh|kuch|sab|ab|abhi)\b/i;
  if (hinglishPatterns.test(text)) return 'hi-EN';
  return 'en-US';
};

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { messages, personality = 'helpful', language = 'en-US' } = await req.json();
    
    const LOVABLE_API_KEY = Deno.env.get('LOVABLE_API_KEY');
    if (!LOVABLE_API_KEY) {
      throw new Error('LOVABLE_API_KEY is not configured');
    }

    console.log('Processing chat request with messages:', messages.length);

    // Clean messages to alternate user/assistant
    const cleanedMessages: { role: string; content: string }[] = [];
    let lastRole = 'system';
    for (const msg of messages) {
      if (msg.role === 'user' && lastRole !== 'user') {
        cleanedMessages.push({ role: 'user', content: msg.content });
        lastRole = 'user';
      } else if (msg.role === 'assistant' && lastRole === 'user') {
        cleanedMessages.push({ role: 'assistant', content: msg.content });
        lastRole = 'assistant';
      }
    }

    if (cleanedMessages.length === 0 || cleanedMessages[cleanedMessages.length - 1].role !== 'user') {
      const lastUserMsg = [...messages].reverse().find(m => m.role === 'user');
      if (lastUserMsg && (cleanedMessages.length === 0 || cleanedMessages[cleanedMessages.length - 1].content !== lastUserMsg.content)) {
        cleanedMessages.push({ role: 'user', content: lastUserMsg.content });
      }
    }

    const lastUserMessage = cleanedMessages.filter(m => m.role === 'user').pop();
    const detectedEmotion = lastUserMessage ? detectEmotion(lastUserMessage.content) : 'neutral';
    const emotionGuidance = emotionResponses[detectedEmotion] || emotionResponses.neutral;

    const autoDetectedLanguage = lastUserMessage ? detectLanguage(lastUserMessage.content) : 'en-US';
    const effectiveLanguage = autoDetectedLanguage !== 'en-US' ? autoDetectedLanguage : language;

    const personalityPrompt = personalityPrompts[personality] || personalityPrompts.helpful;
    const languageInstruction = languageInstructions[effectiveLanguage] || 'Respond in English.';

    const userName = extractUserName(cleanedMessages);
    const moodTrend = detectMoodTrend(cleanedMessages);
    const timeOfDay = getTimeBasedContext();

    let memoryContext = '';
    if (userName) memoryContext += `\nUSER NAME: The user's name is ${userName}. Use their name occasionally.`;
    if (moodTrend !== 'neutral' && cleanedMessages.length > 2) memoryContext += `\nMOOD TREND: The user has mostly been feeling ${moodTrend}.`;
    memoryContext += `\nTIME CONTEXT: It's ${timeOfDay} for the user.`;

    const conversationContext = cleanedMessages.length > 2
      ? `\n\nConversation context: This is message ${cleanedMessages.length} in the conversation.`
      : '';

    const response = await fetch('https://ai.lovable.dev/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${LOVABLE_API_KEY}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: 'google/gemini-2.5-flash',
        messages: [
          {
            role: 'system',
            content: `${personalityPrompt}
${memoryContext}

EMOTIONAL CONTEXT: ${emotionGuidance}

IMPORTANT GUIDELINES:
- Keep responses concise and conversational (2-4 sentences unless more detail is truly needed)
- Show genuine interest by asking follow-up questions
- Reference earlier parts of the conversation when relevant
- Never provide medical or mental health diagnoses
- If someone expresses serious distress, gently encourage them to reach out to a professional
${conversationContext}

${languageInstruction}`
          },
          ...cleanedMessages,
        ],
      }),
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error('AI API error:', response.status, errorText);
      throw new Error(`AI API error: ${response.status}`);
    }

    const data = await response.json();
    const aiResponse = data.choices?.[0]?.message?.content || 'I apologize, I could not generate a response.';

    return new Response(JSON.stringify({ response: aiResponse }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  } catch (error) {
    console.error('Error in voice-chat function:', error);
    const errorMessage = error instanceof Error ? error.message : 'Unknown error';
    return new Response(JSON.stringify({ error: errorMessage }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }
});
