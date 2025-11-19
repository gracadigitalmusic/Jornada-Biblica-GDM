import { useState, useCallback } from 'react';
import { Question } from '@/types/quiz';
import { FALLBACK_QUESTIONS } from '@/data/questions';
import { useStats } from './useStats';

function shuffle<T>(array: T[]): T[] {
  const arr = [...array];
  for (let i = arr.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [arr[i], arr[j]] = [arr[j], arr[i]];
  }
  return arr;
}

export function useAdaptiveQuestions() {
  const { getCategoryPerformance, getDifficultyPerformance } = useStats();

  const getPersonalizedQuestions = useCallback((numQuestions: number = 10): Question[] => {
    const categoryPerformance = getCategoryPerformance();
    const difficultyPerformance = getDifficultyPerformance();

    // Identificar categorias e dificuldades com menor desempenho
    const weakestCategories = categoryPerformance
      .filter(cat => cat.total > 0 && cat.percentage < 70) // Menos de 70% de acerto
      .sort((a, b) => a.percentage - b.percentage)
      .map(cat => cat.category.toLowerCase().replace(/ /g, '_'));

    const weakestDifficulties = difficultyPerformance
      .filter(diff => diff.total > 0 && diff.percentage < 70) // Menos de 70% de acerto
      .sort((a, b) => a.percentage - b.percentage)
      .map(diff => diff.difficulty.toLowerCase());

    let questionPool: Question[] = [];

    // Priorizar perguntas de categorias e dificuldades mais fracas
    if (weakestCategories.length > 0 || weakestDifficulties.length > 0) {
      questionPool = FALLBACK_QUESTIONS.filter(q => 
        weakestCategories.includes(q.category) || weakestDifficulties.includes(q.difficulty)
      );
    }

    // Se não houver áreas fracas ou poucas perguntas, use perguntas gerais
    if (questionPool.length < numQuestions / 2) {
      const remainingNeeded = numQuestions - questionPool.length;
      const generalQuestions = FALLBACK_QUESTIONS.filter(q => !questionPool.some(pq => pq.id === q.id));
      questionPool = [...questionPool, ...shuffle(generalQuestions).slice(0, remainingNeeded)];
    }

    // Garante que a pool tenha perguntas suficientes, se possível
    if (questionPool.length < numQuestions) {
      const additionalQuestions = FALLBACK_QUESTIONS.filter(q => !questionPool.some(pq => pq.id === q.id));
      questionPool = [...questionPool, ...shuffle(additionalQuestions).slice(0, numQuestions - questionPool.length)];
    }

    return shuffle(questionPool).slice(0, numQuestions);
  }, [getCategoryPerformance, getDifficultyPerformance]);

  return {
    getPersonalizedQuestions,
  };
}