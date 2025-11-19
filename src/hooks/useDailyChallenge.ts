import { useState, useEffect, useCallback } from 'react';
import { useLocalStorage } from './useLocalStorage';
import { Question, ShopItem } from '@/types/quiz';
import { FALLBACK_QUESTIONS, GAME_CONSTANTS } from '@/data/questions';
import { toast } from '@/hooks/use-toast';

interface DailyChallenge {
  date: string;
  type: 'score' | 'combo' | 'category_correct' | 'marathon_score'; // Novos tipos de desafio
  target: number; // Pontos, combo, acertos
  rewardCoins: number;
  rewardItem?: ShopItem;
  isCompleted: boolean;
  currentProgress: number;
  category?: string; // Para desafios de categoria
}

const CHALLENGE_REWARDS = [
  { target: 500, coins: 100, item: { id: 'powerup_bundle', name: 'Pacote de Power-ups', description: 'Um pacote com power-ups aleatórios', icon: '🎁', price: 0, type: 'powerup' as const, rarity: 'rare' } },
  { target: 1000, coins: 250, item: { id: 'effect_holy_light', name: 'Luz Sagrada', description: 'Efeito de luz divina nas respostas corretas', icon: '✨', price: 0, type: 'effect' as const, rarity: 'rare' } },
  { target: 1500, coins: 300, item: { id: 'avatar_prophet', name: 'Avatar Profeta', description: 'Avatar de um sábio profeta', icon: '🧙', price: 0, type: 'avatar' as const, rarity: 'epic' } },
];

function getTodayDate() {
  return new Date().toISOString().split('T')[0];
}

function selectRandomQuestion(): Question {
  const questions = FALLBACK_QUESTIONS.filter(q => q.difficulty === 'hard');
  const randomIndex = Math.floor(Math.random() * questions.length);
  return questions[randomIndex];
}

function selectRandomCategory(): string {
  const categories = Array.from(new Set(FALLBACK_QUESTIONS.map(q => q.category)));
  return categories[Math.floor(Math.random() * categories.length)];
}

export function useDailyChallenge() {
  const [challenge, setChallenge] = useLocalStorage<DailyChallenge | null>('jb_daily_challenge', null);

  const generateNewChallenge = useCallback((date: string) => {
    const reward = CHALLENGE_REWARDS[Math.floor(Math.random() * CHALLENGE_REWARDS.length)];
    
    const challengeTypes: DailyChallenge['type'][] = ['score', 'combo', 'category_correct', 'marathon_score'];
    const randomType = challengeTypes[Math.floor(Math.random() * challengeTypes.length)];

    let newChallenge: DailyChallenge;
    switch (randomType) {
      case 'combo':
        newChallenge = {
          date,
          type: 'combo',
          target: Math.floor(Math.random() * 3) + 3, // Combo de 3 a 5
          rewardCoins: reward.coins,
          rewardItem: reward.item,
          isCompleted: false,
          currentProgress: 0,
        };
        break;
      case 'category_correct':
        const category = selectRandomCategory();
        newChallenge = {
          date,
          type: 'category_correct',
          target: Math.floor(Math.random() * 5) + 5, // 5 a 9 acertos
          rewardCoins: reward.coins,
          rewardItem: reward.item,
          isCompleted: false,
          currentProgress: 0,
          category: category,
        };
        break;
      case 'marathon_score':
        newChallenge = {
          date,
          type: 'marathon_score',
          target: Math.floor(Math.random() * 1000) + 1000, // 1000 a 2000 pontos
          rewardCoins: reward.coins,
          rewardItem: reward.item,
          isCompleted: false,
          currentProgress: 0,
        };
        break;
      case 'score':
      default:
        newChallenge = {
          date,
          type: 'score',
          target: Math.floor(Math.random() * 500) + 500, // 500 a 1000 pontos
          rewardCoins: reward.coins,
          rewardItem: reward.item,
          isCompleted: false,
          currentProgress: 0,
        };
        break;
    }
    setChallenge(newChallenge);
  }, [setChallenge]);

  useEffect(() => {
    const today = getTodayDate();
    if (!challenge || challenge.date !== today) {
      generateNewChallenge(today);
    }
  }, [challenge, generateNewChallenge]);

  const updateProgress = useCallback((
    scoreGained: number, 
    currentCombo: number, 
    questionCategory: string, 
    isCorrect: boolean,
    gameMode: 'solo' | 'marathon' // Adicionado gameMode para diferenciar
  ) => {
    if (!challenge || challenge.isCompleted) return;

    setChallenge(prev => {
      if (!prev) return null;
      
      let newProgress = prev.currentProgress;
      let isCompleted = prev.isCompleted;

      switch (prev.type) {
        case 'score':
          if (gameMode === 'solo') { // Apenas no modo solo rápido
            newProgress = Math.min(prev.currentProgress + scoreGained, prev.target);
          }
          break;
        case 'combo':
          newProgress = Math.max(prev.currentProgress, currentCombo);
          break;
        case 'category_correct':
          if (isCorrect && questionCategory === prev.category) {
            newProgress = Math.min(prev.currentProgress + 1, prev.target);
          }
          break;
        case 'marathon_score':
          if (gameMode === 'marathon') { // Apenas no modo maratona
            newProgress = Math.min(prev.currentProgress + scoreGained, prev.target);
          }
          break;
      }
      
      isCompleted = newProgress >= prev.target;

      if (isCompleted && !prev.isCompleted) {
        toast({
          title: "Desafio Diário Completo! 🌟",
          description: `Você ganhou ${prev.rewardCoins} moedas!`,
          duration: 5000,
        });
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