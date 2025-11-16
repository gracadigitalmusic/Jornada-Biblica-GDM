import { useState, useEffect, useCallback } from 'react';
import { useLocalStorage } from './useLocalStorage';
import { Question, ShopItem } from '@/types/quiz';
import { FALLBACK_QUESTIONS } from '@/data/questions';
import { toast } from '@/hooks/use-toast';

interface DailyChallenge {
  date: string;
  questionId: string;
  targetScore: number;
  rewardCoins: number;
  rewardItem?: ShopItem;
  isCompleted: boolean;
  currentProgress: number;
}

const CHALLENGE_REWARDS = [
  { target: 500, coins: 100, item: { id: 'powerup_bundle', name: 'Pacote de Power-ups', icon: '🎁' } },
  { target: 1000, coins: 250, item: { id: 'effect_holy_light', name: 'Luz Sagrada', icon: '✨' } },
];

function getTodayDate() {
  return new Date().toISOString().split('T')[0];
}

function selectRandomQuestion(): Question {
  const questions = FALLBACK_QUESTIONS.filter(q => q.difficulty === 'hard');
  const randomIndex = Math.floor(Math.random() * questions.length);
  return questions[randomIndex];
}

export function useDailyChallenge() {
  const [challenge, setChallenge] = useLocalStorage<DailyChallenge | null>('jb_daily_challenge', null);

  const generateNewChallenge = useCallback((date: string) => {
    const reward = CHALLENGE_REWARDS[Math.floor(Math.random() * CHALLENGE_REWARDS.length)];
    const question = selectRandomQuestion();

    const newChallenge: DailyChallenge = {
      date,
      questionId: question.id,
      targetScore: reward.target,
      rewardCoins: reward.coins,
      rewardItem: reward.item as ShopItem,
      isCompleted: false,
      currentProgress: 0,
    };
    setChallenge(newChallenge);
  }, [setChallenge]);

  useEffect(() => {
    const today = getTodayDate();
    if (!challenge || challenge.date !== today) {
      generateNewChallenge(today);
    }
  }, [challenge, generateNewChallenge]);

  const updateProgress = useCallback((scoreGained: number) => {
    if (!challenge || challenge.isCompleted) return;

    setChallenge(prev => {
      if (!prev) return null;
      
      const newProgress = Math.min(prev.currentProgress + scoreGained, prev.targetScore);
      const isCompleted = newProgress >= prev.targetScore;

      if (isCompleted && !prev.isCompleted) {
        toast({
          title: "Desafio Diário Completo! 🌟",
          description: `Você ganhou ${prev.rewardCoins} moedas!`,
          duration: 5000,
        });
        // A lógica de adicionar moedas e itens será feita no Index.tsx
      }

      return {
        ...prev,
        currentProgress: newProgress,
        isCompleted,
      };
    });
  }, [challenge, setChallenge]);

  const claimReward = useCallback(() => {
    if (!challenge || !challenge.isCompleted) return { coins: 0, item: null };
    
    const reward = { coins: challenge.rewardCoins, item: challenge.rewardItem };
    
    // Marca como resgatado (para evitar resgate duplo)
    setChallenge(prev => prev ? { ...prev, isCompleted: true } : null);
    
    return reward;
  }, [challenge, setChallenge]);

  return {
    challenge,
    updateProgress,
    claimReward,
  };
}