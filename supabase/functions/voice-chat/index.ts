import "https://deno.land/x/xhr@0.1.0/mod.ts";
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

const personalityPrompts: Record<string, string> = {
  helpful: 'You are a helpful, friendly AI voice assistant. Be informative and supportive.',
  professional: 'You are a professional AI assistant. Be formal, precise, and business-oriented.',
  casual: 'You are a casual, friendly AI buddy. Be relaxed, use conversational language, and be fun.',
  creative: 'You are a creative and imaginative AI. Be expressive, think outside the box, and inspire.',
  concise: 'You are a concise expert. Give brief, direct answers. No fluff, just facts.',
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

    const personalityPrompt = personalityPrompts[personality] || personalityPrompts.helpful;
    const languageName = language.split('-')[0] === 'en' ? 'English' : language;

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
            content: `${personalityPrompt} You have access to real-time web search. Keep responses concise and conversational (1-3 sentences unless more detail is needed). Always respond in ${languageName}.` 
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
