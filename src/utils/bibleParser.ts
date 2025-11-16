/**
 * Utilitário para fazer parsing de referências bíblicas e buscar texto
 */

interface BibleReference {
  book: string;
  chapter: number;
  verseStart: number;
  verseEnd?: number;
}

/**
 * Faz parsing de uma referência bíblica (ex: "Gênesis 1:1-5")
 */
export function parseBibleReference(reference: string): BibleReference | null {
  try {
    // Remove espaços extras
    const cleaned = reference.trim();
    
    // Regex para capturar: Livro Capítulo:Verso ou Livro Capítulo:Verso-Verso
    const match = cleaned.match(/^(.+?)\s+(\d+):(\d+)(?:-(\d+))?$/);
    
    if (!match) return null;
    
    const [, book, chapter, verseStart, verseEnd] = match;
    
    return {
      book: book.trim(),
      chapter: parseInt(chapter),
      verseStart: parseInt(verseStart),
      verseEnd: verseEnd ? parseInt(verseEnd) : undefined,
    };
  } catch (error) {
    console.error('Erro ao fazer parse da referência:', error);
    return null;
  }
}

/**
 * Busca o texto bíblico de leitura.html (simulado por enquanto)
 * TODO: Implementar leitura real do arquivo leitura.html
 */
export async function fetchBibleText(reference: string): Promise<string> {
  const parsed = parseBibleReference(reference);
  
  if (!parsed) {
    return 'Referência bíblica inválida.';
  }
  
  try {
    // TODO: Implementar busca real no arquivo leitura.html
    // Por enquanto, retorna um texto de exemplo
    
    const { book, chapter, verseStart, verseEnd } = parsed;
    const verseRange = verseEnd ? `${verseStart}-${verseEnd}` : verseStart;
    
    // Simula um delay de busca
    await new Promise(resolve => setTimeout(resolve, 500));
    
    // Texto de exemplo baseado em algumas referências comuns
    const exampleTexts: Record<string, string> = {
      'Gênesis 1:1': '"No princípio, Deus criou os céus e a terra."',
      'João 3:16': '"Porque Deus amou o mundo de tal maneira que deu o seu Filho unigênito, para que todo aquele que nele crê não pereça, mas tenha a vida eterna."',
      'Salmos 23:1': '"O Senhor é o meu pastor; nada me faltará."',
      'Provérbios 3:5-6': '"Confia no Senhor de todo o teu coração e não te estribes no teu próprio entendimento. Reconhece-o em todos os teus caminhos, e ele endireitará as tuas veredas."',
    };
    
    // Busca o texto exato ou retorna um placeholder
    const fullRef = `${book} ${chapter}:${verseRange}`;
    
    return exampleTexts[fullRef] || 
      `"${book} ${chapter}:${verseRange}\n\n[Texto completo será carregado do arquivo leitura.html. Por enquanto, esta é uma prévia do sistema.]"\n\nEsta passagem nos ensina importantes lições sobre a fé e o relacionamento com Deus.`;
    
  } catch (error) {
    console.error('Erro ao buscar texto bíblico:', error);
    return 'Erro ao carregar o texto bíblico. Tente novamente.';
  }
}

/**
 * Formata uma referência bíblica para exibição
 */
export function formatBibleReference(reference: string): string {
  const parsed = parseBibleReference(reference);
  
  if (!parsed) return reference;
  
  const { book, chapter, verseStart, verseEnd } = parsed;
  const verseRange = verseEnd ? `${verseStart}-${verseEnd}` : verseStart;
  
  return `${book} ${chapter}:${verseRange}`;
}
