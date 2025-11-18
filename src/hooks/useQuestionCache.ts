import { useState, useEffect, useCallback } from 'react';
import localforage from 'localforage';
import { Question } from '@/types/quiz';
import { FALLBACK_QUESTIONS } from '@/data/questions';
import { toast } from '@/hooks/use-toast';

const QUESTION_CACHE_KEY = 'jb_question_cache';
const LAST_SYNC_KEY = 'jb_last_sync_time';
const ANSWERED_QUESTIONS_KEY = 'jb_answered_questions';

export function useQuestionCache() {
  const [isReady, setIsReady] = useState(false);
  const [lastSyncTime, setLastSyncTime] = useState<Date | null>(null);

  useEffect(() => {
    localforage.config({
      name: 'JornadaBiblicaDB',
      storeName: 'questions',
    });
    
    // Carrega o último tempo de sincronização
    localforage.getItem(LAST_SYNC_KEY).then((time) => {
      if (time) setLastSyncTime(new Date(time as string));
      setIsReady(true);
    });
  }, []);

  const cacheQuestions = useCallback(async (questions: Question[]) => {
    if (!isReady) return;
    try {
      await localforage.setItem(QUESTION_CACHE_KEY, questions);
      const now = new Date();
      await localforage.setItem(LAST_SYNC_KEY, now.toISOString());
      setLastSyncTime(now);
      return true;
    } catch (error) {
      console.error('Erro ao salvar perguntas no cache:', error);
      return false;
    }
  }, [isReady]);

  const loadQuestions = useCallback(async (): Promise<Question[]> => {
    if (!isReady) return FALLBACK_QUESTIONS;
    try {
      const cached = await localforage.getItem(QUESTION_CACHE_KEY);
      if (cached) {
        return cached as Question[];
      }
    } catch (error) {
      console.error('Erro ao carregar perguntas do cache:', error);
    }
    return FALLBACK_QUESTIONS;
  }, [isReady]);

  const clearCache = useCallback(async () => {
    if (!isReady) return;
    try {
      await localforage.removeItem(QUESTION_CACHE_KEY);
      await localforage.removeItem(LAST_SYNC_KEY);
      setLastSyncTime(null);
      return true;
    } catch (error) {
      console.error('Erro ao limpar cache:', error);
      return false;
    }
  }, [isReady]);

  // Cache de perguntas respondidas para análise e review
  const cacheAnsweredQuestion = useCallback(async (questionId: string, wasCorrect: boolean, timeTaken: number) => {
    if (!isReady) return;
    try {
      const cached = await localforage.getItem(ANSWERED_QUESTIONS_KEY) as any[] || [];
      const entry = {
        questionId,
        wasCorrect,
        timeTaken,
        answeredAt: new Date().toISOString(),
      };
      cached.push(entry);
      // Mantém apenas últimas 500 respostas para não sobrecarregar
      if (cached.length > 500) {
        cached.shift();
      }
      await localforage.setItem(ANSWERED_QUESTIONS_KEY, cached);
      return true;
    } catch (error) {
      console.error('Erro ao salvar pergunta respondida:', error);
      return false;
    }
  }, [isReady]);

  const getAnsweredQuestions = useCallback(async () => {
    if (!isReady) return [];
    try {
      const cached = await localforage.getItem(ANSWERED_QUESTIONS_KEY);
      return (cached as any[]) || [];
    } catch (error) {
      console.error('Erro ao carregar perguntas respondidas:', error);
      return [];
    }
  }, [isReady]);

  return {
    isReady,
    lastSyncTime,
    cacheQuestions,
    loadQuestions,
    clearCache,
    cacheAnsweredQuestion,
    getAnsweredQuestions,
  };
}