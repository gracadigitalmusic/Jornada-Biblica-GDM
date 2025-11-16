import { useState, useEffect } from "react";
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
import { Player, GameMode } from "@/types/quiz";
import { StoryModeScreen } from "@/components/quiz/StoryModeScreen";
import { VirtualShop } from "@/components/quiz/VirtualShop";
import { AICompanion } from "@/components/quiz/AICompanion";
import { CoopLobby } from "@/components/quiz/CoopLobby";

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
  const [showCoopLobby, setShowCoopLobby] = useState(false);

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

  // Check for timeout
  useEffect(() => {
    if (gameMode === "quiz" && quiz.timeRemaining <= 0 && !showResults) {
      handleTimeout();
    }
  }, [quiz.timeRemaining, gameMode, showResults]);

  // Stop narration when leaving quiz
  useEffect(() => {
    return () => {
      cancel();
    };
  }, [cancel]);

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
    setGameMode('tournament');
  };
  
  const handleStartReview = () => {
    setGameMode('review');
  };

  const handleStartStory = () => {
    setGameMode('story');
  };

  const handleShowShop = () => {
    setShowPowerUpShop(true); // Reutilizando a mesma modal
  };

  const handleSelectChapter = (chapterId: string) => {
    storyMode.setCurrentChapter(chapterId);
    // Start co-op mode for story chapters
    setShowCoopLobby(true);
  };

  const handleStartCoop = () => {
    setShowCoopLobby(true);
  };

  const handleCoopGameStart = () => {
    setShowCoopLobby(false);
    setGameMode('quiz');
  };

  const handleCancelCoop = () => {
    setShowCoopLobby(false);
  };

  const handleMarathonReady = (player: Player) => {
    const firstQuestionText = quiz.initializeGame([player], 999); // Large number for marathon
    setGameMode("quiz");
    achievements.unlock('start');
    if (settings.isNarrationEnabled && firstQuestionText) {
      setTimeout(() => speak(firstQuestionText), 500);
    }
  };

  const handleTournamentStart = () => {
    setSetupMode('solo');
    setShowPlayerSetup(true);
    // Tournament uses 10 fixed questions
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
    cancel(); // Para a narração da pergunta
    const result = selectedIndex === -1 
      ? quiz.handleTimeout() 
      : quiz.answerQuestion(selectedIndex);

    const gainedPoints = result.pointsEarned;
    const didLevelUp = playerLevel.addScore(gainedPoints);
    
    // Add coins for correct answers
    if (result.correct) {
      virtualShop.addCoins(gainedPoints);
    }
    
    // Check for story chapter unlocks
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

  const handleGameEnd = () => {
    const isGameOver = setupMode === 'solo' && quiz.lives <= 0;
    setIsGameOverState(isGameOver);
    
    // Log session for achievements
    if (!isGameOver) {
      achievements.logSession(
        quiz.sessionWrongAnswers,
        quiz.sessionHintUsed,
        quiz.lives,
        3,
        () => celebration.celebrateAchievement()
      );

      // Save to ranking if solo
      if (setupMode === 'solo' && quiz.currentPlayer && quiz.currentPlayer.score > 0) {
        ranking.addScore(quiz.currentPlayer);
        
      const leveledUp = playerLevel.addScore(quiz.currentPlayer.score);
      if (leveledUp) {
        setTimeout(() => celebration.celebrateLevelUp(), 500);
      }
      
      // Check for story chapter completion
      if (storyMode.currentChapter) {
        const perfect = quiz.sessionWrongAnswers === 0;
        const noDeath = quiz.lives === 3;
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
    }

    setGameMode("results");
  };

  const handleContinue = () => {
    setShowPlayerSetup(true);
    setGameMode("menu");
  };

  const handleEndGame = () => {
    setGameMode("menu");
    setShowResults(false);
    setIsGameOverState(false);
  };

  const handleQuitQuiz = () => {
    if (confirm("Tem certeza que deseja sair? Seu progresso será perdido.")) {
      cancel();
      handleEndGame();
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

      <div className="w-full max-w-4xl relative z-10">
        {gameMode === "menu" && (
          <MenuScreen
            onStartSolo={handleStartSolo}
            onStartMultiplayer={handleStartMultiplayer}
            onStartMarathon={handleStartMarathon}
            onStartStudy={handleStartStudy}
            onStartTournament={handleStartTournament}
            onStartStory={handleStartStory}
            onStartCoop={handleStartCoop}
            onShowRanking={() => {
              ranking.loadRanking();
              setShowRanking(true);
            }}
            onShowAchievements={() => setShowAchievements(true)}
            onShowPowerUpShop={() => setShowPowerUpShop(true)}
            onShowReview={handleStartReview}
            isReviewAvailable={reviewHistory.hasIncorrectQuestions()}
            isNarrationEnabled={settings.isNarrationEnabled}
            onToggleNarration={toggleNarration}
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

        {gameMode === "quiz" && quiz.currentQuestion && (
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

        {gameMode === "results" && (
          <ResultsScreen
            players={quiz.players}
            gameMode={setupMode}
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
        mode={setupMode}
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

      <PowerUpShop 
        open={showPowerUpShop} 
        onClose={() => setShowPowerUpShop(false)} 
      />

      <VirtualShop
        open={showPowerUpShop}
        onClose={() => setShowPowerUpShop(false)}
        shopItems={virtualShop.shopItems}
        currency={virtualShop.currency}
        onPurchase={virtualShop.purchaseItem}
      />
      
      {showCoopLobby && (
        <CoopLobby
          onStartGame={handleCoopGameStart}
          onCancel={handleCancelCoop}
        />
      )}

      {/* AI Companion - sempre disponível */}
      <AICompanion />
    </div>
  );
};

export default Index;