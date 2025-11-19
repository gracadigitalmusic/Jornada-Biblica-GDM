// @ts-ignore
import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
// @ts-ignore
import Groq from 'https://esm.sh/groq@0.4.0?deno-std=0.190.0'; // Atualizado para 0.4.0

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

    // @ts-ignore
    const GROQ_API_KEY = Deno.env.get('groq_api_key'); // Usando a nova variável de ambiente

    if (!GROQ_API_KEY) {
      return new Response(JSON.stringify({ error: 'groq_api_key not set in Supabase secrets.' }), {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 500,
      });
    }

    const groq = new Groq({ apiKey: GROQ_API_KEY }); // Inicializando o cliente Groq

    const prompt = `Você é um especialista em teologia e história bíblica. Sua tarefa é expandir e aprofundar a explicação de uma pergunta bíblica, tornando-a mais rica e contextualizada. Mantenha um tom respeitoso e informativo.

Pergunta: "${question}"
Explicação Original: "${originalExplanation}"
Referência Bíblica: "${reference}"

Por favor, forneça uma explicação aprimorada, com no mínimo 100 palavras, que inclua contexto histórico, teológico ou cultural relevante, e como a passagem se aplica à vida cristã, se apropriado. Não repita a pergunta ou a referência no início da sua resposta, apenas a explicação aprimorada.`;

    const chatCompletion = await groq.chat.completions.create({
      messages: [{ role: "user", content: prompt }],
      model: "llama3-8b-8192", // Modelo da Groq, você pode ajustar se preferir outro
      temperature: 0.7,
      max_tokens: 1024,
    });

    const aiExplanation = chatCompletion.choices[0]?.message?.content || "Não foi possível gerar uma explicação da IA.";

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