import { GameMode, Player } from "@/types/quiz";
import { MenuScreen } from "@/components/quiz/MenuScreen";
import { StoryModeScreen } from "@/components/quiz/StoryModeScreen";
import { MarathonMode } from "@/components/quiz/MarathonMode";
import { StudyMode } from "@/components/quiz/StudyMode";
import { TournamentMode } from "@/components/quiz/TournamentMode";
import { ReviewMode } from "@/components/quiz/ReviewMode";
import { QuizScreen } from "@/components/quiz/QuizScreen";
import { CoopGameScreen } from "@/components/quiz/CoopGameScreen";
import { ResultsScreen } from "@/components/quiz/ResultsScreen";
import { CoopLobby } from "@/components/quiz/CoopLobby";
import { CoopEntryScreen } from "@/components/quiz/CoopEntryScreen";
import { useQuizGame } from "@/hooks/useQuizGame";
import { useReviewHistory } from "@/hooks/useReviewHistory";
import { useGameSettings } from "@/hooks/useGameSettings";
import { useNarration } from "@/hooks/useNarration";
import { useStoryMode } from "@/hooks/useStoryMode";
import { usePlayerLevel } from "@/hooks/usePlayerLevel";
import { useCoopMode } from "@/hooks/useCoopMode";
import { useDailyChallenge } from "@/hooks/useDailyChallenge";

interface GameScreensProps {
  gameMode: GameMode;
  setupMode: 'solo' | 'multiplayer' | 'coop';
  quiz: ReturnType<typeof useQuizGame>;
  coop: ReturnType<typeof useCoopMode>;
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
}

export function GameScreens({
  gameMode,
  setupMode,
  quiz,
  coop,
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
        />
      )}
      
      {gameMode === "coop_entry" && (
        <CoopEntryScreen
          onBack={() => onSetGameMode('menu')}
          onEnterLobby={onEnterCoopLobby}
        />
      )}
      
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

      {gameMode === "quiz" && quiz.currentQuestion && setupMode !== 'coop' && (
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
      
      {gameMode === "quiz" && quiz.currentQuestion && setupMode === 'coop' && coop.session && (
        <CoopGameScreen
          {...quizScreenProps}
          // CoopGameScreen uses internal state for lives/hints/time
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
      
      {gameMode === 'coop_lobby' && coop.session && (
        <CoopLobby
          onStartGame={handleCoopGameStart}
          onCancel={handleCancelCoop}
        />
      )}
    </div>
  );
}