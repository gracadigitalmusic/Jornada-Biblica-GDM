import { useState } from 'react';
import { fetchBibleText as fetchBibleTextUtil, formatBibleReference } from '@/utils/bibleParser';

export function useBibleReference() {
  const [isLoading, setIsLoading] = useState(false);
  const [bibleText, setBibleText] = useState<string | null>(null);

  const fetchBibleText = async (reference: string): Promise<string> => {
    setIsLoading(true);
    try {
      // Usa a função utilitária para buscar o texto
      const text = await fetchBibleTextUtil(reference);
      setBibleText(text);
      return text;
    } catch (error) {
      console.error('Erro ao buscar texto bíblico:', error);
      const errorMsg = 'Erro ao carregar o texto bíblico. Tente novamente.';
      setBibleText(errorMsg);
      return errorMsg;
    } finally {
      setIsLoading(false);
    }
  };

  const clearBibleText = () => {
    setBibleText(null);
  };

  return { 
    fetchBibleText, 
    bibleText, 
    isLoading, 
    clearBibleText,
    formatReference: formatBibleReference 
  };
}
