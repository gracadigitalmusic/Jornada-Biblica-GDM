import { useState, useEffect, useCallback } from "react";
import { PlayerSetup } from "@/components/quiz/PlayerSetup";
import { AICompanion } from "@/components/quiz/AICompanion";
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
import { useCoopMode } from "@/hooks/useCoopMode";
import { Player, GameMode } from "@/types/quiz";
import { GAME_CONSTANTS } from "@/data/questions";

const Index = () => {
  const [gameMode, setGameMode] = useState<GameMode>("menu");
  const [setupMode, setSetupMode] = useState<'solo' | 'multiplayer' | 'coop'>('solo');
  const [showPlayerSetup, setShowPlayerSetup] = useState(false);
  const [showRanking, setShowRanking] = useState(false);
  const [showAchievements, setShowAchievements] = useState(false);
  const [showPowerUpShop, setShowPowerUpShop] = useState(false);
  const [showResults, setShowResults] = useState(false);
  const [isGameOverState, setIsGameOverState] = useState(false);
  const [showNextButton, setShowNextButton] = useState(false);
  const [showStats, setShowStats] = useState(false);
  const [showProfile, setShowProfile] = useState(false);

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
  const coop = useCoopMode();
  const stats = useStats();
  const dailyChallenge = useDailyChallenge();

  // Check for timeout (only for solo/multiplayer local)
  useEffect(() => {
    if (gameMode === "quiz" && setupMode !== 'coop' && quiz.timeRemaining <= 0 && !showResults) {
      handleTimeout();
    }
  }, [quiz.timeRemaining, gameMode, showResults, setupMode]);

  // Stop narration when leaving quiz
  useEffect(() => {
    return () => {
      cancel();
    };
  }, [cancel]);

  const handleEndGame = useCallback(() => {
    setGameMode("menu");
    setShowResults(false);
    setIsGameOverState(false);
    if (setupMode === 'coop') {
      coop.leaveSession();
    }
  }, [setGameMode, setShowResults, setIsGameOverState, setupMode, coop]);

  const handleQuitQuiz = () => {
    if (confirm("Tem certeza que deseja sair? Seu progresso será perdido.")) {
      cancel();
      handleEndGame();
    }
  };

  const handleGameEnd = useCallback(() => {
    const isGameOver = setupMode === 'solo' && quiz.lives <= 0;
    setIsGameOverState(isGameOver);
    
    // Log session for achievements
    if (!isGameOver) {
      achievements.logSession(
        quiz.sessionWrongAnswers,
        quiz.sessionHintUsed,
        quiz.lives,
        GAME_CONSTANTS.LIVES_PER_SESSION,
        () => celebration.celebrateAchievement()
      );

      // Calculate total time spent in session (approximation)
      const totalTimeSpent = quiz.totalQuestions * GAME_CONSTANTS.TIME_PER_QUESTION - quiz.timeRemaining;
      
      // Log session for stats
      stats.logSession(
        quiz.currentPlayer?.score || 0,
        quiz.totalQuestions - quiz.sessionWrongAnswers,
        quiz.sessionWrongAnswers,
        totalTimeSpent
      );

      // Save to ranking if solo
      if (setupMode === 'solo' && quiz.currentPlayer && quiz.currentPlayer.score > 0) {
        ranking.addScore(quiz.currentPlayer);
        
        const leveledUp = playerLevel.addScore(quiz.currentPlayer.score);
        if (leveledUp) {
          setTimeout(() => celebration.celebrateLevelUp(), 500);
        }
      }
      
      // Check for story chapter completion
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

  // --- Handlers for Menu/Setup ---
  const handleStartSolo = () => {
    setSetupMode('solo');
    setShowPlayerSetup(true);
  };

  const handleStartMultiplayer = () => {
    setSetupMode('multiplayer');
    setShowPlayerSetup(true);
  };

  const handleStartMarathon = (player: Player) => {
    const firstQuestionText = quiz.initializeGame([player], 999);
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

  const handleStartCoopEntry = () => setGameMode('coop_entry');
  
  const handleEnterCoopLobby = () => {
    setGameMode('coop_lobby');
    setSetupMode('coop');
  };

  const handleSelectChapter = (chapterId: string) => {
    storyMode.setCurrentChapter(chapterId);
    // Mock player for host
    const lastUser = localStorage.getItem('jb_last_user');
    const hostPlayer = lastUser ? JSON.parse(lastUser) : { name: 'Peregrino', location: 'Story Mode', score: 0, avatar: '👑' };
    coop.createSession(hostPlayer, `Jornada ${chapterId}`, 4, chapterId);
    setSetupMode('coop');
    setGameMode('coop_lobby');
  };

  const handleCoopGameStart = () => {
    // Use players from coop hook, but map them to the quiz game structure
    const playersList: Player[] = coop.players.map(p => ({ 
      name: p.name, 
      location: coop.session?.teamName || 'Co-op', 
      score: 0, 
      avatar: p.avatar 
    }));
    
    const numQuestions = 10; 
    const firstQuestionText = quiz.initializeGame(playersList, numQuestions);
    setGameMode('quiz');
    
    if (settings.isNarrationEnabled && firstQuestionText) {
      setTimeout(() => speak(firstQuestionText), 500);
    }
  };

  const handleCancelCoop = () => {
    coop.leaveSession();
    setGameMode('menu');
    setSetupMode('solo');
  };

  const handlePlayersReady = (players: Player[]) => {
    setShowPlayerSetup(false);
    const numQuestions = setupMode === 'solo' ? 10 : 20 + (players.length - 2) * 5;
    const firstQuestionText = quiz.initializeGame(players, numQuestions);
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
    
    // Use quiz.answerQuestion logic for score calculation
    const result = selectedIndex === -1 
      ? quiz.handleTimeout() 
      : quiz.answerQuestion(selectedIndex);

    const gainedPoints = result.pointsEarned;
    const didLevelUp = playerLevel.addScore(gainedPoints);
    
    // Log answer for stats
    if (quiz.currentQuestion) {
      const timeSpent = GAME_CONSTANTS.TIME_PER_QUESTION - result.timeRemaining;
      stats.logAnswer(quiz.currentQuestion, result.correct, timeSpent);
    }
    
    // Update daily challenge progress
    dailyChallenge.updateProgress(gainedPoints);
    
    // Add coins for correct answers
    if (result.correct) {
      virtualShop.addCoins(gainedPoints);
    }
    
    // Check for story chapter unlocks
    storyMode.checkUnlocks(playerLevel.totalScore);
    
    if (!result.correct && quiz.currentQuestion) {
      reviewHistory.addIncorrectQuestion(quiz.currentQuestion.id);
      
      // In Coop mode, if wrong, reduce shared lives
      if (setupMode === 'coop' && coop.session) {
        coop.updateLives(coop.session.sharedLives - 1);
      }
    }
    
    achievements.logAnswer(
      result.correct,
      result.timeRemaining,
      quiz.combo,
      quiz.hintUsedOnQuestion,
      () => celebration.celebrateAchievement()
    );

    // Only show next button/results if not in coop mode (coop handles state via broadcast)
    if (setupMode !== 'coop') {
      setShowResults(true);
      setShowNextButton(true);
    } else {
      // In coop, the answer is processed, but the screen waits for the host to advance
      // The CoopGameScreen handles the visual feedback based on the local answer/broadcast
    }

    if (settings.isNarrationEnabled && quiz.currentQuestion?.explanation) {
      const answerText = `A resposta correta é: ${quiz.currentQuestion.options[quiz.currentQuestion.answer]}. ${quiz.currentQuestion.explanation}`;
      setTimeout(() => speak(answerText), 700);
    }
  };

  const handleNextQuestion = () => {
    cancel();
    setShowNextButton(false);
    
    if (quiz.isGameOver() || (setupMode === 'coop' && (coop.session?.sharedLives || 0) <= 0)) {
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
    <div className="p-4 relative overflow-hidden min-h-screen overflow-y-auto">
      {/* Animated background elements */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-20 left-10 w-64 h-64 bg-primary/20 rounded-full blur-3xl animate-float" />
        <div className="absolute bottom-20 right-10 w-96 h-96 bg-secondary/20 rounded-full blur-3xl animate-float" style={{ animationDelay: "1s" }} />
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[500px] h-[500px] bg-accent/10 rounded-full blur-3xl animate-float" style={{ animationDelay: "2s" }} />
      </div>

      {/* Game Screens */}
      <GameScreens
        gameMode={gameMode}
        setupMode={setupMode}
        quiz={quiz}
        coop={coop}
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
        handleEndGame={handleGameEnd}
      />

      {/* Modals */}
      <PlayerSetup
        open={showPlayerSetup}
        onClose={() => setShowPlayerSetup(false)}
        onStart={handlePlayersReady}
        mode={setupMode === 'coop' ? 'multiplayer' : setupMode}
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
        onStartSolo={handleStartSolo}
      />

      {/* AI Companion - sempre disponível */}
      <AICompanion />
    </div>
  );
};

export default Index;