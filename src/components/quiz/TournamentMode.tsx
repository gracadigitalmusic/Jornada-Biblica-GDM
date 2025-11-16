import { motion } from 'framer-motion';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Trophy, Clock, Users, Target, Medal, Award } from 'lucide-react';
import { useTournament } from '@/hooks/useTournament';

interface TournamentModeProps {
  onStart: () => void;
  onBack: () => void;
}

export function TournamentMode({ onStart, onBack }: TournamentModeProps) {
  const tournament = useTournament();
  const ranking = tournament.getRanking();

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.95 }}
      animate={{ opacity: 1, scale: 1 }}
      className="w-full max-w-4xl mx-auto"
    >
      <Card className="p-8 bg-quiz-card border-2 border-primary/30">
        <div className="text-center mb-6">
          <div className="flex justify-center mb-4">
            <div className="p-4 bg-primary/10 rounded-full">
              <Trophy className="w-12 h-12 text-primary" />
            </div>
          </div>
          <h2 className="text-3xl font-black text-gradient-primary mb-2">
            TORNEIO SEMANAL
          </h2>
          <div className="flex items-center justify-center gap-2 text-sm text-muted-foreground">
            <Clock className="w-4 h-4" />
            <span>{tournament.getTimeRemaining()}</span>
          </div>
        </div>

        <div className="grid md:grid-cols-3 gap-4 mb-6">
          <div className="p-4 bg-background/50 rounded-lg text-center">
            <Target className="w-6 h-6 text-primary mx-auto mb-2" />
            <p className="text-sm font-bold">10 Perguntas</p>
            <p className="text-xs text-muted-foreground">Fixas para todos</p>
          </div>
          <div className="p-4 bg-background/50 rounded-lg text-center">
            <Users className="w-6 h-6 text-secondary mx-auto mb-2" />
            <p className="text-sm font-bold">{ranking.length} Participantes</p>
            <p className="text-xs text-muted-foreground">Esta semana</p>
          </div>
          <div className="p-4 bg-background/50 rounded-lg text-center">
            <Trophy className="w-6 h-6 text-success mx-auto mb-2" />
            <p className="text-sm font-bold">Badges Exclusivos</p>
            <p className="text-xs text-muted-foreground">Para o top 3</p>
          </div>
        </div>

        <div className="mb-6">
          <h3 className="text-lg font-bold mb-3 flex items-center gap-2">
            <Medal className="w-5 h-5 text-primary" />
            Ranking Semanal
          </h3>
          <div className="space-y-2 max-h-64 overflow-y-auto">
            {ranking.length === 0 ? (
              <p className="text-center text-muted-foreground py-8">
                Seja o primeiro a participar esta semana!
              </p>
            ) : (
              ranking.slice(0, 10).map((entry, index) => (
                <div
                  key={index}
                  className={`flex items-center gap-3 p-3 rounded-lg ${
                    index < 3 ? 'bg-primary/10' : 'bg-background/50'
                  }`}
                >
                  <div className="text-2xl font-black w-8 text-center">
                    {index === 0 && '🥇'}
                    {index === 1 && '🥈'}
                    {index === 2 && '🥉'}
                    {index > 2 && `${index + 1}`}
                  </div>
                  <div className="text-2xl">{entry.avatar}</div>
                  <div className="flex-1">
                    <p className="font-bold">{entry.name}</p>
                    <p className="text-xs text-muted-foreground">
                      {entry.questionsAnswered} perguntas
                    </p>
                  </div>
                  <div className="text-right">
                    <p className="text-lg font-black text-primary">{entry.score}</p>
                    <p className="text-xs text-muted-foreground">pontos</p>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>

        <div className="flex gap-3">
          <Button
            variant="outline"
            onClick={onBack}
            className="flex-1"
          >
            Voltar
          </Button>
          <Button
            onClick={onStart}
            className="flex-1"
          >
            <Award className="w-4 h-4 mr-2" />
            Participar do Torneio
          </Button>
        </div>
      </Card>
    </motion.div>
  );
}
