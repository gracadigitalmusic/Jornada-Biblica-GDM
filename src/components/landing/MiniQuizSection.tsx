import React, { useState, useEffect, useCallback } from "react";
import { motion, Variants } from "framer-motion";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { CheckCircle, XCircle, Lightbulb, BookOpen, Coins, Sparkles } from "lucide-react";
import { FALLBACK_QUESTIONS } from '@/data/questions'; // Importar perguntas reais
import { Link } from "react-router-dom"; // Para o botão de jogar o jogo completo

interface MiniQuestion {
  id: string;
  question: string;
  options: string[];
  answer: number;
  explanation: string;
  reference: string;
}

// Função para embaralhar um array
function shuffleArray<T>(array: T[]): T[] {
  const shuffled = [...array];
  for (let i = shuffled.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
  }
  return shuffled;
}

const sectionVariants: Variants = {
  hidden: { opacity: 0, y: 50 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.6, ease: [0.42, 0, 0.58, 1] } },
};

const itemVariants: Variants = {
  hidden: { opacity: 0, scale: 0.8 },
  visible: { opacity: 1, scale: 1, transition: { duration: 0.5, ease: [0.42, 0, 0.58, 1] } },
};

export function MiniQuizSection() {
  const [miniQuizQuestions, setMiniQuizQuestions] = useState<MiniQuestion[]>([]);
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [selectedAnswer, setSelectedAnswer] = useState<number | null>(null);
  const [showFeedback, setShowFeedback] = useState(false);
  const [miniScore, setMiniScore] = useState(0);
  const [isQuizFinished, setIsQuizFinished] = useState(false);

  // Carrega perguntas aleatórias na montagem do componente
  useEffect(() => {
    const easyQuestions = FALLBACK_QUESTIONS.filter(q => q.difficulty === 'junior' || q.difficulty === 'easy');
    const selected = shuffleArray(easyQuestions).slice(0, 3); // 3 perguntas aleatórias
    setMiniQuizQuestions(selected);
    setMiniScore(0);
    setCurrentQuestionIndex(0);
    setSelectedAnswer(null);
    setShowFeedback(false);
    setIsQuizFinished(false);
  }, []);

  const currentQuestion = miniQuizQuestions[currentQuestionIndex];

  const handleAnswer = (index: number) => {
    if (selectedAnswer !== null) return;
    setSelectedAnswer(index);
    setShowFeedback(true);

    if (index === currentQuestion.answer) {
      setMiniScore(prev => prev + 100); // Pontuação simples
    }
  };

  const handleNextQuestion = useCallback(() => {
    setSelectedAnswer(null);
    setShowFeedback(false);
    if (currentQuestionIndex < miniQuizQuestions.length - 1) {
      setCurrentQuestionIndex((prev) => prev + 1);
    } else {
      setIsQuizFinished(true);
    }
  }, [currentQuestionIndex, miniQuizQuestions.length]);

  if (miniQuizQuestions.length === 0) {
    return (
      <motion.section
        className="py-20 px-4 max-w-3xl mx-auto text-center"
        variants={sectionVariants}
        initial="hidden"
        whileInView="visible"
        viewport={{ once: true, amount: 0.3 }}
      >
        <h2 className="text-4xl font-bold text-gradient-primary mb-6">Carregando Mini-Quiz...</h2>
        <p className="text-lg text-muted-foreground">Preparando suas perguntas bíblicas!</p>
      </motion.section>
    );
  }

  return (
    <motion.section
      className="py-20 px-4 max-w-3xl mx-auto text-center"
      variants={sectionVariants}
      initial="hidden"
      whileInView="visible"
      viewport={{ once: true, amount: 0.3 }}
    >
      <h2 className="text-4xl font-bold text-gradient-primary mb-6">Teste Seu Conhecimento Agora!</h2>
      <p className="text-lg text-muted-foreground max-w-2xl mx-auto mb-12">
        Responda a algumas perguntas rápidas e sinta o gostinho da Jornada Bíblica.
      </p>

      <motion.div variants={itemVariants}>
        <Card className="p-6 bg-quiz-card/50 border-primary/20">
          <CardHeader className="pb-4 flex-row justify-between items-center">
            <CardTitle className="text-xl font-bold">Pergunta {currentQuestionIndex + 1} de {miniQuizQuestions.length}</CardTitle>
            <div className="flex items-center gap-2 text-lg font-bold text-primary">
              <Coins className="w-6 h-6 text-yellow-500" />
              {miniScore} pts
            </div>
          </CardHeader>
          <CardContent className="space-y-3">
            <p className="text-lg font-semibold mb-4">{currentQuestion.question}</p>
            {currentQuestion.options.map((option, index) => {
              const isCorrect = index === currentQuestion.answer;
              const isSelected = selectedAnswer === index;
              const showResult = showFeedback;

              return (
                <Button
                  key={index}
                  onClick={() => handleAnswer(index)}
                  disabled={selectedAnswer !== null}
                  className={`w-full justify-start text-left h-auto py-3 px-4 transition-all duration-200
                    ${showResult
                      ? isCorrect
                        ? 'bg-success/20 text-success border-2 border-success'
                        : isSelected
                        ? 'bg-destructive/20 text-destructive border-2 border-destructive'
                        : 'bg-background text-muted-foreground border-2 border-border opacity-60'
                      : 'bg-background hover:bg-muted border-2 border-border hover:border-primary'
                    }
                  `}
                >
                  {showResult && isCorrect && <CheckCircle className="w-5 h-5 mr-2 text-success" />}
                  {showResult && isSelected && !isCorrect && <XCircle className="w-5 h-5 mr-2 text-destructive" />}
                  {!showResult && <Lightbulb className="w-5 h-5 mr-2 text-muted-foreground" />}
                  {option}
                </Button>
              );
            })}

            {showFeedback && (
              <motion.div
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                className="mt-6 p-4 bg-muted rounded-lg text-left"
              >
                <p className="font-bold mb-2 flex items-center gap-2">
                  <BookOpen className="w-4 h-4" />
                  Explicação:
                </p>
                <p className="text-sm text-muted-foreground mb-2">{currentQuestion.explanation}</p>
                <p className="text-xs text-muted-foreground italic">
                  Referência: {currentQuestion.reference}
                </p>
                <Button onClick={handleNextQuestion} className="w-full mt-4">
                  {isQuizFinished ? (
                    <Link to="/game" className="w-full">
                      <Sparkles className="w-4 h-4 mr-2" /> Jogar o Jogo Completo!
                    </Link>
                  ) : (
                    "Próxima Pergunta"
                  )}
                </Button>
              </motion.div>
            )}
          </CardContent>
        </Card>
      </motion.div>
    </motion.section>
  );
}