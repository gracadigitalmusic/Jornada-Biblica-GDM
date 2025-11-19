// @ts-ignore
import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
// @ts-ignore
import Groq from 'https://esm.sh/groq@0.4.0?deno-std=0.190.0'; // Atualizado para 0.4.0
// @ts-ignore
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.45.0';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { questionId } = await req.json();

    if (!questionId) {
      return new Response(JSON.stringify({ error: 'Missing questionId parameter' }), {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 400,
      });
    }

    const supabaseClient = createClient(
      // @ts-ignore
      Deno.env.get('SUPABASE_URL') ?? '',
      // @ts-ignore
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? '', // Use service role key for direct DB access
    );

    // Fetch the question details
    const { data: questionData, error: fetchError } = await supabaseClient
      .from('community_questions')
      .select('*')
      .eq('id', questionId)
      .single();

    if (fetchError || !questionData) {
      throw new Error(fetchError?.message || 'Question not found');
    }

    // @ts-ignore
    const GROQ_API_KEY = Deno.env.get('groq_api_key'); // Usando a chave da Groq
    if (!GROQ_API_KEY) {
      throw new Response(JSON.stringify({ error: 'groq_api_key not set in Supabase secrets.' }), {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 500,
      });
    }

    const groq = new Groq({ apiKey: GROQ_API_KEY }); // Inicializando o cliente Groq

    const prompt = `Você é um revisor de perguntas bíblicas para um quiz cristão. Avalie a seguinte pergunta com base nos critérios abaixo. Forneça um feedback construtivo e detalhado.

**Pergunta:** "${questionData.question}"
**Opções:** ${JSON.stringify(questionData.options)}
**Resposta Correta (Índice):** ${questionData.answer}
**Referência:** "${questionData.reference || 'N/A'}"
**Explicação Original:** "${questionData.explanation || 'N/A'}"
**Categoria:** "${questionData.category}"
**Dificuldade:** "${questionData.difficulty}"

**Critérios de Avaliação:**
1.  **Validade e Clareza:** A pergunta é clara, concisa e bem formulada? Não é ambígua?
2.  **Linguagem Cristã:** A linguagem é apropriada para um quiz bíblico cristão? É respeitosa?
3.  **Completude:** A pergunta, opções e explicação são completas? A explicação é suficiente?
4.  **Coerência Teológica:** A resposta correta é teologicamente coerente e biblicamente precisa? As opções incorretas são plausíveis, mas claramente erradas?
5.  **Relevância:** A pergunta é relevante para o conhecimento bíblico geral?
6.  **Sugestões de Melhoria:** O que poderia ser melhorado na pergunta, opções, explicação ou referência?

**Formato da Resposta (JSON):**
\`\`\`json
{
  "overall_assessment": "Breve resumo da avaliação geral (ex: 'Excelente', 'Boa, com pequenas melhorias', 'Requer revisão significativa').",
  "validity_clarity": "Feedback sobre validade e clareza.",
  "christian_language": "Feedback sobre linguagem cristã.",
  "completeness": "Feedback sobre completude.",
  "theological_coherence": "Feedback sobre coerência teológica.",
  "relevance": "Feedback sobre relevância.",
  "suggestions": "Sugestões de melhoria.",
  "ai_recommendation": "approved" | "rejected" | "manual_review" // Recomendação da IA
}
\`\`\`
`;

    const chatCompletion = await groq.chat.completions.create({
      messages: [{ role: "user", content: prompt }],
      model: "llama3-8b-8192", // Usando um modelo da Groq
      temperature: 0.7,
      max_tokens: 1024,
    });

    const aiFeedbackRaw = chatCompletion.choices[0]?.message?.content || "Não foi possível gerar feedback da IA.";

    // Attempt to parse AI's JSON output
    let aiFeedbackParsed;
    try {
      aiFeedbackParsed = JSON.parse(aiFeedbackRaw);
    } catch (parseError) {
      console.error("Failed to parse AI feedback as JSON:", aiFeedbackRaw, parseError);
      aiFeedbackParsed = {
        overall_assessment: "Erro ao processar feedback da IA. Verifique o formato.",
        suggestions: `Feedback bruto da IA: ${aiFeedbackRaw}`,
        ai_recommendation: "manual_review"
      };
    }

    // Update the question with AI feedback
    const { error: updateError } = await supabaseClient
      .from('community_questions')
      .update({
        ai_review_feedback: JSON.stringify(aiFeedbackParsed),
        // Por enquanto, o status permanece 'pending' para revisão humana.
        // Se você quiser que a IA aproveite automaticamente, pode adicionar lógica aqui:
        // status: aiFeedbackParsed.ai_recommendation === 'approved' ? 'approved' : 'pending',
      })
      .eq('id', questionId);

    if (updateError) {
      throw new Error(updateError.message);
    }

    return new Response(JSON.stringify({ message: 'Question reviewed by AI successfully', aiFeedback: aiFeedbackParsed }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      status: 200,
    });
  } catch (error) {
    console.error('Error in AI review function:', error);
    return new Response(JSON.stringify({ error: error.message }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      status: 500,
    });
  }
});