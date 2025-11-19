import { GameMode, Player } from "@/types/quiz";
import { MenuScreen } from "@/components/quiz/MenuScreen";
import { StoryModeScreen } from "@/components/quiz/StoryModeScreen";
import { MarathonMode } from "@/components/quiz/MarathonMode";
import { StudyMode } from "@/components/quiz/StudyMode";
import { TournamentMode } from "@/components/quiz/TournamentMode";
import { ReviewMode } from "@/components/quiz/ReviewMode";
import { QuizScreen } from "@/components/quiz/QuizScreen";
import { ResultsScreen } from "@/components/quiz/ResultsScreen";
import { useQuizGame } from "@/hooks/useQuizGame";
import { useReviewHistory } from "@/hooks/useReviewHistory";
import { useGameSettings } from "@/hooks/useGameSettings";
import { useNarration } from "@/hooks/useNarration";
import { useStoryMode } from "@/hooks/useStoryMode";
import { usePlayerLevel } from "@/hooks/usePlayerLevel";
import { useDailyChallenge } from "@/hooks/useDailyChallenge";
import { useOfflineMode } from "@/hooks/useOfflineMode"; // Importando o hook

interface GameScreensProps {
  gameMode: GameMode;
  setupMode: 'solo' | 'multiplayer'; // Removido 'coop'
  quiz: ReturnType<typeof useQuizGame>;
  storyMode: ReturnType<typeof useStoryMode>;
  playerLevel: ReturnType<typeof usePlayerLevel>;
  reviewHistory: ReturnType<typeof useReviewHistory>;
  settings: ReturnType<typeof useGameSettings>['settings'];
  toggleNarration: ReturnType<typeof useGameSettings>['toggleNarration'];
  speak: ReturnType<typeof useNarration>['speak'];
  cancel: ReturnType<typeof useNarration>['cancel'];
  showNextButton: boolean;
  isGameOverState: boolean;
  dailyChallenge: ReturnType<typeof useDailyChallenge>;
  offlineMode: ReturnType<typeof useOfflineMode>; // Adicionando offlineMode
  hasStats: boolean; // Nova prop

  // Handlers
  onStartSolo: () => void;
  onStartMultiplayer: () => void;
  onStartMarathon: (player: Player) => void;
  onStartStudy: () => void;
  onStartTournament: () => void;
  onStartStory: () => void;
  onStartCoopEntry: () => void;
  onShowRanking: () => void;
  onShowAchievements: () => void;
  onShowPowerUpShop: () => void;
  onShowReview: () => void;
  onShowStats: () => void;
  onShowProfile: () => void;
  onSelectChapter: (chapterId: string) => void;
  onEnterCoopLobby: () => void;
  handleCoopGameStart: () => void;
  handleCancelCoop: () => void;
  handleAnswer: (index: number) => void;
  handleNextQuestion: () => void;
  handleQuitQuiz: () => void;
  handleContinue: () => void;
  handleEndGame: () => void;
  onSetGameMode: (mode: GameMode) => void;
  onStartPersonalizedStudy: () => void; // Novo handler
  onShowQuestionSubmission: () => void; // Novo handler
}

export function GameScreens({
  gameMode,
  setupMode,
  quiz,
  storyMode,
  playerLevel,
  reviewHistory,
  settings,
  toggleNarration,
  speak,
  cancel,
  showNextButton,
  isGameOverState,
  dailyChallenge,
  offlineMode, // Desestruturado
  hasStats, // Desestruturado
  onStartSolo,
  onStartMultiplayer,
  onStartMarathon,
  onStartStudy,
  onStartTournament,
  onStartStory,
  onStartCoopEntry,
  onShowRanking,
  onShowAchievements,
  onShowPowerUpShop,
  onShowReview,
  onShowStats,
  onShowProfile,
  onSelectChapter,
  onEnterCoopLobby,
  handleCoopGameStart,
  handleCancelCoop,
  handleAnswer,
  handleNextQuestion,
  handleQuitQuiz,
  handleContinue,
  handleEndGame,
  onSetGameMode,
  onStartPersonalizedStudy, // Passado para MenuScreen
  onShowQuestionSubmission, // Passado para MenuScreen
}: GameScreensProps) {
  
  const isReviewAvailable = reviewHistory.hasIncorrectQuestions();
  const isNarrationEnabled = settings.isNarrationEnabled;

  const handleClaimReward = () => {
    // Apenas chama a função de claim para atualizar o estado do desafio.
    // A lógica de adicionar moedas/itens é tratada no GameModals.tsx
    dailyChallenge.claimReward();
  };

  const quizScreenProps = {
    question: quiz.currentQuestion!,
    questionIndex: quiz.currentQuestionIndex,
    totalQuestions: quiz.totalQuestions,
    players: quiz.players,
    currentPlayerIndex: quiz.currentPlayerIndex,
    onAnswer: handleAnswer,
    onNextQuestion: handleNextQuestion,
    onQuit: handleQuitQuiz,
    isNarrationEnabled,
    onNarrate: speak,
  };

  return (
    <div className="w-full max-w-6xl mx-auto relative z-10">
      {gameMode === "menu" && (
        <MenuScreen
          onStartSolo={onStartSolo}
          onStartMultiplayer={onStartMultiplayer}
          onStartMarathon={onStartMarathon}
          onStartStudy={onStartStudy}
          onStartTournament={onStartTournament}
          onStartStory={onStartStory}
          onStartCoop={onStartCoopEntry}
          onShowRanking={onShowRanking}
          onShowAchievements={onShowAchievements}
          onShowPowerUpShop={onShowPowerUpShop}
          onShowReview={onShowReview}
          onShowStats={onShowStats}
          onShowProfile={onShowProfile}
          isReviewAvailable={isReviewAvailable}
          isNarrationEnabled={isNarrationEnabled}
          onToggleNarration={toggleNarration}
          onStartChallenge={onStartSolo} // Desafio Diário usa o modo Solo
          onClaimReward={handleClaimReward}
          isOfflineDataCached={offlineMode.isDataCached} // Passando prop
          onDownloadOffline={offlineMode.downloadForOffline} // Passando handler
          onStartPersonalizedStudy={onStartPersonalizedStudy} // Passando o novo handler
          onShowQuestionSubmission={onShowQuestionSubmission} // Passando o novo handler
          hasStats={hasStats} // Passando a nova prop
        />
      )}
      
      {/* Removido coop_entry */}
      
      {gameMode === "story" && (
        <StoryModeScreen
          chapters={storyMode.chapters}
          onSelectChapter={onSelectChapter}
          onBack={() => onSetGameMode('menu')}
          totalScore={playerLevel.totalScore}
        />
      )}

      {gameMode === "marathon" && (
        <MarathonMode
          onStart={onStartMarathon}
          onBack={() => onSetGameMode('menu')}
        />
      )}

      {gameMode === "study" && (
        <StudyMode onBack={() => onSetGameMode('menu')} />
      )}

      {gameMode === "tournament" && (
        <TournamentMode
          onStart={onStartTournament}
          onBack={() => onSetGameMode('menu')}
        />
      )}

      {gameMode === "review" && (
        <ReviewMode onBack={() => onSetGameMode('menu')} />
      )}

      {gameMode === "quiz" && quiz.currentQuestion && (
        <QuizScreen
          {...quizScreenProps}
          lives={quiz.lives}
          hints={quiz.hints}
          combo={quiz.combo}
          timeRemaining={quiz.timeRemaining}
          onUseHint={quiz.useHint}
          gameMode={setupMode}
          showNextButton={showNextButton}
        />
      )}
      
      {/* Removido CoopGameScreen */}

      {gameMode === "results" && (
        <ResultsScreen
          players={quiz.players}
          gameMode={setupMode}
          isGameOver={isGameOverState}
          onContinue={handleContinue}
          onEndGame={handleEndGame}
        />
      )}
      
      {/* Removido coop_lobby */}
    </div>
  );
}