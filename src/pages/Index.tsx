import { useState, useEffect, useCallback } from "react";
import { MenuScreen } from "@/components/quiz/MenuScreen";
import { PlayerSetup } from "@/components/quiz/PlayerSetup";
import { QuizScreen } from "@/components/quiz/QuizScreen";
import { ResultsScreen } from "@/components/quiz/ResultsScreen";
import { RankingModal } from "@/components/quiz/RankingModal";
import { AchievementsModal } from "@/components/quiz/AchievementsModal";
import { PowerUpShop } from "@/components/quiz/PowerUpShop";
import { MarathonMode } from "@/components/quiz/MarathonMode";
import { StudyMode } from "@/components/quiz/StudyMode";
import { TournamentMode } from "@/components/quiz/TournamentMode";
import { ReviewMode } from "@/components/quiz/ReviewMode";
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
import { Player, GameMode } from "@/types/quiz";
import { StoryModeScreen } from "@/components/quiz/StoryModeScreen";
import { VirtualShop } from "@/components/quiz/VirtualShop";
import { AICompanion } from "@/components/quiz/AICompanion";
import { CoopLobby } from "@/components/quiz/CoopLobby";
import { useCoopMode } from "@/hooks/useCoopMode";
import { StatsModal } from "@/components/quiz/StatsModal";
import { DailyChallengeCard } from "@/components/quiz/DailyChallengeCard";
import { ProfileModal } from "@/components/quiz/ProfileModal";
import { CoopGameScreen } from "@/components/quiz/CoopGameScreen";
import { CoopEntryScreen } from "@/components/quiz/CoopEntryScreen"; // Importando a nova tela
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
  const [showCoopLobby, setShowCoopLobby] = useState(false);
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
          setTimeout(() => celebration.playLevelUp(), 500);
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

  const handleStartSolo = () => {
    setSetupMode('solo');
    setShowPlayerSetup(true);
  };

  const handleStartMultiplayer = () => {
    setSetupMode('multiplayer');
    setShowPlayerSetup(true);
  };

  const handleStartMarathon = () => {
    setGameMode('marathon');
  };

  const handleStartStudy = () => {
    setGameMode('study');
  };

  const handleStartTournament = () => {
    setSetupMode('solo');
    setShowPlayerSetup(true);
  };
  
  const handleStartReview = () => {
    setGameMode('review');
  };

  const handleStartStory = () => {
    setGameMode('story');
  };

  const handleShowShop = () => {
    setShowPowerUpShop(true);
  };
  
  const handleShowStats = () => {
    setShowStats(true);
  };

  const handleShowProfile = () => {
    setShowProfile(true);
  };

  const handleStartCoopEntry = () => {
    setGameMode('coop_entry'); // Novo estado para a tela de entrada
  };
  
  const handleEnterCoopLobby = () => {
    setGameMode('coop_lobby');
    setSetupMode('coop');
    setShowCoopLobby(true);
  };

  const handleSelectChapter = (chapterId: string) => {
    storyMode.setCurrentChapter(chapterId);
    // Mock player for host
    const lastUser = localStorage.getItem('jb_last_user');
    const hostPlayer = lastUser ? JSON.parse(lastUser) : { name: 'Peregrino', location: 'Story Mode', score: 0, avatar: '👑' };
    coop.createSession(hostPlayer, `Jornada ${chapterId}`, 4, chapterId);
    setSetupMode('coop');
    setShowCoopLobby(true);
  };

  const handleCoopGameStart = () => {
    setShowCoopLobby(false);
    setGameMode('quiz');
    
    // Use players from coop hook, but map them to the quiz game structure
    const playersList: Player[] = coop.players.map(p => ({ 
      name: p.name, 
      location: coop.session?.teamName || 'Co-op', 
      score: 0, 
      avatar: p.avatar 
    }));
    
    const numQuestions = 10; 
    const firstQuestionText = quiz.initializeGame(playersList, numQuestions);
    
    if (settings.isNarrationEnabled && firstQuestionText) {
      setTimeout(() => speak(firstQuestionText), 500);
    }
  };

  const handleCancelCoop = () => {
    coop.leaveSession();
    setShowCoopLobby(false);
    setGameMode('menu');
    setSetupMode('solo');
  };

  const handleMarathonReady = (player: Player) => {
    const firstQuestionText = quiz.initializeGame([player], 999);
    setGameMode("quiz");
    setSetupMode('solo');
    achievements.unlock('start');
    if (settings.isNarrationEnabled && firstQuestionText) {
      setTimeout(() => speak(firstQuestionText), 500);
    }
  };

  const handleTournamentStart = () => {
    setSetupMode('solo');
    setShowPlayerSetup(true);
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

  const handleClaimDailyReward = () => {
    const reward = dailyChallenge.claimReward();
    if (reward.coins > 0) {
      virtualShop.addCoins(reward.coins);
      if (reward.item) {
        // Note: Since the item is defined in the challenge hook, we need to ensure it's added to owned items.
        // For simplicity, we assume the item ID is sufficient for the shop to recognize it.
        virtualShop.purchaseItem(reward.item.id); 
      }
      celebration.celebrateAchievement();
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center p-4 relative overflow-hidden">
      {/* Animated background elements */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-20 left-10 w-64 h-64 bg-primary/20 rounded-full blur-3xl animate-float" />
        <div className="absolute bottom-20 right-10 w-96 h-96 bg-secondary/20 rounded-full blur-3xl animate-float" style={{ animationDelay: "1s" }} />
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[500px] h-[500px] bg-accent/10 rounded-full blur-3xl animate-float" style={{ animationDelay: "2s" }} />
      </div>

      <div className="w-full max-w-6xl relative z-10">
        {gameMode === "menu" && (
          <MenuScreen
            onStartSolo={handleStartSolo}
            onStartMultiplayer={handleStartMultiplayer}
            onStartMarathon={handleStartMarathon}
            onStartStudy={handleStartStudy}
            onStartTournament={handleStartTournament}
            onStartStory={handleStartStory}
            onStartCoop={handleStartCoopEntry} // Alterado para a nova tela de entrada
            onShowRanking={() => {
              ranking.loadRanking();
              setShowRanking(true);
            }}
            onShowAchievements={() => setShowAchievements(true)}
            onShowPowerUpShop={() => setShowPowerUpShop(true)}
            onShowReview={handleStartReview}
            onShowStats={handleShowStats}
            onShowProfile={handleShowProfile}
            isReviewAvailable={reviewHistory.hasIncorrectQuestions()}
            isNarrationEnabled={settings.isNarrationEnabled}
            onToggleNarration={toggleNarration}
          />
        )}
        
        {gameMode === "coop_entry" && (
          <CoopEntryScreen
            onBack={() => setGameMode('menu')}
            onEnterLobby={handleEnterCoopLobby}
          />
        )}
        
        {gameMode === "story" && (
          <StoryModeScreen
            chapters={storyMode.chapters}
            onSelectChapter={handleSelectChapter}
            onBack={() => setGameMode("menu")}
            totalScore={playerLevel.totalScore}
          />
        )}

        {gameMode === "marathon" && (
          <MarathonMode
            onStart={handleMarathonReady}
            onBack={() => setGameMode("menu")}
          />
        )}

        {gameMode === "study" && (
          <StudyMode onBack={() => setGameMode("menu")} />
        )}

        {gameMode === "tournament" && (
          <TournamentMode
            onStart={handleTournamentStart}
            onBack={() => setGameMode("menu")}
          />
        )}

        {gameMode === "review" && (
          <ReviewMode onBack={() => setGameMode("menu")} />
        )}

        {gameMode === "quiz" && quiz.currentQuestion && setupMode !== 'coop' && (
          <QuizScreen
            question={quiz.currentQuestion}
            questionIndex={quiz.currentQuestionIndex}
            totalQuestions={quiz.totalQuestions}
            players={quiz.players}
            currentPlayerIndex={quiz.currentPlayerIndex}
            lives={quiz.lives}
            hints={quiz.hints}
            combo={quiz.combo}
            timeRemaining={quiz.timeRemaining}
            onAnswer={handleAnswer}
            onNextQuestion={handleNextQuestion}
            onUseHint={quiz.useHint}
            onQuit={handleQuitQuiz}
            gameMode={setupMode}
            showNextButton={showNextButton}
            isNarrationEnabled={settings.isNarrationEnabled}
            onNarrate={speak}
          />
        )}
        
        {gameMode === "quiz" && quiz.currentQuestion && setupMode === 'coop' && coop.session && (
          <CoopGameScreen
            question={quiz.currentQuestion}
            questionIndex={quiz.currentQuestionIndex}
            totalQuestions={quiz.totalQuestions}
            players={quiz.players}
            currentPlayerIndex={quiz.currentPlayerIndex}
            onAnswer={handleAnswer}
            onNextQuestion={handleNextQuestion}
            onQuit={handleQuitQuiz}
            isNarrationEnabled={settings.isNarrationEnabled}
            onNarrate={speak}
          />
        )}

        {gameMode === "results" && (
          <ResultsScreen
            players={quiz.players}
            gameMode={setupMode === 'coop' ? 'multiplayer' : setupMode}
            isGameOver={isGameOverState}
            onContinue={handleContinue}
            onEndGame={handleEndGame}
          />
        )}
      </div>

      {/* Modals */}
      <PlayerSetup
        open={showPlayerSetup}
        onClose={() => setShowPlayerSetup(false)}
        onStart={handlePlayersReady}
        mode={setupMode === 'coop' ? 'multiplayer' : setupMode}
      />

      <RankingModal
        open={showRanking}
        onClose={() => setShowRanking(false)}
        ranking={ranking.ranking}
      />

      <AchievementsModal
        open={showAchievements}
        onClose={() => setShowAchievements(false)}
        achievements={achievements.getAchievements()}
      />

      <VirtualShop
        open={showPowerUpShop}
        onClose={() => setShowPowerUpShop(false)}
        shopItems={virtualShop.shopItems}
        currency={virtualShop.currency}
        onPurchase={virtualShop.purchaseItem}
      />
      
      <StatsModal
        open={showStats}
        onClose={() => setShowStats(false)}
      />
      
      {/* Coop Lobby agora é um estado de jogo */}
      {gameMode === 'coop_lobby' && coop.session && (
        <CoopLobby
          onStartGame={handleCoopGameStart}
          onCancel={handleCancelCoop}
        />
      )}

      {/* Novo Modal de Perfil */}
      <ProfileModal
        open={showProfile}
        onClose={() => setShowProfile(false)}
        onStartChallenge={handleStartSolo}
        onClaimReward={handleClaimDailyReward}
      />

      {/* AI Companion - sempre disponível */}
      <AICompanion />
    </div>
  );
};

export default Index;