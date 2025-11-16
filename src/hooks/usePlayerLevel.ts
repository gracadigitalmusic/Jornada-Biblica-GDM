import { useState, useEffect, useCallback } from 'react';
import { PlayerLevel } from '@/types/quiz';

const LEVELS: PlayerLevel[] = [
  { level: 1, title: "Iniciante", minScore: 0, benefits: ["Bem-vindo à jornada!"], extraLives: 0, extraHints: 0 },
  { level: 2, title: "Discípulo", minScore: 1000, benefits: ["+1 Vida inicial", "Dicas mais eficientes"], extraLives: 1, extraHints: 0 },
  { level: 3, title: "Apóstolo", minScore: 5000, benefits: ["+1 Vida inicial", "+1 Dica inicial"], extraLives: 1, extraHints: 1 },
  { level: 4, title: "Mestre", minScore: 15000, benefits: ["+2 Vidas iniciais", "+1 Dica inicial", "Acesso a categorias avançadas"], extraLives: 2, extraHints: 1 },
  { level: 5, title: "Teólogo", minScore: 50000, benefits: ["+2 Vidas iniciais", "+2 Dicas iniciais", "Todas as categorias", "Multiplicador de pontos +10%"], extraLives: 2, extraHints: 2 },
];

export function usePlayerLevel() {
  const [totalScore, setTotalScore] = useState(0);
  const [currentLevel, setCurrentLevel] = useState<PlayerLevel>(LEVELS[0]);

  useEffect(() => {
    const stored = localStorage.getItem('jb_total_score');
    if (stored) {
      const score = parseInt(stored);
      setTotalScore(score);
      updateLevel(score);
    }
  }, []);

  const updateLevel = useCallback((score: number) => {
    for (let i = LEVELS.length - 1; i >= 0; i--) {
      if (score >= LEVELS[i].minScore) {
        setCurrentLevel(LEVELS[i]);
        break;
      }
    }
  }, []);

  const addScore = useCallback((points: number) => {
    const newScore = totalScore + points;
    const oldLevel = currentLevel.level;
    setTotalScore(newScore);
    localStorage.setItem('jb_total_score', newScore.toString());
    updateLevel(newScore);
    
    // Check if leveled up
    const newLevel = LEVELS.find(l => newScore >= l.minScore && newScore < (LEVELS[LEVELS.findIndex(x => x === l) + 1]?.minScore || Infinity));
    if (newLevel && newLevel.level > oldLevel) {
      return true; // Leveled up!
    }
    return false;
  }, [totalScore, currentLevel, updateLevel]);

  const getNextLevel = useCallback(() => {
    const nextLevelIndex = LEVELS.findIndex(l => l.level === currentLevel.level + 1);
    return nextLevelIndex >= 0 ? LEVELS[nextLevelIndex] : null;
  }, [currentLevel]);

  const getProgressToNextLevel = useCallback(() => {
    const next = getNextLevel();
    if (!next) return 100;
    
    const current = currentLevel.minScore;
    const range = next.minScore - current;
    const progress = totalScore - current;
    return Math.min((progress / range) * 100, 100);
  }, [totalScore, currentLevel, getNextLevel]);

  return {
    totalScore,
    currentLevel,
    getNextLevel,
    getProgressToNextLevel,
    addScore,
    allLevels: LEVELS,
  };
}
