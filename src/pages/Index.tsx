import { useState, useEffect, useCallback, lazy, Suspense } from "react";
import { PlayerSetup } from "@/components/quiz/PlayerSetup";
import { GameModals } from "@/components/quiz/GameModals";
import { GameScreens } from "@/components/quiz/GameScreens";
import { useQuizGame } from "@/hooks/useQuizGame";
import { useAchievements } from "@/hooks/useAchievements";
import { useRanking } from "@/hooks/useRanking";
import { usePlayerLevel } from "@/hooks/usePlayerLevel";
import { useCelebration } from "@/hooks/useCelebration";
import { useReviewHistory } from "@/hooks/useReviewHistory";
import { useGameSettings } from "@/hooks/useGameSettings";
import { useNarration } from "@/hooks/useNarration";
import { useStoryMode } from "@/hooks/useStoryMode";
import { useVirtualShop } from "@/hooks/useVirtualShop";
import { useStats } from "@/hooks/useStats";
import { useDailyChallenge } from "@/hooks/useDailyChallenge";
import { useOfflineMode } from "@/hooks/useOfflineMode";
import { useAdaptiveQuestions } from "@/hooks/useAdaptiveQuestions";
import { Player, GameMode, Question } from "@/types/quiz";
import { GAME_CONSTANTS } from "@/data/questions";
import { Loader2 } from "lucide-react";
import { throttle } from "lodash-es";

// Dynamic Imports for Code Splitting
const LazyGameScreens = lazy(() => import("@/components/quiz/GameScreens").then(mod => ({ default: mod.GameScreens })));

const Index = () => {
  const [gameMode, setGameMode] = useState<GameMode>("menu");
  const [setupMode, setSetupMode] = useState<'solo' | 'multiplayer'>('solo');
  const [showPlayerSetup, setShowPlayerSetup] = useState(false);
  const [showRanking, setShowRanking] = useState(false);
  const [showAchievements, setShowAchievements] = useState(false);
  const [showPowerUpShop, setShowPowerUpShop] = useState(false);
  const [showResults, setShowResults] = useState(false);
  const [isGameOverState, setIsGameOverState] = useState(false);
  const [showNextButton, setShowNextButton] = useState(false);
  const [showStats, setShowStats] = useState(false);
  const [showProfile, setShowProfile] = useState(false);
  const [showQuestionSubmission, setShowQuestionSubmission] = useState(false); // Novo estado

  const quiz = useQuizGame();
  const achievements = useAchievements();
  const ranking = useRanking();
  const playerLevel = usePlayerLevel();
  const celebration = useCelebration();
  const reviewHistory = useReviewHistory();
  const { settings, toggleNarration } = useGameSettings();
  const { speak, cancel } = useNarration();
  const storyMode = useStoryMode();
  const virtualShop = useVirtualShop();
  const stats = useStats();
  const dailyChallenge = useDailyChallenge();
  const offlineMode = useOfflineMode();
  const adaptiveQuestions = useAdaptiveQuestions();

  useEffect(() => {
    const handleResize = throttle(() => {
      // Lógica de redimensionamento otimizada
    }, 200);

    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('change', handleResize);
  }, []);

  useEffect(() => {
    if (gameMode === "quiz" && quiz.timeRemaining <= 0 && !showResults) {
      handleTimeout();
    }
  }, [quiz.timeRemaining, gameMode, showResults]);

  useEffect(() => {
    return () => {
      cancel();
    };
  }, [cancel]);

  const handleEndGame = useCallback(() => {
    setGameMode("menu");
    setShowResults(false);
    setIsGameOverState(false);
  }, [setGameMode, setShowResults, setIsGameOverState]);

  const handleQuitQuiz = () => {
    if (confirm("Tem certeza que deseja sair? Seu progresso será perdido.")) {
      cancel();
      handleEndGame();
    }
  };

  const handleGameEnd = useCallback(() => {
    const isGameOver = setupMode === 'solo' && quiz.lives <= 0;
    setIsGameOverState(isGameOver);
    
    if (!isGameOver) {
      achievements.logSession(
        quiz.sessionWrongAnswers,
        quiz.sessionHintUsed,
        quiz.lives,
        GAME_CONSTANTS.LIVES_PER_SESSION,
        () => celebration.celebrateAchievement()
      );

      const totalTimeSpent = quiz.totalQuestions * GAME_CONSTANTS.TIME_PER_QUESTION - quiz.timeRemaining;
      
      stats.logSession(
        quiz.currentPlayer?.score || 0,
        quiz.totalQuestions - quiz.sessionWrongAnswers,
        quiz.sessionWrongAnswers,
        totalTimeSpent
      );

      if (setupMode === 'solo' && quiz.currentPlayer && quiz.currentPlayer.score > 0) {
        ranking.addScore(quiz.currentPlayer);
        
        const leveledUp = playerLevel.addScore(quiz.currentPlayer.score);
        if (leveledUp) {
          setTimeout(() => celebration.celebrateLevelUp(), 500);
        }
      }
      
      if (storyMode.currentChapter) {
        const perfect = quiz.sessionWrongAnswers === 0;
        const noDeath = quiz.lives === GAME_CONSTANTS.LIVES_PER_SESSION;
        storyMode.completeChapter(storyMode.currentChapter);
        achievements.logStoryChapter(
          storyMode.currentChapter,
          perfect,
          noDeath,
          () => celebration.celebrateAchievement()
        );
      }
      
      if (quiz.sessionWrongAnswers === 0) {
        setTimeout(() => celebration.celebrateVictory(), 1000);
      }
    }

    setGameMode("results");
  }, [
    setupMode, 
    quiz.lives, 
    quiz.sessionWrongAnswers, 
    quiz.sessionHintUsed, 
    quiz.totalQuestions, 
    quiz.timeRemaining, 
    quiz.currentPlayer, 
    storyMode.currentChapter,
    setIsGameOverState,
    achievements,
    celebration,
    stats,
    ranking,
    playerLevel,
    storyMode,
    setGameMode
  ]);

  const handleStartSolo = () => {
    setSetupMode('solo');
    setShowPlayerSetup(true);
  };

  const handleStartMultiplayer = () => {
    setSetupMode('multiplayer');
    setShowPlayerSetup(true);
  };

  const handleStartMarathon = async (player: Player) => {
    const firstQuestionText = await quiz.initializeGame([player], 999, offlineMode.loadOfflineQuestions);
    setGameMode("quiz");
    setSetupMode('solo');
    achievements.unlock('start');
    if (settings.isNarrationEnabled && firstQuestionText) {
      setTimeout(() => speak(firstQuestionText), 500);
    }
  };

  const handleStartStudy = () => setGameMode('study');
  const handleStartTournament = () => {
    setSetupMode('solo');
    setShowPlayerSetup(true);
  };
  const handleStartReview = () => setGameMode('review');
  const handleStartStory = () => setGameMode('story');
  const handleShowRanking = () => {
    ranking.loadRanking();
    setShowRanking(true);
  };
  const handleShowAchievements = () => setShowAchievements(true);
  const handleShowPowerUpShop = () => setShowPowerUpShop(true);
  const handleShowStats = () => setShowStats(true);
  const handleShowProfile = () => setShowProfile(true);
  const handleShowQuestionSubmission = () => setShowQuestionSubmission(true); // Novo handler

  // Removido handlers de CO-OP
  const handleStartCoopEntry = () => {};
  const handleEnterCoopLobby = () => {};
  const handleCoopGameStart = () => {};
  const handleCancelCoop = () => {};

  const handleSelectChapter = (chapterId: string) => {
    storyMode.setCurrentChapter(chapterId);
    const lastUser = localStorage.getItem('jb_last_user');
    const hostPlayer = lastUser ? JSON.parse(lastUser) : { name: 'Peregrino', location: 'Story Mode', score: 0, avatar: '👑' };
    
    // Inicia o modo história como um jogo solo de 10 perguntas
    handlePlayersReady([hostPlayer]);
  };

  const handleStartPersonalizedStudy = async () => {
    setSetupMode('solo');
    const lastUser = localStorage.getItem('jb_last_user');
    const player = lastUser ? JSON.parse(lastUser) : { name: 'Estudioso', location: 'Estudo Personalizado', score: 0, avatar: '🧠' };
    
    const personalizedQuestions: Question[] = adaptiveQuestions.getPersonalizedQuestions(10); // 10 perguntas personalizadas
    
    const firstQuestionText = await quiz.initializeGame([player], personalizedQuestions.length, async () => personalizedQuestions);
    setGameMode("quiz");
    achievements.unlock('start');
    setShowResults(false);
    setIsGameOverState(false);
    setShowNextButton(false);
    if (settings.isNarrationEnabled && firstQuestionText) {
      setTimeout(() => speak(firstQuestionText), 500);
    }
  };

  const handlePlayersReady = async (players: Player[]) => {
    setShowPlayerSetup(false);
    const numQuestions = setupMode === 'solo' ? 10 : 20 + (players.length - 2) * 5;
    const firstQuestionText = await quiz.initializeGame(players, numQuestions, offlineMode.loadOfflineQuestions);
    setGameMode("quiz");
    achievements.unlock('start');
    setShowResults(false);
    setIsGameOverState(false);
    setShowNextButton(false);
    if (settings.isNarrationEnabled && firstQuestionText) {
      setTimeout(() => speak(firstQuestionText), 500);
    }
  };

  const handleAnswer = (selectedIndex: number) => {
    cancel();
    
    const result = selectedIndex === -1 
      ? quiz.handleTimeout() 
      : quiz.answerQuestion(selectedIndex);

    const gainedPoints = result.pointsEarned;
    const didLevelUp = playerLevel.addScore(gainedPoints);
    
    if (quiz.currentQuestion) {
      const timeSpent = GAME_CONSTANTS.TIME_PER_QUESTION - result.timeRemaining;
      stats.logAnswer(quiz.currentQuestion, result.correct, timeSpent);
    }
    
    dailyChallenge.updateProgress(gainedPoints);
    
    if (result.correct) {
      virtualShop.addCoins(gainedPoints);
    }
    
    storyMode.checkUnlocks(playerLevel.totalScore);
    
    if (!result.correct && quiz.currentQuestion) {
      reviewHistory.addIncorrectQuestion(quiz.currentQuestion.id);
    }
    
    achievements.logAnswer(
      result.correct,
      result.timeRemaining,
      quiz.combo,
      quiz.hintUsedOnQuestion,
      () => celebration.celebrateAchievement()
    );

    setShowResults(true);
    setShowNextButton(true);

    if (settings.isNarrationEnabled && quiz.currentQuestion?.explanation) {
      const answerText = `A resposta correta é: ${quiz.currentQuestion.options[quiz.currentQuestion.answer]}. ${quiz.currentQuestion.explanation}`;
      setTimeout(() => speak(answerText), 700);
    }
  };

  const handleNextQuestion = () => {
    cancel();
    setShowNextButton(false);
    
    if (quiz.isGameOver()) {
      handleGameEnd();
    } else {
      const nextQuestionText = quiz.nextQuestion();
      setShowResults(false);
      if (settings.isNarrationEnabled && nextQuestionText) {
        setTimeout(() => speak(nextQuestionText), 500);
      }
    }
  };

  const handleTimeout = () => {
    handleAnswer(-1);
  };

  const handleContinue = () => {
    setShowPlayerSetup(true);
    setGameMode("menu");
  };

  return (
    <div className="relative overflow-hidden min-h-screen overflow-y-auto">
      {/* Animated background elements */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-20 left-10 w-64 h-64 bg-primary/20 rounded-full blur-3xl animate-float" />
        <div className="absolute bottom-20 right-10 w-96 h-96 bg-secondary/20 rounded-full blur-3xl animate-float" style={{ animationDelay: "1s" }} />
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[500px] h-[500px] bg-accent/10 rounded-full blur-3xl animate-float" style={{ animationDelay: "2s" }} />
      </div>

      {/* Game Screens (Lazy Loaded) */}
      <Suspense fallback={
        <div className="flex min-h-screen items-center justify-center">
          <Loader2 className="w-12 h-12 animate-spin text-primary" />
        </div>
      }>
        <LazyGameScreens
          gameMode={gameMode}
          setupMode={setupMode}
          quiz={quiz}
          storyMode={storyMode}
          playerLevel={playerLevel}
          reviewHistory={reviewHistory}
          settings={settings}
          toggleNarration={toggleNarration}
          speak={speak}
          cancel={cancel}
          showNextButton={showNextButton}
          isGameOverState={isGameOverState}
          dailyChallenge={dailyChallenge}
          offlineMode={offlineMode}
          
          onStartSolo={handleStartSolo}
          onStartMultiplayer={handleStartMultiplayer}
          onStartMarathon={handleStartMarathon}
          onStartStudy={handleStartStudy}
          onStartTournament={handleStartTournament}
          onStartStory={handleStartStory}
          onStartCoopEntry={handleStartCoopEntry}
          onShowRanking={handleShowRanking}
          onShowAchievements={handleShowAchievements}
          onShowPowerUpShop={handleShowPowerUpShop}
          onShowReview={handleStartReview}
          onShowStats={handleShowStats}
          onShowProfile={handleShowProfile}
          onSelectChapter={handleSelectChapter}
          onEnterCoopLobby={handleEnterCoopLobby}
          handleCoopGameStart={handleCoopGameStart}
          handleCancelCoop={handleCancelCoop}
          handleAnswer={handleAnswer}
          handleNextQuestion={handleNextQuestion}
          handleQuitQuiz={handleQuitQuiz}
          handleContinue={handleContinue}
          onSetGameMode={setGameMode}
          handleEndGame={handleEndGame}
          onStartPersonalizedStudy={handleStartPersonalizedStudy}
          onShowQuestionSubmission={handleShowQuestionSubmission} // Passar o novo handler
        />
      </Suspense>

      {/* Modals */}
      <PlayerSetup
        open={showPlayerSetup}
        onClose={() => setShowPlayerSetup(false)}
        onStart={handlePlayersReady}
        mode={setupMode}
      />

      <GameModals
        showRanking={showRanking}
        setShowRanking={setShowRanking}
        showAchievements={showAchievements}
        setShowAchievements={setShowAchievements}
        showPowerUpShop={showPowerUpShop}
        setShowPowerUpShop={setShowPowerUpShop}
        showStats={showStats}
        setShowStats={setShowStats}
        showProfile={showProfile}
        setShowProfile={setShowProfile}
        showQuestionSubmission={showQuestionSubmission} // Passar o estado
        setShowQuestionSubmission={setShowQuestionSubmission} // Passar o setter
        onStartSolo={handleStartSolo}
      />
    </div>
  );
};

export default Index;