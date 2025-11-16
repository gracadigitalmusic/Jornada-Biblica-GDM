import { useState, useCallback, useEffect } from 'react';
import { Question, Player } from '@/types/quiz';
import { FALLBACK_QUESTIONS, GAME_CONSTANTS } from '@/data/questions';

function shuffle<T>(array: T[]): T[] {
  const arr = [...array];
  for (let i = arr.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [arr[i], arr[j]] = [arr[j], arr[i]];
  }
  return arr;
}

export function useQuizGame() {
  const [questions, setQuestions] = useState<Question[]>([]);
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [players, setPlayers] = useState<Player[]>([]);
  const [currentPlayerIndex, setCurrentPlayerIndex] = useState(0);
  const [lives, setLives] = useState(GAME_CONSTANTS.LIVES_PER_SESSION);
  const [hints, setHints] = useState(GAME_CONSTANTS.HINTS_PER_SESSION);
  const [combo, setCombo] = useState(0);
  const [timeRemaining, setTimeRemaining] = useState(GAME_CONSTANTS.TIME_PER_QUESTION);
  const [isTimerRunning, setIsTimerRunning] = useState(false);
  const [sessionWrongAnswers, setSessionWrongAnswers] = useState(0);
  const [sessionHintUsed, setSessionHintUsed] = useState(false);
  const [hintUsedOnQuestion, setHintUsedOnQuestion] = useState(false);

  useEffect(() => {
    let interval: NodeJS.Timeout;
    
    if (isTimerRunning && timeRemaining > 0) {
      interval = setInterval(() => {
        setTimeRemaining((prev) => {
          if (prev <= 0.1) {
            setIsTimerRunning(false);
            return 0;
          }
          return prev - 0.1;
        });
      }, 100);
    }

    return () => clearInterval(interval);
  }, [isTimerRunning, timeRemaining]);

  const initializeGame = useCallback((playersList: Player[], numQuestions: number) => {
    const availableQuestions = FALLBACK_QUESTIONS.filter(q => !q.isKids);
    const shuffled = shuffle(availableQuestions);
    const selected = shuffled.slice(0, Math.min(numQuestions, shuffled.length));
    
    setQuestions(selected);
    setPlayers(playersList.map(p => ({ ...p, score: 0 })));
    setCurrentQuestionIndex(0);
    setCurrentPlayerIndex(0);
    setLives(GAME_CONSTANTS.LIVES_PER_SESSION);
    setHints(GAME_CONSTANTS.HINTS_PER_SESSION);
    setCombo(0);
    setTimeRemaining(GAME_CONSTANTS.TIME_PER_QUESTION);
    setSessionWrongAnswers(0);
    setSessionHintUsed(false);
    setHintUsedOnQuestion(false);
    setIsTimerRunning(true);
    return selected[0]?.question; // Retorna o texto da primeira pergunta
  }, []);

  const useHint = useCallback(() => {
    if (hints <= 0) return null;
    
    setHints(prev => prev - 1);
    setSessionHintUsed(true);
    setHintUsedOnQuestion(true);
    setCombo(0);

    const currentQuestion = questions[currentQuestionIndex];
    if (!currentQuestion) return null;

    const wrongIndices: number[] = [];
    currentQuestion.options.forEach((_, idx) => {
      if (idx !== currentQuestion.answer) {
        wrongIndices.push(idx);
      }
    });

    shuffle(wrongIndices);
    return wrongIndices.slice(0, 2);
  }, [hints, questions, currentQuestionIndex]);

  const answerQuestion = useCallback((selectedIndex: number) => {
    setIsTimerRunning(false);
    
    const currentQuestion = questions[currentQuestionIndex];
    if (!currentQuestion) return { correct: false, pointsEarned: 0, timeRemaining: 0 };

    const correct = selectedIndex === currentQuestion.answer;
    let pointsEarned = 0;

    if (correct) {
      const basePoints = GAME_CONSTANTS.POINTS[currentQuestion.difficulty] || GAME_CONSTANTS.POINTS['medium'];
      const timeBonus = Math.floor(GAME_CONSTANTS.TIME_BONUS_MAX * (timeRemaining / GAME_CONSTANTS.TIME_PER_QUESTION));

      if (hintUsedOnQuestion) {
        pointsEarned = basePoints;
      } else {
        if (players.length === 1) { // Solo mode
          const newCombo = combo + 1;
          setCombo(newCombo);
          const comboMultiplier = 1 + (newCombo * GAME_CONSTANTS.COMBO_MULTIPLIER);
          pointsEarned = Math.floor((basePoints + timeBonus) * comboMultiplier);
        } else { // Multiplayer
          pointsEarned = basePoints + timeBonus;
        }
      }

      setPlayers(prev => prev.map((p, idx) => 
        idx === currentPlayerIndex ? { ...p, score: p.score + pointsEarned } : p
      ));
    } else {
      if (players.length === 1) { // Solo mode
        setLives(prev => prev - 1);
      }
      setCombo(0);
      setSessionWrongAnswers(prev => prev + 1);
    }

    return { correct, pointsEarned, timeRemaining };
  }, [questions, currentQuestionIndex, timeRemaining, hintUsedOnQuestion, combo, players, currentPlayerIndex]);

  const handleTimeout = useCallback(() => {
    setIsTimerRunning(false);
    
    if (players.length === 1) {
      setLives(prev => prev - 1);
    }
    setCombo(0);
    setSessionWrongAnswers(prev => prev + 1);

    return { correct: false, pointsEarned: 0, timeRemaining: 0 };
  }, [players]);

  const nextQuestion = useCallback(() => {
    const nextPlayerIndex = (currentPlayerIndex + 1) % players.length;
    setCurrentPlayerIndex(nextPlayerIndex);
    
    let nextQuestionIndex = currentQuestionIndex;
    if (nextPlayerIndex === 0) {
      // Completed round, move to next question
      nextQuestionIndex = currentQuestionIndex + 1;
      setCurrentQuestionIndex(nextQuestionIndex);
    }
    
    setTimeRemaining(GAME_CONSTANTS.TIME_PER_QUESTION);
    setHintUsedOnQuestion(false);
    setIsTimerRunning(true);
    return questions[nextQuestionIndex]?.question; // Retorna o texto da próxima pergunta
  }, [currentPlayerIndex, players.length, currentQuestionIndex, questions]);

  const isGameOver = useCallback(() => {
    return (players.length === 1 && lives <= 0) || currentQuestionIndex >= questions.length;
  }, [players.length, lives, currentQuestionIndex, questions.length]);

  return {
    questions,
    currentQuestionIndex,
    currentQuestion: questions[currentQuestionIndex],
    players,
    currentPlayerIndex,
    currentPlayer: players[currentPlayerIndex],
    lives,
    hints,
    combo,
    timeRemaining,
    isTimerRunning,
    sessionWrongAnswers,
    sessionHintUsed,
    hintUsedOnQuestion,
    initializeGame,
    useHint,
    answerQuestion,
    handleTimeout,
    nextQuestion,
    isGameOver,
    totalQuestions: questions.length,
  };
}