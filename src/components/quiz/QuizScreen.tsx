import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { Heart, Lightbulb, Zap, Share2, Copy, Volume2 } from "lucide-react";
import { Question, Player } from "@/types/quiz";
import { GAME_CONSTANTS } from "@/data/questions";
import { useGameSounds } from "@/hooks/useGameSounds";
import { useBibleReference } from "@/hooks/useBibleReference";
import { BibleReferenceDialog } from "./BibleReferenceDialog";
import { useToast } from "@/hooks/use-toast";
import { useCelebration } from "@/hooks/useCelebration";

interface QuizScreenProps {
  question: Question;
  questionIndex: number;
  totalQuestions: number;
  players: Player[];
  currentPlayerIndex: number;
  lives: number;
  hints: number;
  combo: number;
  timeRemaining: number;
  onAnswer: (index: number) => void;
  onNextQuestion: () => void;
  onUseHint: () => number[] | null;
  onQuit: () => void;
  gameMode: 'solo' | 'multiplayer';
  showNextButton: boolean;
  isNarrationEnabled: boolean;
  onNarrate: (text: string) => void;
}

export function QuizScreen({
  question,
  questionIndex,
  totalQuestions,
  players,
  currentPlayerIndex,
  lives,
  hints,
  combo,
  timeRemaining,
  onAnswer,
  onNextQuestion,
  onUseHint,
  onQuit,
  gameMode,
  showNextButton,
  isNarrationEnabled,
  onNarrate,
}: QuizScreenProps) {
  const { playCorrect, playWrong, playTimerWarning } = useGameSounds();
  const { toast } = useToast();
  const { fetchBibleText, bibleText, isLoading, clearBibleText } = useBibleReference();
  const { celebrateAchievement, celebratePowerUp } = useCelebration();
  const [selectedIndex, setSelectedIndex] = useState<number | null>(null);
  const [disabledIndices, setDisabledIndices] = useState<number[]>([]);
  const [showFeedback, setShowFeedback] = useState(false);
  const [feedbackType, setFeedbackType] = useState<'correct' | 'wrong' | null>(null);
  const [showBibleDialog, setShowBibleDialog] = useState(false);

  const currentPlayer = players[currentPlayerIndex];
  const timePercent = (timeRemaining / GAME_CONSTANTS.TIME_PER_QUESTION) * 100;
  const comboGlowClass = combo >= 3 ? 'animate-pulse-glow-secondary' : '';

  useEffect(() => {
    // Reset state when question changes
    setSelectedIndex(null);
    setDisabledIndices([]);
    setShowFeedback(false);
    setFeedbackType(null);
  }, [questionIndex]);

  useEffect(() => {
    // Play warning sound when time is running out
    if (timeRemaining <= 5 && timeRemaining > 4.9 && !showFeedback) {
      playTimerWarning();
    }
    // Auto-trigger timeout
    if (timeRemaining <= 0 && selectedIndex === null) {
      handleTimeout();
    }
  }, [timeRemaining, showFeedback, playTimerWarning, selectedIndex]);

  const handleHint = () => {
    const indicesToDisable = onUseHint();
    if (indicesToDisable) {
      setDisabledIndices(indicesToDisable);
    }
  };

  const handleTimeout = () => {
    playWrong();
    setFeedbackType('wrong');
    setShowFeedback(true);
    onAnswer(-1); // -1 indicates timeout
  };

  const handleSelectOption = (index: number) => {
    if (selectedIndex !== null || disabledIndices.includes(index)) return;
    
    setSelectedIndex(index);
    const correct = index === question.answer;
    setFeedbackType(correct ? 'correct' : 'wrong');
    setShowFeedback(true);

    if (correct) {
      playCorrect();
      // Celebration effects for correct answers
      if (combo >= 5) {
        celebratePowerUp(); // Usando powerUp celebration para combos altos
      } else if (combo >= 3) {
        celebrateAchievement(); // Usando achievement celebration para combos médios
      }
    } else {
      playWrong();
    }

    onAnswer(index);

    // Narrate explanation after answer
    if (isNarrationEnabled && question.explanation) {
      setTimeout(() => {
        const narrateText = `A resposta correta é: ${question.options[question.answer]}. ${question.explanation}`;
        onNarrate(narrateText);
      }, 1000);
    }
  };

  const handleShareResult = async () => {
    const correctAnswer = question.options[question.answer];
    const shareText = `📖 Jornada Bíblica\n\nPergunta: ${question.question}\n\n✅ Resposta: ${correctAnswer}\n\n📚 Referência: ${question.reference}\n\n💡 ${question.explanation}`;
    
    try {
      if (navigator.share) {
        await navigator.share({
          title: 'Jornada Bíblica',
          text: shareText,
        });
      } else {
        await navigator.clipboard.writeText(shareText);
        toast({
          title: "Copiado!",
          description: "Resultado copiado para a área de transferência",
        });
      }
    } catch (error) {
      console.error('Erro ao compartilhar:', error);
    }
  };

  const handleCopyToClipboard = async () => {
    const correctAnswer = question.options[question.answer];
    const shareText = `📖 Jornada Bíblica\n\nPergunta: ${question.question}\n\n✅ Resposta: ${correctAnswer}\n\n📚 Referência: ${question.reference}\n\n💡 ${question.explanation}`;
    
    try {
      await navigator.clipboard.writeText(shareText);
      toast({
        title: "Copiado!",
        description: "Resultado copiado para a área de transferência",
        duration: 2000,
      });
    } catch (error) {
      console.error('Erro ao copiar:', error);
      toast({
        title: "Erro",
        description: "Não foi possível copiar o texto",
        variant: "destructive",
        duration: 2000,
      });
    }
  };

  const handleReferenceClick = async () => {
    setShowBibleDialog(true);
    await fetchBibleText(question.reference);
  };

  const handleCloseDialog = () => {
    setShowBibleDialog(false);
    clearBibleText();
  };

  const handleNarrateExplanation = () => {
    if (question.explanation) {
      const narrateText = `${question.reference}. ${question.explanation}`;
      onNarrate(narrateText);
    }
  };

  return (
    <div className="space-y-4">
      {/* Timer Bar */}
      <div className="relative h-2 bg-muted rounded-full overflow-hidden will-change-transform">
        <motion.div
          className="absolute inset-y-0 left-0 bg-gradient-to-r from-secondary to-primary"
          initial={{ width: "100%" }}
          animate={{ width: `${timePercent}%` }}
          transition={{ duration: 0.1, ease: "linear" }}
        />
      </div>

      {/* Header */}
      <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
        <div className="space-y-2">
          {/* Lives/Hint/Progress */}
          <div className="flex items-center gap-4">
            {gameMode === 'solo' && (
              <div className="flex items-center gap-1">
                {Array.from({ length: GAME_CONSTANTS.LIVES_PER_SESSION }).map((_, i) => (
                  <Heart
                    key={i}
                    className={`w-5 h-5 ${i < lives ? 'text-destructive fill-destructive' : 'text-muted'}`}
                  />
                ))}
              </div>
            )}
            
            <Button
              variant="ghost"
              size="sm"
              onClick={handleHint}
              disabled={hints <= 0 || selectedIndex !== null}
              className="gap-2"
            >
              <Lightbulb className={`w-5 h-5 ${hints > 0 ? 'text-secondary' : 'text-muted'}`} />
              <span className="text-xs">Dica ({hints})</span>
            </Button>

            <span className="text-sm text-muted-foreground">
              Pergunta {questionIndex + 1}/{totalQuestions}
            </span>
          </div>

          {/* Current Player Turn */}
          {gameMode === 'multiplayer' && (
            <motion.div
              key={currentPlayer.name}
              initial={{ opacity: 0, x: -10 }}
              animate={{ opacity: 1, x: 0 }}
              className="flex items-center gap-2 text-secondary font-semibold will-change-transform"
            >
              <span className="text-2xl">{currentPlayer.avatar}</span>
              <span>Turno de: {currentPlayer.name}</span>
            </motion.div>
          )}

          {/* Combo */}
          {gameMode === 'solo' && combo > 1 && (
            <motion.div
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              className="flex items-center gap-2 text-secondary font-bold animate-streak will-change-transform"
            >
              <Zap className="w-5 h-5" />
              <span>COMBO x{combo}!</span>
            </motion.div>
          )}
        </div>

        {/* Score Display */}
        <div className="text-right">
          {gameMode === 'solo' ? (
            <div className="flex items-center gap-2 justify-end">
              <span className="text-2xl">{currentPlayer.avatar}</span>
              <div>
                <div className="text-lg font-bold">{currentPlayer.name}</div>
                <div className="text-2xl font-black text-primary">{currentPlayer.score} pts</div>
              </div>
            </div>
          ) : (
            <div className="flex flex-wrap gap-2 justify-end">
              {players.map((player, idx) => (
                <div
                  key={idx}
                  className={`px-3 py-1 rounded-full text-sm font-semibold flex items-center gap-1 ${
                    idx === currentPlayerIndex
                      ? 'bg-secondary text-secondary-foreground'
                      : 'bg-muted text-muted-foreground'
                  }`}
                >
                  <span>{player.avatar}</span>
                  <span>{player.name}: {player.score}</span>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Question Card */}
      <motion.div
        key={questionIndex}
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        className={`
          bg-quiz-card rounded-2xl p-6 border-2 transition-all duration-300 will-change-transform
          ${showFeedback 
            ? feedbackType === 'correct' 
              ? 'border-success glow-success' 
              : 'border-destructive animate-[shake_0.5s_ease] glow-destructive'
            : 'border-border'
          }
          ${!showFeedback && comboGlowClass}
        `}
      >
        <h2 className="text-xl md:text-2xl font-bold mb-6 text-foreground">
          {question.question}
        </h2>

        {/* Options */}
        <div className="grid gap-3 md:grid-cols-2">
          <AnimatePresence>
            {question.options.map((option, index) => {
              const isDisabled = disabledIndices.includes(index);
              const isSelected = selectedIndex === index;
              const isCorrect = index === question.answer;
              const showCorrect = showFeedback && isCorrect;
              const showWrong = showFeedback && isSelected && !isCorrect;

              return (
                <motion.button
                  key={index}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ 
                    opacity: isDisabled ? 0.3 : 1, 
                    y: 0,
                    scale: showCorrect ? 1.05 : showWrong ? 0.95 : 1,
                  }}
                  whileHover={!isDisabled && !selectedIndex ? { scale: 1.02 } : {}}
                  onClick={() => handleSelectOption(index)}
                  disabled={selectedIndex !== null || isDisabled}
                  className={`
                    p-4 rounded-xl text-left font-medium transition-all duration-300 will-change-transform
                    disabled:cursor-not-allowed
                    ${showCorrect 
                      ? 'bg-success text-success-foreground border-2 border-success' 
                      : showWrong
                      ? 'bg-destructive/20 text-destructive border-2 border-destructive'
                      : isDisabled
                      ? 'bg-muted/20 text-muted-foreground line-through'
                      : 'bg-quiz-card hover:bg-quiz-card-hover border-2 border-border hover:border-primary'
                    }
                  `}
                >
                  <span className="font-bold mr-2">{String.fromCharCode(65 + index)}.</span>
                  {option}
                </motion.button>
              );
            })}
          </AnimatePresence>
        </div>

        {/* Reference and Explanation */}
        {showFeedback && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            className="mt-6 space-y-3"
          >
            <div className="p-4 bg-primary/10 rounded-lg border border-primary/20 cursor-pointer hover:bg-primary/15 transition-colors" onClick={handleReferenceClick}>
              <p className="text-xs font-semibold text-primary/70 mb-1">📖 Referência Bíblica (clique para ver o texto)</p>
              <p className="font-bold text-foreground underline decoration-primary/30">{question.reference}</p>
            </div>
            
            {question.explanation && (
              <div className="p-4 bg-muted/50 rounded-lg border border-border">
                <div className="flex items-start justify-between mb-2">
                  <p className="text-xs font-semibold text-muted-foreground">💡 Explicação</p>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={handleNarrateExplanation}
                    className="h-8 gap-2"
                  >
                    <Volume2 className="w-4 h-4" />
                    Ouvir
                  </Button>
                </div>
                <p className="text-sm text-foreground leading-relaxed">{question.explanation}</p>
              </div>
            )}

            {/* Share Buttons */}
            <div className="flex gap-2">
              <Button
                variant="outline"
                size="sm"
                onClick={handleShareResult}
                className="flex-1 gap-2"
              >
                <Share2 className="w-4 h-4" />
                Compartilhar
              </Button>
              <Button
                variant="outline"
                size="sm"
                onClick={handleCopyToClipboard}
                className="flex-1 gap-2"
              >
                <Copy className="w-4 h-4" />
                Copiar
              </Button>
            </div>
          </motion.div>
        )}
      </motion.div>

      {/* Next Question Button */}
      {showNextButton && (
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center will-change-transform"
        >
          <Button 
            size="lg" 
            onClick={onNextQuestion}
            className="font-bold text-lg px-8 bg-gradient-to-r from-primary to-secondary hover:from-primary/90 hover:to-secondary/90"
          >
            Próxima Pergunta →
          </Button>
        </motion.div>
      )}

      {/* Quit Button */}
      <div className="text-center">
        <Button variant="outline" onClick={onQuit}>
          Voltar ao Menu Principal
        </Button>
      </div>

      {/* Bible Reference Dialog */}
      <BibleReferenceDialog
        reference={showBibleDialog ? question.reference : null}
        bibleText={bibleText}
        isLoading={isLoading}
        onClose={handleCloseDialog}
      />
    </div>
  );
}