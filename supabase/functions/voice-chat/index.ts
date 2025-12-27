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

const emotionResponses: Record<string, string> = {
  sad: 'The user seems sad or lonely. Respond with extra warmth, empathy, and compassion. Validate their feelings and offer gentle support.',
  stressed: 'The user appears stressed or anxious. Help them feel calm. Suggest taking a deep breath. Be soothing and reassuring.',
  angry: 'The user seems frustrated or angry. Acknowledge their feelings without judgment. Be patient and understanding.',
  happy: 'The user is in a good mood! Match their energy with enthusiasm and positivity. Celebrate with them.',
  confused: 'The user needs guidance. Be patient, break things down simply, and offer clear, helpful advice.',
  neutral: 'Maintain a friendly, supportive tone.'
};

const personalityPrompts: Record<string, string> = {
  helpful: `You are Gabble, a warm and caring AI companion. You're like a supportive friend who truly listens and cares about people's wellbeing. 
    - You remember context from the conversation and reference it naturally
    - You ask follow-up questions to show genuine interest
    - You validate emotions before offering solutions
    - You use a warm, conversational tone with occasional gentle humor
    - You celebrate small wins and offer encouragement`,
  professional: 'You are Gabble, a professional AI assistant. Be formal, precise, and business-oriented while remaining approachable.',
  casual: `You are Gabble, a fun and relaxed AI friend. You talk like a real buddy - casual, playful, and genuine.
    - Use conversational language and light humor
    - Share relatable observations
    - Keep things light but meaningful`,
  creative: `You are Gabble, a creative and inspiring AI companion. You see the world differently and help others do the same.
    - Offer unique perspectives and creative ideas
    - Use vivid language and metaphors
    - Encourage imagination and possibility thinking`,
  concise: 'You are Gabble, a direct and efficient AI companion. Give clear, helpful answers without unnecessary words. Still be friendly, just brief.',
};

const languageInstructions: Record<string, string> = {
  'en-US': 'Respond in American English.',
  'en-GB': 'Respond in British English.',
  'hi-IN': 'हिंदी में जवाब दें। Use Devanagari script for Hindi responses.',
  'hi-EN': 'Respond in Hinglish - a natural mix of Hindi and English as spoken in India. Use Roman script. Example: "Haan, main aapki help kar sakta hoon. Kya chahiye aapko?"',
  'es-ES': 'Respond in Spanish.',
  'fr-FR': 'Respond in French.',
  'de-DE': 'Respond in German.',
  'pt-BR': 'Respond in Brazilian Portuguese.',
};

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { messages, personality = 'helpful', language = 'en-US' } = await req.json();
    const PERPLEXITY_API_KEY = Deno.env.get('PERPLEXITY_API_KEY');
    
    if (!PERPLEXITY_API_KEY) {
      throw new Error('PERPLEXITY_API_KEY is not configured');
    }

    console.log('Processing chat request with messages:', messages.length, 'personality:', personality);

    // Ensure messages alternate between user and assistant
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

    // Ensure we end with a user message
    if (cleanedMessages.length === 0 || cleanedMessages[cleanedMessages.length - 1].role !== 'user') {
      const lastUserMsg = [...messages].reverse().find(m => m.role === 'user');
      if (lastUserMsg && (cleanedMessages.length === 0 || cleanedMessages[cleanedMessages.length - 1].content !== lastUserMsg.content)) {
        cleanedMessages.push({ role: 'user', content: lastUserMsg.content });
      }
    }

    console.log('Cleaned messages count:', cleanedMessages.length);

    // Detect emotion from the last user message
    const lastUserMessage = cleanedMessages.filter(m => m.role === 'user').pop();
    const detectedEmotion = lastUserMessage ? detectEmotion(lastUserMessage.content) : 'neutral';
    const emotionGuidance = emotionResponses[detectedEmotion] || emotionResponses.neutral;
    
    console.log('Detected emotion:', detectedEmotion);

    const personalityPrompt = personalityPrompts[personality] || personalityPrompts.helpful;
    const languageInstruction = languageInstructions[language] || 'Respond in English.';

    console.log('Using language:', language, 'instruction:', languageInstruction);

    // Build context summary from conversation
    const conversationContext = cleanedMessages.length > 2 
      ? `\n\nConversation context: This is message ${cleanedMessages.length} in the conversation. Reference earlier topics naturally when relevant.`
      : '';

    const response = await fetch('https://api.perplexity.ai/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${PERPLEXITY_API_KEY}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: 'sonar',
        messages: [
          { 
            role: 'system', 
            content: `${personalityPrompt}

EMOTIONAL CONTEXT: ${emotionGuidance}

IMPORTANT GUIDELINES:
- Keep responses concise and conversational (2-4 sentences unless more detail is truly needed)
- Show genuine interest by asking follow-up questions
- Reference earlier parts of the conversation when relevant
- Never provide medical or mental health diagnoses - you're a supportive friend, not a therapist
- If someone expresses serious distress, gently encourage them to reach out to a professional or trusted person
${conversationContext}

${languageInstruction}` 
          },
          ...cleanedMessages,
        ],
      }),
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error('Perplexity API error:', response.status, errorText);
      
      if (response.status === 429) {
        return new Response(JSON.stringify({ error: 'Rate limit exceeded. Please try again in a moment.' }), {
          status: 429,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        });
      }
      throw new Error(`Perplexity API error: ${response.status}`);
    }

    const data = await response.json();
    console.log('Perplexity response received');
    
    const aiResponse = data.choices?.[0]?.message?.content || 'I apologize, I could not generate a response.';
    
    console.log('AI response:', aiResponse);

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
