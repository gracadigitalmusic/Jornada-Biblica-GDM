import { useState } from 'react';
import { motion } from 'framer-motion';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { BookOpen, ChevronRight, Check, X, ArrowLeft } from 'lucide-react';
import { Question } from '@/types/quiz';
import { FALLBACK_QUESTIONS } from '@/data/questions';

interface StudyModeProps {
  onBack: () => void;
}

export function StudyMode({ onBack }: StudyModeProps) {
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [selectedAnswer, setSelectedAnswer] = useState<number | null>(null);

  const categories = Array.from(new Set(FALLBACK_QUESTIONS.map(q => q.category)));
  const filteredQuestions = selectedCategory
    ? FALLBACK_QUESTIONS.filter(q => q.category === selectedCategory)
    : FALLBACK_QUESTIONS;

  const currentQuestion = filteredQuestions[currentQuestionIndex];

  const handleNext = () => {
    setSelectedAnswer(null);
    setCurrentQuestionIndex((prev) => (prev + 1) % filteredQuestions.length);
  };

  const handlePrevious = () => {
    setSelectedAnswer(null);
    setCurrentQuestionIndex((prev) => (prev - 1 + filteredQuestions.length) % filteredQuestions.length);
  };

  if (!selectedCategory) {
    return (
      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        className="w-full max-w-4xl mx-auto"
      >
        <Card className="p-8 bg-quiz-card">
          <div className="text-center mb-6">
            <div className="flex justify-center mb-4">
              <div className="p-4 bg-secondary/10 rounded-full">
                <BookOpen className="w-12 h-12 text-secondary" />
              </div>
            </div>
            <h2 className="text-3xl font-black text-gradient-secondary mb-2">
              MODO ESTUDO
            </h2>
            <p className="text-muted-foreground">
              Aprenda sem pressão de tempo. Escolha uma categoria:
            </p>
          </div>

          <div className="grid grid-cols-2 md:grid-cols-3 gap-3 mb-6">
            {categories.map((category) => {
              const count = FALLBACK_QUESTIONS.filter(q => q.category === category).length;
              return (
                <button
                  key={category}
                  onClick={() => setSelectedCategory(category)}
                  className="p-4 bg-background hover:bg-muted border-2 border-border hover:border-secondary rounded-lg transition-all text-left group"
                >
                  <p className="font-bold text-sm mb-1 group-hover:text-secondary transition-colors">
                    {category.replace(/_/g, ' ').toUpperCase()}
                  </p>
                  <p className="text-xs text-muted-foreground">{count} perguntas</p>
                </button>
              );
            })}
          </div>

          <Button variant="outline" onClick={onBack} className="w-full">
            Voltar ao Menu
          </Button>
        </Card>
      </motion.div>
    );
  }

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
            onClick={() => setSelectedCategory(null)}
          >
            <ArrowLeft className="w-4 h-4 mr-2" />
            Categorias
          </Button>
          <Badge variant="secondary">
            {currentQuestionIndex + 1} / {filteredQuestions.length}
          </Badge>
        </div>

        <div className="space-y-6">
          <div>
            <Badge className="mb-3">{currentQuestion.difficulty}</Badge>
            <h3 className="text-2xl font-bold mb-4">{currentQuestion.question}</h3>
          </div>

          <div className="space-y-3">
            {currentQuestion.options.map((option, index) => {
              const isSelected = selectedAnswer === index;
              const isCorrect = index === currentQuestion.answer;
              const showFeedback = selectedAnswer !== null;

              return (
                <button
                  key={index}
                  onClick={() => setSelectedAnswer(index)}
                  disabled={selectedAnswer !== null}
                  className={`w-full p-4 rounded-lg text-left transition-all flex items-center justify-between ${
                    showFeedback
                      ? isCorrect
                        ? 'bg-success/20 border-2 border-success'
                        : isSelected
                        ? 'bg-destructive/20 border-2 border-destructive'
                        : 'bg-background border-2 border-border opacity-50'
                      : 'bg-background hover:bg-muted border-2 border-border hover:border-primary'
                  }`}
                >
                  <span className="font-medium">{option}</span>
                  {showFeedback && isCorrect && <Check className="w-5 h-5 text-success" />}
                  {showFeedback && isSelected && !isCorrect && <X className="w-5 h-5 text-destructive" />}
                </button>
              );
            })}
          </div>

          {selectedAnswer !== null && (
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
          )}

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
