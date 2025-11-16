import { useState } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';

export function useAINarrator() {
  const [isLoading, setIsLoading] = useState(false);
  const [lastNarration, setLastNarration] = useState<string>('');

  const getNarration = async (context: string, playerAction: string, chapterInfo?: string) => {
    setIsLoading(true);
    try {
      const { data, error } = await supabase.functions.invoke('ai-narrator', {
        body: { context, playerAction, chapterInfo }
      });

      if (error) {
        if (error.message?.includes('429')) {
          toast.error('Muitas requisições. Aguarde um momento.');
        } else if (error.message?.includes('402')) {
          toast.error('Créditos da IA esgotados.');
        } else {
          toast.error('Erro ao obter narração');
        }
        throw error;
      }

      const narrative = data.narrative;
      setLastNarration(narrative);
      return narrative;
    } catch (error) {
      console.error('Erro ao obter narração:', error);
      return null;
    } finally {
      setIsLoading(false);
    }
  };

  return {
    getNarration,
    isLoading,
    lastNarration
  };
}
