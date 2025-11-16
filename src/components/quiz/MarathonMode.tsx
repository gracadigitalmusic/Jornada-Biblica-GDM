import { useState } from 'react';
import { motion } from 'framer-motion';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Trophy, Zap, Heart, Target } from 'lucide-react';
import { Player } from '@/types/quiz';

interface MarathonModeProps {
  onStart: (player: Player) => void;
  onBack: () => void;
}

export function MarathonMode({ onStart, onBack }: MarathonModeProps) {
  const [playerName, setPlayerName] = useState('');
  const [selectedAvatar, setSelectedAvatar] = useState('👨');

  const avatars = ["👨", "👩", "🧔", "👴", "👵", "🧑", "🧒", "👶"];

  const handleStart = () => {
    if (!playerName.trim()) return;
    
    onStart({
      name: playerName,
      location: 'Maratona',
      score: 0,
      avatar: selectedAvatar
    });
  };

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.95 }}
      animate={{ opacity: 1, scale: 1 }}
      className="w-full max-w-2xl mx-auto"
    >
      <Card className="p-8 bg-quiz-card border-2 border-primary/30">
        <div className="text-center mb-6">
          <div className="flex justify-center mb-4">
            <div className="p-4 bg-primary/10 rounded-full">
              <Zap className="w-12 h-12 text-primary" />
            </div>
          </div>
          <h2 className="text-3xl font-black text-gradient-primary mb-2">
            MODO MARATONA
          </h2>
          <p className="text-muted-foreground">
            Teste sua resistência! Responda perguntas infinitas até perder 3 vidas
          </p>
        </div>

        <div className="space-y-6 mb-8">
          <div className="grid grid-cols-3 gap-4 text-center">
            <div className="p-4 bg-background/50 rounded-lg">
              <Heart className="w-6 h-6 text-destructive mx-auto mb-2" />
              <p className="text-sm font-bold">3 Vidas</p>
              <p className="text-xs text-muted-foreground">Inicial</p>
            </div>
            <div className="p-4 bg-background/50 rounded-lg">
              <Zap className="w-6 h-6 text-secondary mx-auto mb-2" />
              <p className="text-sm font-bold">Multiplicador</p>
              <p className="text-xs text-muted-foreground">Crescente</p>
            </div>
            <div className="p-4 bg-background/50 rounded-lg">
              <Trophy className="w-6 h-6 text-primary mx-auto mb-2" />
              <p className="text-sm font-bold">Ranking</p>
              <p className="text-xs text-muted-foreground">Especial</p>
            </div>
          </div>

          <div className="space-y-4">
            <div>
              <label className="block text-sm font-bold mb-2">Seu Nome</label>
              <input
                type="text"
                value={playerName}
                onChange={(e) => setPlayerName(e.target.value)}
                className="w-full px-4 py-3 bg-background border-2 border-border rounded-lg focus:border-primary outline-none"
                placeholder="Digite seu nome..."
                maxLength={20}
              />
            </div>

            <div>
              <label className="block text-sm font-bold mb-2">Escolha seu Avatar</label>
              <div className="grid grid-cols-8 gap-2">
                {avatars.map((avatar) => (
                  <button
                    key={avatar}
                    onClick={() => setSelectedAvatar(avatar)}
                    className={`text-3xl p-2 rounded-lg transition-all ${
                      selectedAvatar === avatar
                        ? 'bg-primary/20 ring-2 ring-primary scale-110'
                        : 'bg-background hover:bg-muted'
                    }`}
                  >
                    {avatar}
                  </button>
                ))}
              </div>
            </div>
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
            onClick={handleStart}
            disabled={!playerName.trim()}
            className="flex-1"
          >
            <Target className="w-4 h-4 mr-2" />
            Começar Maratona
          </Button>
        </div>
      </Card>
    </motion.div>
  );
}
