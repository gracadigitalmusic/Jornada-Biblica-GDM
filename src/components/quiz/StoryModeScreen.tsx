import { motion } from 'framer-motion';
import { Book, Lock, CheckCircle, Star, ArrowLeft } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { StoryChapter } from '@/types/quiz';

interface StoryModeScreenProps {
  chapters: StoryChapter[];
  onSelectChapter: (chapterId: string) => void;
  onBack: () => void;
  totalScore: number;
}

export function StoryModeScreen({ chapters, onSelectChapter, onBack, totalScore }: StoryModeScreenProps) {
  const completedChapters = chapters.filter(ch => ch.completed).length;
  const progress = (completedChapters / chapters.length) * 100;

  return (
    <div className="min-h-screen bg-gradient-to-b from-background to-muted/20 p-6">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="max-w-6xl mx-auto"
      >
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-4xl font-bold flex items-center gap-3 mb-2">
              <Book className="w-10 h-10 text-primary" />
              Modo História
            </h1>
            <p className="text-muted-foreground">
              Jornada épica através das escrituras sagradas
            </p>
          </div>
          <Button onClick={onBack} variant="outline">
            <ArrowLeft className="w-4 h-4 mr-2" />
            Voltar
          </Button>
        </div>

        <Card className="mb-8 bg-gradient-to-r from-primary/10 to-primary/5">
          <CardContent className="p-6">
            <div className="flex items-center justify-between mb-4">
              <div>
                <h3 className="text-xl font-semibold mb-1">Progresso da Jornada</h3>
                <p className="text-sm text-muted-foreground">
                  {completedChapters} de {chapters.length} capítulos concluídos
                </p>
              </div>
              <div className="text-right">
                <div className="text-2xl font-bold text-primary">{Math.round(progress)}%</div>
                <div className="text-xs text-muted-foreground">Completo</div>
              </div>
            </div>
            <Progress value={progress} className="h-3" />
          </CardContent>
        </Card>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {chapters.map((chapter, index) => (
            <motion.div
              key={chapter.id}
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: index * 0.1 }}
            >
              <Card 
                className={`relative overflow-hidden transition-all hover:shadow-lg ${
                  !chapter.unlocked ? 'opacity-60' : 'cursor-pointer hover:scale-105'
                }`}
                onClick={() => chapter.unlocked && onSelectChapter(chapter.id)}
              >
                <div className="absolute top-0 right-0 w-32 h-32 bg-primary/5 rounded-bl-full" />
                
                <CardContent className="p-6">
                  <div className="flex items-start justify-between mb-4">
                    <div className="flex-1">
                      <Badge variant={chapter.completed ? 'default' : 'secondary'} className="mb-2">
                        Capítulo {index + 1}
                      </Badge>
                      <h3 className="text-xl font-bold mb-2">{chapter.title}</h3>
                      <p className="text-sm text-muted-foreground line-clamp-2">
                        {chapter.description}
                      </p>
                    </div>
                    {chapter.completed ? (
                      <CheckCircle className="w-8 h-8 text-green-500 flex-shrink-0" />
                    ) : !chapter.unlocked ? (
                      <Lock className="w-8 h-8 text-muted-foreground flex-shrink-0" />
                    ) : (
                      <Star className="w-8 h-8 text-primary flex-shrink-0" />
                    )}
                  </div>

                  {!chapter.unlocked && (
                    <div className="mt-4 p-3 bg-muted rounded-lg">
                      <p className="text-xs text-muted-foreground">
                        Desbloqueio em: <span className="font-bold">{chapter.requiredScore}</span> pontos
                      </p>
                      <p className="text-xs text-muted-foreground mt-1">
                        Você tem: <span className="font-bold text-primary">{totalScore}</span> pontos
                      </p>
                      <Progress 
                        value={(totalScore / chapter.requiredScore) * 100} 
                        className="h-1.5 mt-2" 
                      />
                    </div>
                  )}

                  {chapter.unlocked && !chapter.completed && (
                    <Button className="w-full mt-4" variant="outline">
                      Iniciar Capítulo
                    </Button>
                  )}
                </CardContent>
              </Card>
            </motion.div>
          ))}
        </div>
      </motion.div>
    </div>
  );
}
