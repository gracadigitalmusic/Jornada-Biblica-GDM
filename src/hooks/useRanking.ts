import { useState, useEffect, useCallback } from 'react';
import { RankingEntry } from '@/types/quiz';

export function useRanking() {
  const [ranking, setRanking] = useState<RankingEntry[]>([]);

  useEffect(() => {
    loadRanking();
  }, []);

  const loadRanking = useCallback(() => {
    try {
      const stored = localStorage.getItem('jb_local_ranking');
      if (stored) {
        setRanking(JSON.parse(stored));
      }
    } catch (error) {
      console.error('Error loading ranking:', error);
    }
  }, []);

  const addScore = useCallback((entry: RankingEntry) => {
    if (entry.score <= 0) return;

    try {
      let newRanking = [...ranking, entry];
      newRanking.sort((a, b) => b.score - a.score);
      newRanking = newRanking.slice(0, 10);
      
      localStorage.setItem('jb_local_ranking', JSON.stringify(newRanking));
      setRanking(newRanking);
    } catch (error) {
      console.error('Error saving ranking:', error);
    }
  }, [ranking]);

  return {
    ranking,
    addScore,
    loadRanking,
  };
}
