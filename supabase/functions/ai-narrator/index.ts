const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

Deno.serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { context, playerAction, chapterInfo } = await req.json();
    
    const LOVABLE_API_KEY = Deno.env.get('LOVABLE_API_KEY');
    if (!LOVABLE_API_KEY) {
      throw new Error('LOVABLE_API_KEY não configurada');
    }

    const systemPrompt = `Você é um narrador bíblico experiente e carismático que conduz os jogadores através de uma jornada épica pela Bíblia. 
    
Seu estilo é:
- Envolvente e dramático, mas respeitoso
- Use linguagem acessível e moderna em português brasileiro
- Crie conexões emocionais com os personagens bíblicos
- Responda de forma dinâmica às ações do jogador
- Mantenha respostas curtas (2-3 frases) para manter o ritmo do jogo
- Use metáforas e comparações que ajudem a entender os conceitos

Contexto atual: ${context || 'Início da jornada'}
Informação do capítulo: ${chapterInfo || 'Introdução'}`;

    const response = await fetch('https://ai.gateway.lovable.dev/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${LOVABLE_API_KEY}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: 'google/gemini-2.5-flash',
        messages: [
          { role: 'system', content: systemPrompt },
          { role: 'user', content: playerAction }
        ],
        temperature: 0.8,
        max_completion_tokens: 150
      }),
    });

    if (!response.ok) {
      if (response.status === 429) {
        return new Response(
          JSON.stringify({ error: 'Limite de requisições atingido. Tente novamente em alguns instantes.' }), 
          { status: 429, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        );
      }
      if (response.status === 402) {
        return new Response(
          JSON.stringify({ error: 'Créditos da IA esgotados. Por favor, adicione créditos.' }), 
          { status: 402, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        );
      }
      throw new Error(`Erro na API: ${response.status}`);
    }

    const data = await response.json();
    const narratorResponse = data.choices[0].message.content;

    return new Response(
      JSON.stringify({ narrative: narratorResponse }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );

  } catch (error) {
    console.error('Erro na função ai-narrator:', error);
    return new Response(
      JSON.stringify({ error: error instanceof Error ? error.message : 'Erro desconhecido' }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
});
