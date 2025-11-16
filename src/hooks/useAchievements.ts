import { useState, useEffect, useCallback } from 'react';
import { Achievement, AchievementData } from '@/types/quiz';
import { toast } from '@/hooks/use-toast';
import { useGameSounds } from './useGameSounds';

const ACHIEVEMENT_DEFINITIONS: Record<string, { title: string; desc: string }> = {
  'start': { title: "Iniciante", desc: "Começou o seu primeiro jogo." },
  'first_wrong': { title: "Humildade", desc: "Errou uma pergunta. \"O saber ensoberbece...\"" },
  'correct_10': { title: "Estudioso", desc: "Acertou 10 perguntas no total." },
  'correct_50': { title: "Escriba", desc: "Acertou 50 perguntas no total." },
  'correct_100': { title: "Sábio", desc: "Acertou 100 perguntas no total." },
  'correct_250': { title: "Teólogo", desc: "Acertou 250 perguntas no total." },
  'correct_500': { title: "Mestre da Palavra", desc: "Acertou 500 perguntas no total." },
  'combo_3': { title: "Fogo do Espírito", desc: "Alcançou um combo de 3 acertos." },
  'combo_5': { title: "Em Chamas!", desc: "Alcançou um combo de 5 acertos seguidos." },
  'combo_10': { title: "Imparável!", desc: "Alcançou um combo de 10 acertos seguidos." },
  'clutch': { title: "No Limite", desc: "Acertou com menos de 2s restantes." },
  'first_timeout': { title: "O Tempo Ruge", desc: "Perdeu a primeira pergunta por tempo." },
  'no_hint': { title: "Fé Inabalável", desc: "Completou uma sessão sem usar dicas." },
  'all_lives': { title: "Escudo da Fé", desc: "Completou uma sessão com todas as 3 vidas." },
  'perfect_session': { title: "Imbatível", desc: "Completou uma sessão sem erros." },
  'session_10': { title: "Perseverante", desc: "Jogou 10 sessões no total." },
  
  // Story Mode Achievements
  'story_genesis': { title: "No Princípio", desc: "Completou o capítulo Gênesis." },
  'story_exodus': { title: "Libertador", desc: "Completou o capítulo Êxodo." },
  'story_prophets': { title: "Mensageiro", desc: "Completou o capítulo dos Profetas." },
  'story_jesus': { title: "Seguidor do Messias", desc: "Completou o capítulo de Jesus." },
  'story_apostles': { title: "Testemunha", desc: "Completou o capítulo dos Apóstolos." },
  'story_revelation': { title: "Visionário", desc: "Completou o capítulo Apocalipse." },
  'story_all': { title: "Cronista Sagrado", desc: "Completou todos os capítulos do Modo História." },
  'story_no_death': { title: "Guardião da Fé", desc: "Completou um capítulo sem perder vidas." },
  'story_perfect': { title: "Iluminado", desc: "Completou um capítulo com 100% de acertos." },
  
  // Co-op Achievements
  'coop_first': { title: "Irmãos em Cristo", desc: "Jogou pela primeira vez no modo cooperativo." },
  'coop_win_5': { title: "Time Ungido", desc: "Completou 5 capítulos em equipe." },
  'coop_perfect': { title: "Harmonia Divina", desc: "Completou um capítulo cooperativo sem erros." },
};

export function useAchievements() {
  const { playAchievement } = useGameSounds();
  const [data, setData] = useState<AchievementData>({
    totalAnswers: 0,
    totalCorrect: 0,
    totalWrong: 0,
    totalTimeouts: 0,
    totalCombos: 0,
    maxCombo: 0,
    unlocked: new Set<string>(),
    totalSessions: 0,
  });

  useEffect(() => {
    try {
      const stored = localStorage.getItem('jb_achievements');
      if (stored) {
        const parsed = JSON.parse(stored);
        setData({
          ...parsed,
          unlocked: new Set(parsed.unlocked || []),
        });
      }
    } catch (error) {
      console.error('Error loading achievements:', error);
    }
  }, []);

  const save = useCallback((newData: AchievementData) => {
    try {
      localStorage.setItem('jb_achievements', JSON.stringify({
        ...newData,
        unlocked: Array.from(newData.unlocked),
      }));
      setData(newData);
    } catch (error) {
      console.error('Error saving achievements:', error);
    }
  }, []);

  const unlock = useCallback((id: string, onCelebrate?: () => void) => {
    if (!ACHIEVEMENT_DEFINITIONS[id] || data.unlocked.has(id)) return;
    
    const newData = {
      ...data,
      unlocked: new Set([...data.unlocked, id]),
    };
    save(newData);

    playAchievement();
    onCelebrate?.();
    toast({
      title: "🏆 Conquista Desbloqueada!",
      description: ACHIEVEMENT_DEFINITIONS[id].title,
      duration: 4000,
    });
  }, [data, save, playAchievement]);

  const logAnswer = useCallback((
    correct: boolean,
    timeRemaining: number,
    combo: number,
    hintUsed: boolean = false,
    onCelebrate?: () => void
  ) => {
    const newData = { ...data };
    newData.totalAnswers++;

    if (correct) {
      newData.totalCorrect++;
      if (combo > 1) newData.totalCombos++;
      if (combo > newData.maxCombo) newData.maxCombo = combo;

      // Check achievements
      if (newData.totalCorrect === 10) unlock('correct_10', onCelebrate);
      if (newData.totalCorrect === 50) unlock('correct_50', onCelebrate);
      if (newData.totalCorrect === 100) unlock('correct_100', onCelebrate);
      if (newData.totalCorrect === 250) unlock('correct_250', onCelebrate);
      if (newData.totalCorrect === 500) unlock('correct_500', onCelebrate);
      if (combo === 3) unlock('combo_3', onCelebrate);
      if (combo === 5) unlock('combo_5', onCelebrate);
      if (combo === 10) unlock('combo_10', onCelebrate);
      if (timeRemaining <= 2.0 && !hintUsed) unlock('clutch', onCelebrate);
    } else {
      if (timeRemaining <= 0) {
        if (newData.totalTimeouts === 0) unlock('first_timeout');
        newData.totalTimeouts++;
      } else {
        if (newData.totalWrong === 0) unlock('first_wrong');
        newData.totalWrong++;
      }
    }

    save(newData);
  }, [data, save, unlock]);

  const logSession = useCallback((
    sessionWrongAnswers: number,
    hintUsedThisSession: boolean,
    livesLeft: number,
    maxLives: number,
    onCelebrate?: () => void
  ) => {
    const newData = { ...data };
    newData.totalSessions++;

    if (sessionWrongAnswers === 0) unlock('perfect_session', onCelebrate);
    if (!hintUsedThisSession) unlock('no_hint', onCelebrate);
    if (livesLeft === maxLives) unlock('all_lives', onCelebrate);
    if (newData.totalSessions === 10) unlock('session_10', onCelebrate);

    save(newData);
  }, [data, save, unlock]);

  const getAchievements = useCallback((): Achievement[] => {
    return Object.entries(ACHIEVEMENT_DEFINITIONS).map(([id, def]) => ({
      id,
      ...def,
      unlocked: data.unlocked.has(id),
    }));
  }, [data.unlocked]);

  const logStoryChapter = useCallback((
    chapterId: string,
    perfect: boolean,
    noDeath: boolean,
    onCelebrate?: () => void
  ) => {
    const newData = { ...data };
    
    // Chapter-specific achievements
    if (chapterId === 'genesis') unlock('story_genesis', onCelebrate);
    if (chapterId === 'exodus') unlock('story_exodus', onCelebrate);
    if (chapterId === 'prophets') unlock('story_prophets', onCelebrate);
    if (chapterId === 'jesus') unlock('story_jesus', onCelebrate);
    if (chapterId === 'apostles') unlock('story_apostles', onCelebrate);
    if (chapterId === 'revelation') unlock('story_revelation', onCelebrate);
    
    // Performance achievements
    if (perfect) unlock('story_perfect', onCelebrate);
    if (noDeath) unlock('story_no_death', onCelebrate);
    
    save(newData);
  }, [data, save, unlock]);

  const logCoopSession = useCallback((
    won: boolean,
    perfect: boolean,
    onCelebrate?: () => void
  ) => {
    const newData = { ...data };
    
    if (!data.unlocked.has('coop_first')) {
      unlock('coop_first', onCelebrate);
    }
    
    if (won && perfect) {
      unlock('coop_perfect', onCelebrate);
    }
    
    save(newData);
  }, [data, save, unlock]);

  return {
    data,
    unlock,
    logAnswer,
    logSession,
    logStoryChapter,
    logCoopSession,
    getAchievements,
  };
}
