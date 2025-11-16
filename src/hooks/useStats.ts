import { useState, useEffect, useCallback } from 'react';
import { useLocalStorage } from './useLocalStorage';
import { Question } from '@/types/quiz';

interface CategoryStats {
  total: number;
  correct: number;
}

interface PerformanceHistory {
  date: string;
  score: number;
  correctAnswers: number;
  wrongAnswers: number;
  timeSpent: number; // em segundos
}

interface PlayerStats {
  categories: Record<string, CategoryStats>;
  history: PerformanceHistory[];
}

const defaultStats: PlayerStats = {
  categories: {},
  history: [],
};

export function useStats() {
  const [stats, setStats] = useLocalStorage<PlayerStats>('jb_player_stats', defaultStats);

  const logAnswer = useCallback((question: Question, correct: boolean, timeSpent: number) => {
    setStats(prev => {
      const category = question.category;
      const newStats = { ...prev };

      // 1. Atualizar estatísticas por categoria
      if (!newStats.categories[category]) {
        newStats.categories[category] = { total: 0, correct: 0 };
      }
      newStats.categories[category].total++;
      if (correct) {
        newStats.categories[category].correct++;
      }

      // 2. Adicionar ao histórico (se for o fim de uma sessão, isso será feito separadamente)
      // Aqui, apenas registramos a resposta individual para o cálculo de categoria.

      return newStats;
    });
  }, [setStats]);

  const logSession = useCallback((
    score: number,
    correctAnswers: number,
    wrongAnswers: number,
    totalTimeSpent: number,
  ) => {
    setStats(prev => {
      const newHistory: PerformanceHistory = {
        date: new Date().toISOString(),
        score,
        correctAnswers,
        wrongAnswers,
        timeSpent: totalTimeSpent,
      };

      return {
        ...prev,
        history: [newHistory, ...prev.history].slice(0, 50), // Mantém os últimos 50 registros
      };
    });
  }, [setStats]);

  const getCategoryPerformance = useCallback(() => {
    return Object.entries(stats.categories).map(([category, data]) => ({
      category: category.replace(/_/g, ' ').toUpperCase(),
      total: data.total,
      correct: data.correct,
      percentage: data.total > 0 ? Math.round((data.correct / data.total) * 100) : 0,
    })).sort((a, b) => b.total - a.total);
  }, [stats.categories]);

  return {
    stats,
    logAnswer,
    logSession,
    getCategoryPerformance,
  };
}