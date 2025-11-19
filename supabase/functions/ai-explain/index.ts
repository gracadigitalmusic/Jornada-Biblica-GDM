import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { GoogleGenerativeAI } from 'https://esm.sh/@google/generative-ai@0.15.0';

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

    const GOOGLE_API_KEY = Deno.env.get('GOOGLE_API_KEY');

    if (!GOOGLE_API_KEY) {
      return new Response(JSON.stringify({ error: 'GOOGLE_API_KEY not set in Supabase secrets.' }), {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 500,
      });
    }

    const genAI = new GoogleGenerativeAI(GOOGLE_API_KEY);
    const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" }); // Usando Gemini 1.5 Flash

    const prompt = `Você é um especialista em teologia e história bíblica. Sua tarefa é expandir e aprofundar a explicação de uma pergunta bíblica, tornando-a mais rica e contextualizada. Mantenha um tom respeitoso e informativo.

Pergunta: "${question}"
Explicação Original: "${originalExplanation}"
Referência Bíblica: "${reference}"

Por favor, forneça uma explicação aprimorada, com no mínimo 100 palavras, que inclua contexto histórico, teológico ou cultural relevante, e como a passagem se aplica à vida cristã, se apropriado. Não repita a pergunta ou a referência no início da sua resposta, apenas a explicação aprimorada.`;

    const result = await model.generateContent(prompt);
    const response = await result.response;
    const aiExplanation = response.text();

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