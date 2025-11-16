import { useState } from 'react';
import { motion } from 'framer-motion';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { BookOpen, ChevronRight, Check, ArrowLeft } from 'lucide-react';
import { Question } from '@/types/quiz';
import { FALLBACK_QUESTIONS } from '@/data/questions';
import { useReviewHistory } from '@/hooks/useReviewHistory';

interface ReviewModeProps {
  onBack: () => void;
}

export function ReviewMode({ onBack }: ReviewModeProps) {
  const { getIncorrectQuestionIds } = useReviewHistory();
  const [questions] = useState<Question[]>(() => {
    const ids = getIncorrectQuestionIds();
    // Mantém a ordem das perguntas erradas, da mais recente para a mais antiga
    return ids.map(id => FALLBACK_QUESTIONS.find(q => q.id === id)).filter((q): q is Question => !!q);
  });
  
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);

  if (questions.length === 0) {
    return (
      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        className="w-full max-w-2xl mx-auto"
      >
        <Card className="p-8 bg-quiz-card text-center">
          <div className="flex justify-center mb-4">
            <div className="p-4 bg-secondary/10 rounded-full">
              <BookOpen className="w-12 h-12 text-secondary" />
            </div>
          </div>
          <h2 className="text-3xl font-black text-gradient-secondary mb-2">
            MODO REVISÃO
          </h2>
          <p className="text-muted-foreground mb-6">
            Você ainda não errou nenhuma pergunta! Continue jogando para desbloquear este modo.
          </p>
          <Button variant="outline" onClick={onBack} className="w-full">
            Voltar ao Menu
          </Button>
        </Card>
      </motion.div>
    );
  }

  const currentQuestion = questions[currentQuestionIndex];

  const handleNext = () => {
    setCurrentQuestionIndex((prev) => (prev + 1) % questions.length);
  };

  const handlePrevious = () => {
    setCurrentQuestionIndex((prev) => (prev - 1 + questions.length) % questions.length);
  };

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.95 }}
      animate={{ opacity: 1, scale: 1 }}
      className="w-full max-w-4xl mx-auto"
    >
      <Card className="p-6 bg-quiz-card">
        <div className="flex items-center justify-between mb-6">
          <Button
            variant="ghost"
            size="sm"
            onClick={onBack}
          >
            <ArrowLeft className="w-4 h-4 mr-2" />
            Voltar ao Menu
          </Button>
          <Badge variant="secondary">
            {currentQuestionIndex + 1} / {questions.length}
          </Badge>
        </div>

        <div className="space-y-6">
          <div>
            <Badge className="mb-3">{currentQuestion.difficulty}</Badge>
            <h3 className="text-2xl font-bold mb-4">{currentQuestion.question}</h3>
          </div>

          <div className="space-y-3">
            {currentQuestion.options.map((option, index) => {
              const isCorrect = index === currentQuestion.answer;
              return (
                <div
                  key={index}
                  className={`w-full p-4 rounded-lg text-left transition-all flex items-center justify-between ${
                    isCorrect
                      ? 'bg-success/20 border-2 border-success'
                      : 'bg-background border-2 border-border opacity-60'
                  }`}
                >
                  <span className="font-medium">{option}</span>
                  {isCorrect && <Check className="w-5 h-5 text-success" />}
                </div>
              );
            })}
          </div>

          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            className="p-4 bg-muted rounded-lg"
          >
            <p className="font-bold mb-2 flex items-center gap-2">
              <BookOpen className="w-4 h-4" />
              Explicação:
            </p>
            <p className="text-sm text-muted-foreground mb-2">{currentQuestion.explanation}</p>
            <p className="text-xs text-muted-foreground italic">
              Referência: {currentQuestion.reference}
            </p>
          </motion.div>

          <div className="flex gap-3">
            <Button
              variant="outline"
              onClick={handlePrevious}
              className="flex-1"
            >
              Anterior
            </Button>
            <Button
              onClick={handleNext}
              className="flex-1"
            >
              Próxima
              <ChevronRight className="w-4 h-4 ml-2" />
            </Button>
          </div>
        </div>
      </Card>
    </motion.div>
  );
}