import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { GoogleGenerativeAI } from 'https://esm.sh/@google/generative-ai@0.15.0';
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
      Deno.env.get('SUPABASE_URL') ?? '',
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

    const GOOGLE_API_KEY = Deno.env.get('GOOGLE_API_KEY');
    if (!GOOGLE_API_KEY) {
      throw new Error('GOOGLE_API_KEY not set in Supabase secrets.');
    }

    const genAI = new GoogleGenerativeAI(GOOGLE_API_KEY);
    const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" });

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

    const result = await model.generateContent(prompt);
    const response = await result.response;
    const aiFeedbackRaw = response.text();

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