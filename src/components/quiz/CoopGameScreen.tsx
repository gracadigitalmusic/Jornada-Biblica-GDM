import { useState, useEffect, useMemo } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { Heart, Lightbulb, Zap, Check, X, Volume2, Loader2, Users } from "lucide-react";
import { Question, Player } from "@/types/quiz";
import { GAME_CONSTANTS } from "@/data/questions";
import { useGameSounds } from "@/hooks/useGameSounds";
import { useBibleReference } from "@/hooks/useBibleReference";
import { BibleReferenceDialog } from "./BibleReferenceDialog";
import { useToast } from "@/hooks/use-toast";
import { useCoopMode, CoopPlayer } from "@/hooks/useCoopMode";
import { supabase } from "@/integrations/supabase/client";

interface CoopGameScreenProps {
  question: Question;
  questionIndex: number;
  totalQuestions: number;
  players: Player[];
  currentPlayerIndex: number;
  onAnswer: (index: number) => void;
  onNextQuestion: () => void;
  onQuit: () => void;
  isNarrationEnabled: boolean;
  onNarrate: (text: string) => void;
}

export function CoopGameScreen({
  question,
  questionIndex,
  totalQuestions,
  players,
  currentPlayerIndex,
  onAnswer, // onAnswer é passado via props
  onNextQuestion,
  onQuit,
  isNarrationEnabled,
  onNarrate,
}: CoopGameScreenProps) {
  const { playCorrect, playWrong, playTimerWarning } = useGameSounds();
  const { toast } = useToast();
  const { fetchBibleText, bibleText, isLoading: isBibleLoading, clearBibleText } = useBibleReference();
  const coop = useCoopMode();
  
  const [selectedIndex, setSelectedIndex] = useState<number | null>(null);
  const [showFeedback, setShowFeedback] = useState(false);
  const [feedbackType, setFeedbackType] = useState<'correct' | 'wrong' | null>(null);
  const [showBibleDialog, setShowBibleDialog] = useState(false);
  const [timeRemaining, setTimeRemaining] = useState(GAME_CONSTANTS.TIME_PER_QUESTION);
  const [isTimerRunning, setIsTimerRunning] = useState(true);
  const [disabledIndices, setDisabledIndices] = useState<number[]>([]);
  const [showNextButton, setShowNextButton] = useState(false);

  const currentPlayer = players[currentPlayerIndex];
  const isMyTurn = coop.currentPlayer?.name === currentPlayer.name;
  const timePercent = (timeRemaining / GAME_CONSTANTS.TIME_PER_QUESTION) * 100;

  // --- Timer Logic ---
  useEffect(() => {
    let interval: NodeJS.Timeout;
    
    if (isTimerRunning && timeRemaining > 0 && !showFeedback) {
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
  }, [isTimerRunning, timeRemaining, showFeedback]);

  // Handle Timeout
  useEffect(() => {
    if (timeRemaining <= 0 && !showFeedback) {
      onAnswer(-1); // -1 indicates timeout (Corrigido: usando onAnswer de props)
    }
  }, [timeRemaining, showFeedback, onAnswer]);

  // Reset state when question changes
  useEffect(() => {
    setSelectedIndex(null);
    setDisabledIndices([]);
    setShowFeedback(false);
    setFeedbackType(null);
    setTimeRemaining(GAME_CONSTANTS.TIME_PER_QUESTION);
    setIsTimerRunning(true);
    setShowNextButton(false);
    
    if (isNarrationEnabled && question.question) {
      onNarrate(question.question);
    }
  }, [questionIndex, question.question, isNarrationEnabled, onNarrate]);

  // --- Supabase Broadcasts for Shared State ---
  useEffect(() => {
    if (!coop.session) return;

    const channel = supabase.channel(`coop-session-${coop.session.id}`);
    
    const handleBroadcast = ({ payload }: { payload: any }) => {
      switch (payload.event) {
        case 'answer-selected':
          // Only process if it's not my answer
          if (payload.userId !== coop.myUserId) {
            handleAnswerReceived(payload.index, payload.isCorrect);
          }
          break;
        case 'hint-used':
          setDisabledIndices(payload.disabledIndices);
          toast({
            title: "Dica Usada!",
            description: `${payload.playerName} eliminou duas opções.`,
            variant: "default", // Corrigido: usando 'default' ou 'destructive'
          });
          break;
        case 'next-question':
          onNextQuestion();
          break;
        case 'game-over':
          onQuit(); // Should lead to results screen
          break;
      }
    };

    channel.on('broadcast', { event: 'answer-selected' }, handleBroadcast).subscribe();
    channel.on('broadcast', { event: 'hint-used' }, handleBroadcast).subscribe();
    channel.on('broadcast', { event: 'next-question' }, handleBroadcast).subscribe();
    channel.on('broadcast', { event: 'game-over' }, handleBroadcast).subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [coop.session, coop.myUserId, onNextQuestion, onQuit, toast]);

  // --- Local Handlers ---

  const handleAnswerReceived = (index: number, isCorrect: boolean) => {
    setIsTimerRunning(false);
    setSelectedIndex(index);
    setFeedbackType(isCorrect ? 'correct' : 'wrong');
    setShowFeedback(true);
    setShowNextButton(true);
    
    if (isCorrect) {
      playCorrect();
    } else {
      playWrong();
    }
  };

  const handleSelectOption = async (index: number) => {
    if (!isMyTurn || selectedIndex !== null || disabledIndices.includes(index)) return;
    
    setIsTimerRunning(false);
    setSelectedIndex(index);
    
    const isCorrect = index === question.answer;
    setFeedbackType(isCorrect ? 'correct' : 'wrong');
    setShowFeedback(true);
    setShowNextButton(true);

    // 1. Process answer locally (score update, etc.)
    onAnswer(index);

    // 2. Broadcast result to other players
    const channel = supabase.channel(`coop-session-${coop.session?.id}`);
    await channel.send({
      type: 'broadcast',
      event: 'answer-selected',
      payload: {
        userId: coop.myUserId,
        index,
        isCorrect,
      },
    });
    
    if (isCorrect) {
      playCorrect();
    } else {
      playWrong();
      // Update shared lives (Host responsibility in a real implementation, but mocking here)
      // coop.updateLives(coop.session.sharedLives - 1); 
    }
  };

  const handleNext = async () => {
    if (!coop.isHost) return; // Only host can advance
    
    const channel = supabase.channel(`coop-session-${coop.session?.id}`);
    await channel.send({
      type: 'broadcast',
      event: 'next-question',
      payload: {},
    });
    
    onNextQuestion();
  };

  const handleHint = async () => {
    if (!isMyTurn || disabledIndices.length > 0) return;
    
    // Mock hint logic (remove 2 wrong answers)
    const wrongIndices: number[] = [];
    question.options.forEach((_, idx) => {
      if (idx !== question.answer && !disabledIndices.includes(idx)) {
        wrongIndices.push(idx);
      }
    });

    const indicesToDisable = wrongIndices.slice(0, 2);
    setDisabledIndices(indicesToDisable);
    
    // Broadcast hint usage
    const channel = supabase.channel(`coop-session-${coop.session?.id}`);
    await channel.send({
      type: 'broadcast',
      event: 'hint-used',
      payload: {
        playerName: currentPlayer.name,
        disabledIndices: indicesToDisable,
      },
    });
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
      <div className="relative h-2 bg-muted rounded-full overflow-hidden">
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
          {/* Shared Lives/Progress */}
          <div className="flex items-center gap-4">
            <div className="flex items-center gap-1">
              {Array.from({ length: coop.session?.sharedLives || 0 }).map((_, i) => (
                <Heart
                  key={i}
                  className={`w-5 h-5 text-destructive fill-destructive`}
                />
              ))}
            </div>
            
            <Button
              variant="ghost"
              size="sm"
              onClick={handleHint}
              disabled={!isMyTurn || selectedIndex !== null}
              className="gap-2"
            >
              <Lightbulb className={`w-5 h-5 text-secondary`} />
              <span className="text-xs">Dica (Compartilhada)</span>
            </Button>

            <span className="text-sm text-muted-foreground">
              Pergunta {questionIndex + 1}/{totalQuestions}
            </span>
          </div>

          {/* Current Player Turn */}
          <motion.div
            key={currentPlayer.name}
            initial={{ opacity: 0, x: -10 }}
            animate={{ opacity: 1, x: 0 }}
            className={`flex items-center gap-2 font-semibold ${isMyTurn ? 'text-primary' : 'text-muted-foreground'}`}
          >
            <span className="text-2xl">{currentPlayer.avatar}</span>
            <span>{isMyTurn ? 'Sua Vez!' : `Turno de: ${currentPlayer.name}`}</span>
          </motion.div>
        </div>

        {/* Score Display */}
        <div className="text-right">
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
        </div>
      </div>

      {/* Question Card */}
      <motion.div
        key={questionIndex}
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        className={`
          bg-quiz-card rounded-2xl p-6 border-2 transition-all duration-300
          ${showFeedback 
            ? feedbackType === 'correct' 
              ? 'border-success glow-success' 
              : 'border-destructive animate-[shake_0.5s_ease]'
            : 'border-border'
          }
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
                  whileHover={!isDisabled && !selectedIndex && isMyTurn ? { scale: 1.02 } : {}}
                  onClick={() => handleSelectOption(index)}
                  disabled={selectedIndex !== null || isDisabled || !isMyTurn}
                  className={`
                    p-4 rounded-xl text-left font-medium transition-all duration-300
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
          </motion.div>
        )}
      </motion.div>

      {/* Next Question Button */}
      {showNextButton && coop.isHost && (
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center"
        >
          <Button 
            size="lg" 
            onClick={handleNext}
            className="font-bold text-lg px-8 bg-gradient-to-r from-primary to-secondary hover:from-primary/90 hover:to-secondary/90"
          >
            Próxima Pergunta →
          </Button>
        </motion.div>
      )}
      
      {showNextButton && !coop.isHost && (
        <div className="text-center text-muted-foreground flex items-center justify-center gap-2">
          <Loader2 className="w-4 h-4 animate-spin" />
          Aguardando o Host avançar...
        </div>
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
        isLoading={isBibleLoading}
        onClose={handleCloseDialog}
      />
    </div>
  );
}