import { motion } from 'framer-motion';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Users, Crown, Check, X, Heart, Zap, Copy } from 'lucide-react';
import { useCoopMode, CoopPlayer } from '@/hooks/useCoopMode';
import { useState, useMemo } from 'react';
import { useToast } from '@/hooks/use-toast';
import { CoopChat } from './CoopChat';

interface CoopLobbyProps {
  onStartGame: () => void;
  onCancel: () => void;
}

export function CoopLobby({ onStartGame, onCancel }: CoopLobbyProps) {
  const coop = useCoopMode();
  const { toast } = useToast();
  
  const handleCopySessionId = () => {
    if (coop.session) {
      navigator.clipboard.writeText(coop.session.id);
      toast({
        title: "Código copiado!",
        description: "Compartilhe com seus amigos para jogar juntos.",
      });
    }
  };

  const handleStart = async () => {
    const started = await coop.startGame();
    if (started) {
      onStartGame();
    }
  };

  const currentPlayer = useMemo(() => {
    // Tenta encontrar o jogador atual (mocked userId for now)
    return coop.players.find(p => p.userId === coop.session?.hostId) || coop.players[0];
  }, [coop.players, coop.session]);

  if (!coop.session) {
    return null;
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-background to-muted/20 p-6 flex items-center justify-center">
      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        className="w-full max-w-6xl"
      >
        <Card className="border-primary/20">
          <CardHeader>
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <Users className="w-8 h-8 text-primary" />
                <div>
                  <CardTitle className="text-2xl">{coop.session.teamName}</CardTitle>
                  <p className="text-sm text-muted-foreground">
                    Modo Cooperativo - Capítulo {coop.session.currentChapter || 'Livre'}
                  </p>
                </div>
              </div>
              <Button variant="outline" onClick={onCancel}>
                <X className="w-4 h-4 mr-2" />
                Sair
              </Button>
            </div>
          </CardHeader>

          <CardContent className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Coluna 1 & 2: Info e Jogadores */}
            <div className="lg:col-span-2 space-y-6">
              {/* Session Info */}
              <div className="grid grid-cols-3 gap-4">
                <Card className="bg-primary/5">
                  <CardContent className="p-4 flex items-center gap-3">
                    <Users className="w-6 h-6 text-primary" />
                    <div>
                      <p className="text-sm text-muted-foreground">Jogadores</p>
                      <p className="text-xl font-bold">
                        {coop.players.length}/{coop.session.maxPlayers}
                      </p>
                    </div>
                  </CardContent>
                </Card>

                <Card className="bg-destructive/5">
                  <CardContent className="p-4 flex items-center gap-3">
                    <Heart className="w-6 h-6 text-destructive" />
                    <div>
                      <p className="text-sm text-muted-foreground">Vidas Compartilhadas</p>
                      <p className="text-xl font-bold">{coop.session.sharedLives}</p>
                    </div>
                  </CardContent>
                </Card>

                <Card className="bg-primary/5">
                  <CardContent className="p-4 flex items-center gap-3">
                    <Zap className="w-6 h-6 text-primary" />
                    <div>
                      <p className="text-sm text-muted-foreground">Power-ups</p>
                      <p className="text-xl font-bold">
                        {Object.values(coop.session.sharedPowerUps).reduce((a, b) => a + b, 0)}
                      </p>
                    </div>
                  </CardContent>
                </Card>
              </div>

              {/* Session Code */}
              {coop.isHost && (
                <div className="p-4 bg-muted rounded-lg">
                  <Label className="text-sm text-muted-foreground mb-2 block">
                    Código da Sessão
                  </Label>
                  <div className="flex gap-2">
                    <Input
                      value={coop.session.id.substring(0, 8).toUpperCase()}
                      readOnly
                      className="font-mono text-lg"
                    />
                    <Button onClick={handleCopySessionId} variant="outline">
                      <Copy className="w-4 h-4" />
                    </Button>
                  </div>
                  <p className="text-xs text-muted-foreground mt-2">
                    Compartilhe este código com seus amigos para entrarem no time
                  </p>
                </div>
              )}

              {/* Players List */}
              <div>
                <h3 className="text-lg font-semibold mb-3">Membros do Time</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                  {coop.players.map((player: CoopPlayer, idx: number) => (
                    <motion.div
                      key={player.userId}
                      initial={{ opacity: 0, x: -20 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: idx * 0.1 }}
                    >
                      <Card className={`${player.isReady ? 'border-primary' : 'border-border'}`}>
                        <CardContent className="p-4">
                          <div className="flex items-center justify-between">
                            <div className="flex items-center gap-3">
                              <div className="text-3xl">{player.avatar}</div>
                              <div>
                                <div className="flex items-center gap-2">
                                  <p className="font-semibold">{player.name}</p>
                                  {idx === 0 && (
                                    <Crown className="w-4 h-4 text-primary" />
                                  )}
                                </div>
                                <p className="text-sm text-muted-foreground">
                                  {player.location}
                                </p>
                              </div>
                            </div>
                            <div>
                              {player.isReady ? (
                                <Badge className="bg-green-500">
                                  <Check className="w-3 h-3 mr-1" />
                                  Pronto
                                </Badge>
                              ) : (
                                <Badge variant="secondary">Aguardando</Badge>
                              )}
                            </div>
                          </div>
                        </CardContent>
                      </Card>
                    </motion.div>
                  ))}
                </div>
              </div>

              {/* Actions */}
              <div className="flex gap-3 justify-end">
                {!currentPlayer?.isReady && (
                  <Button onClick={coop.toggleReady} variant="outline" size="lg">
                    <Check className="w-4 h-4 mr-2" />
                    Estou Pronto
                  </Button>
                )}
                
                {coop.isHost && (
                  <Button onClick={handleStart} size="lg" disabled={!coop.players.every(p => p.isReady)}>
                    Iniciar Jogo
                  </Button>
                )}
              </div>
            </div>

            {/* Coluna 3: Chat */}
            <div className="lg:col-span-1 h-[500px]">
              {currentPlayer && (
                <CoopChat session={coop.session} currentPlayer={currentPlayer} />
              )}
            </div>
          </CardContent>
        </Card>
      </motion.div>
    </div>
  );
}