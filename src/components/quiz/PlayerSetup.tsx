import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { AVATARS_SOLO, AVATARS_MULTI } from "@/data/questions";
import { Player } from "@/types/quiz";
import { PlusCircle, XCircle } from "lucide-react";

interface PlayerSetupProps {
  open: boolean;
  onClose: () => void;
  onStart: (players: Player[]) => void;
  mode: 'solo' | 'multiplayer';
}

export function PlayerSetup({ open, onClose, onStart, mode }: PlayerSetupProps) {
  const [players, setPlayers] = useState<Array<{ name: string; avatar: string }>>([]);

  useEffect(() => {
    if (open) {
      if (mode === 'solo') {
        // Load last user
        const lastUser = localStorage.getItem('jb_last_user');
        const data = lastUser ? JSON.parse(lastUser) : { name: '', avatar: '📖' };
        setPlayers([data]);
      } else {
        // Initialize with 2 players
        setPlayers([
          { name: '', avatar: AVATARS_MULTI[0] },
          { name: '', avatar: AVATARS_MULTI[1] },
        ]);
      }
    }
  }, [open, mode]);

  const handleAvatarSelect = (playerIndex: number, avatar: string) => {
    setPlayers(prev => prev.map((p, i) => 
      i === playerIndex ? { ...p, avatar } : p
    ));
  };

  const handleNameChange = (playerIndex: number, name: string) => {
    setPlayers(prev => prev.map((p, i) => 
      i === playerIndex ? { ...p, name } : p
    ));
  };

  const handleAddPlayer = () => {
    if (players.length < 5) {
      const usedAvatars = players.map(p => p.avatar);
      const availableAvatar = AVATARS_MULTI.find(a => !usedAvatars.includes(a)) || AVATARS_MULTI[players.length];
      setPlayers(prev => [...prev, { name: '', avatar: availableAvatar }]);
    }
  };

  const handleRemovePlayer = (index: number) => {
    if (players.length > 2) {
      setPlayers(prev => prev.filter((_, i) => i !== index));
    }
  };

  const handleStart = () => {
    const validPlayers = players.filter(p => p.name.trim().length >= 2);
    
    if (mode === 'solo' && validPlayers.length === 0) {
      alert("Por favor, digite seu nome para o Hall da Fama.");
      return;
    }

    if (mode === 'multiplayer' && validPlayers.length < 2) {
      alert("Por favor, digite o nome de pelo menos 2 jogadores.");
      return;
    }

    const playersList: Player[] = validPlayers.map(p => ({
      name: p.name.trim(),
      location: '',
      score: 0,
      avatar: p.avatar,
    }));

    if (mode === 'solo') {
      localStorage.setItem('jb_last_user', JSON.stringify(playersList[0]));
    }

    onStart(playersList);
  };

  const avatars = mode === 'solo' ? AVATARS_SOLO : AVATARS_MULTI;
  const usedAvatars = players.map(p => p.avatar);

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="max-w-lg max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="text-2xl">
            {mode === 'solo' ? 'Modo Solo' : 'Modo Multiplayer'}
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-6 mt-4">
          <p className="text-sm text-muted-foreground">
            {mode === 'solo' 
              ? 'Escolha seu avatar e digite seu nome!' 
              : 'Digite o nome e escolha o avatar de cada jogador (2 a 5).'}
          </p>

          <div className="space-y-4">
            {players.map((player, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                className="p-4 bg-muted/5 rounded-lg border border-border"
              >
                <div className="flex items-center gap-2 mb-3">
                  <Input
                    value={player.name}
                    onChange={(e) => handleNameChange(index, e.target.value)}
                    placeholder={mode === 'solo' ? 'Seu Nome' : `Nome do Jogador ${index + 1}`}
                    className="flex-1"
                  />
                  {mode === 'multiplayer' && players.length > 2 && (
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={() => handleRemovePlayer(index)}
                      className="text-destructive"
                    >
                      <XCircle className="w-5 h-5" />
                    </Button>
                  )}
                </div>

                <div className="flex flex-wrap gap-2 justify-center">
                  {avatars.map((avatar) => {
                    const isSelected = player.avatar === avatar;
                    const isTaken = usedAvatars.includes(avatar) && !isSelected;
                    
                    return (
                      <button
                        key={avatar}
                        onClick={() => !isTaken && handleAvatarSelect(index, avatar)}
                        disabled={isTaken}
                        className={`
                          w-12 h-12 rounded-full text-2xl flex items-center justify-center
                          transition-all duration-200 border-2
                          ${isSelected 
                            ? 'border-primary bg-primary text-primary-foreground scale-110' 
                            : isTaken
                            ? 'border-destructive/30 opacity-30 cursor-not-allowed'
                            : 'border-border hover:border-primary hover:bg-muted'
                          }
                        `}
                      >
                        {avatar}
                      </button>
                    );
                  })}
                </div>
              </motion.div>
            ))}
          </div>

          {mode === 'multiplayer' && players.length < 5 && (
            <Button
              variant="outline"
              className="w-full gap-2"
              onClick={handleAddPlayer}
            >
              <PlusCircle className="w-4 h-4" />
              Adicionar mais participantes
            </Button>
          )}

          <Button
            onClick={handleStart}
            className="w-full text-lg py-6 bg-gradient-to-r from-primary to-primary/80 hover:from-primary/90 hover:to-primary/70"
            size="lg"
          >
            {mode === 'solo' ? 'Começar a Jogar!' : 'Começar Batalha!'}
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
