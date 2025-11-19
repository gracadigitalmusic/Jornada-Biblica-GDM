import { useState, useEffect, useCallback } from 'react';
import { FALLBACK_QUESTIONS } from '@/data/questions';
import { toast } from '@/hooks/use-toast';
import { useQuestionCache } from './useQuestionCache';
import { supabase } from '@/integrations/supabase/client'; // Importar Supabase client
import { Question } from '@/types/quiz'; // Importar Question type

export function useOfflineMode() {
  const { isReady: isCacheReady, lastSyncTime, cacheQuestions, loadQuestions, clearCache } = useQuestionCache();
  
  const [isOffline, setIsOffline] = useState(!navigator.onLine);
  const [isDataCached, setIsDataCached] = useState(false);
  const [isServiceWorkerReady, setIsServiceWorkerReady] = useState(false);

  // Monitora status da conexão
  useEffect(() => {
    const handleOnline = () => setIsOffline(false);
    const handleOffline = () => setIsOffline(true);

    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);

    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
    };
  }, []);

  // Registra e gerencia o service worker (mantido para updates de app shell)
  useEffect(() => {
    if ('serviceWorker' in navigator) {
      navigator.serviceWorker
        .register('/sw.js')
        .then((registration) => {
          console.log('Service Worker registrado:', registration);
          setIsServiceWorkerReady(true);

          // Verifica se há atualizações
          registration.addEventListener('updatefound', () => {
            const newWorker = registration.installing;
            if (newWorker) {
              newWorker.addEventListener('statechange', () => {
                if (newWorker.state === 'installed' && navigator.serviceWorker.controller) {
                  // Nova versão disponível
                  if (confirm('Nova versão disponível! Deseja atualizar agora?')) {
                    newWorker.postMessage({ type: 'SKIP_WAITING' });
                    window.location.reload();
                  }
                }
              });
            }
          });
        })
        .catch((error) => {
          console.error('Erro ao registrar Service Worker:', error);
        });
    }
  }, []);

  // Verifica se os dados estão em cache (usando o novo hook)
  useEffect(() => {
    if (isCacheReady) {
      loadQuestions().then(questions => {
        setIsDataCached(questions.length > 0); // Verifica se há dados no cache
      });
    }
  }, [isCacheReady, loadQuestions]);

  // Função para buscar perguntas do Supabase
  const fetchQuestionsFromSupabase = useCallback(async (): Promise<Question[]> => {
    const { data, error } = await supabase.from('questions').select('*');
    if (error) {
      console.error('Erro ao buscar perguntas do Supabase:', error);
      return []; // Retorna array vazio em caso de erro
    }
    return data as Question[];
  }, []);

  // Faz download das perguntas para cache offline (IndexedDB)
  const downloadForOffline = useCallback(async () => {
    if (!isCacheReady) {
      throw new Error('Sistema de cache não está pronto');
    }

    try {
      const questionsToCache = await fetchQuestionsFromSupabase();
      if (questionsToCache.length === 0) {
        throw new Error('Nenhuma pergunta encontrada para cachear.');
      }
      const success = await cacheQuestions(questionsToCache);
      
      if (success) {
        setIsDataCached(true);
        return true;
      }
      return false;
    } catch (error) {
      console.error('Erro ao fazer download offline:', error);
      throw error;
    }
  }, [isCacheReady, cacheQuestions, fetchQuestionsFromSupabase]);

  // Carrega perguntas do cache offline
  const loadOfflineQuestions = useCallback(async () => {
    if (!isCacheReady) return FALLBACK_QUESTIONS; // Fallback para perguntas embutidas se o cache não estiver pronto
    
    const questions = await loadQuestions();
    
    if (questions.length > 0) {
      return questions;
    }
    
    // Fallback para as perguntas embutidas se o cache estiver vazio
    return FALLBACK_QUESTIONS;
  }, [isCacheReady, loadQuestions]);

  // Limpa cache offline
  const clearOfflineCache = useCallback(async () => {
    await clearCache();
    setIsDataCached(false);
  }, [clearCache]);

  // Sincroniza dados automaticamente quando online
  const syncData = useCallback(async () => {
    if (!isOffline && isCacheReady) {
      try {
        const questionsFromSupabase = await fetchQuestionsFromSupabase();
        if (questionsFromSupabase.length > 0) {
          await cacheQuestions(questionsFromSupabase);
          toast({
            title: "📥 Dados atualizados!",
            description: `${questionsFromSupabase.length} perguntas sincronizadas com sucesso.`,
          });
        }
      } catch (error) {
        console.error('Erro na sincronização automática:', error);
      }
    }
  }, [isOffline, isCacheReady, fetchQuestionsFromSupabase, cacheQuestions]);

  // Sincroniza automaticamente quando volta online
  useEffect(() => {
    if (!isOffline && isDataCached) {
      const timer = setTimeout(() => {
        syncData();
      }, 2000); // Aguarda 2s após reconectar
      
      return () => clearTimeout(timer);
    }
  }, [isOffline, isDataCached, syncData]);

  return {
    isOffline,
    isDataCached,
    isServiceWorkerReady,
    lastSyncTime,
    downloadForOffline,
    loadOfflineQuestions,
    clearOfflineCache,
    syncData,
  };
}