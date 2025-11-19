import React, { useState } from "react";
import { motion, Variants } from "framer-motion";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { CheckCircle, XCircle, Lightbulb, BookOpen } from "lucide-react";

interface MiniQuestion {
  question: string;
  options: string[];
  answer: number;
  explanation: string;
  reference: string;
}

const miniQuizQuestions: MiniQuestion[] = [
  {
    question: "Quem foi o primeiro homem criado por Deus?",
    options: ["Noé", "Abraão", "Adão", "Moisés"],
    answer: 2,
    explanation: "Adão foi o primeiro homem, formado do pó da terra por Deus.",
    reference: "Gênesis 2:7"
  },
  {
    question: "Qual o sinal que Deus colocou no céu para prometer que nunca mais inundaria a Terra?",
    options: ["Uma estrela", "Um cometa", "Um arco-íris", "Uma nuvem especial"],
    answer: 2,
    explanation: "O arco-íris é o sinal da aliança de Deus com Noé e toda a criação, prometendo que nunca mais haveria um dilúvio global.",
    reference: "Gênesis 9:13"
  }
];

const sectionVariants: Variants = {
  hidden: { opacity: 0, y: 50 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.6, ease: [0.42, 0, 0.58, 1] } },
};

const itemVariants: Variants = {
  hidden: { opacity: 0, scale: 0.8 },
  visible: { opacity: 1, scale: 1, transition: { duration: 0.5, ease: [0.42, 0, 0.58, 1] } },
};

export function MiniQuizSection() {
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [selectedAnswer, setSelectedAnswer] = useState<number | null>(null);
  const [showFeedback, setShowFeedback] = useState(false);

  const currentQuestion = miniQuizQuestions[currentQuestionIndex];

  const handleAnswer = (index: number) => {
    if (selectedAnswer !== null) return;
    setSelectedAnswer(index);
    setShowFeedback(true);
  };

  const handleNextQuestion = () => {
    setSelectedAnswer(null);
    setShowFeedback(false);
    setCurrentQuestionIndex((prev) => (prev + 1) % miniQuizQuestions.length);
  };

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
        Responda a uma pergunta rápida e sinta o gostinho da Jornada Bíblica.
      </p>

      <motion.div variants={itemVariants}>
        <Card className="p-6 bg-quiz-card/50 border-primary/20">
          <CardHeader className="pb-4">
            <CardTitle className="text-xl font-bold mb-4">{currentQuestion.question}</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
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
                  Próxima Pergunta
                </Button>
              </motion.div>
            )}
          </CardContent>
        </Card>
      </motion.div>
    </motion.section>
  );
}