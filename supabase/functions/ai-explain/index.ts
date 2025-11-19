import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.45.0';
import OpenAI from 'https://esm.sh/openai@4.52.0';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

serve(async (req) => {
  // Handle CORS preflight request
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { question, originalExplanation, reference } = await req.json();

    if (!question || !originalExplanation || !reference) {
      return new Response(JSON.stringify({ error: 'Missing required parameters: question, originalExplanation, reference' }), {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 400,
      });
    }

    const openai = new OpenAI({
      apiKey: Deno.env.get('OPENAI_API_KEY'),
    });

    const prompt = `Você é um especialista em teologia e história bíblica. Sua tarefa é expandir e aprofundar a explicação de uma pergunta bíblica, tornando-a mais rica e contextualizada. Mantenha um tom respeitoso e informativo.

Pergunta: "${question}"
Explicação Original: "${originalExplanation}"
Referência Bíblica: "${reference}"

Por favor, forneça uma explicação aprimorada, com no mínimo 100 palavras, que inclua contexto histórico, teológico ou cultural relevante, e como a passagem se aplica à vida cristã, se apropriado. Não repita a pergunta ou a referência no início da sua resposta, apenas a explicação aprimorada.`;

    const chatCompletion = await openai.chat.completions.create({
      model: 'gpt-4o-mini', // Ou outro modelo de sua preferência
      messages: [{ role: 'user', content: prompt }],
      temperature: 0.7,
      max_tokens: 500,
    });

    const aiExplanation = chatCompletion.choices[0].message.content;

    return new Response(JSON.stringify({ aiExplanation }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      status: 200,
    });
  } catch (error) {
    console.error('Error in AI explanation function:', error);
    return new Response(JSON.stringify({ error: error.message }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      status: 500,
    });
  }
});