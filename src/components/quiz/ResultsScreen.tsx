import { useEffect } from "react";
import { motion } from "framer-motion";
import { Button } from "@/components/ui/button";
import { Trophy, Award, Medal, Star, Share2 } from "lucide-react";
import { Player } from "@/types/quiz";
import { useGameSounds } from "@/hooks/useGameSounds";

interface ResultsScreenProps {
  players: Player[];
  gameMode: 'solo' | 'multiplayer';
  isGameOver?: boolean;
  onContinue: () => void;
  onEndGame: () => void;
}

export function ResultsScreen({
  players,
  gameMode,
  isGameOver = false,
  onContinue,
  onEndGame,
}: ResultsScreenProps) {
  const { playVictory } = useGameSounds();
  const sortedPlayers = [...players].sort((a, b) => b.score - a.score);
  const winner = sortedPlayers[0];

  useEffect(() => {
    playVictory();
  }, [playVictory]);

  const handleShare = () => {
    const gameUrl = window.location.href;
    let shareText = "";

    if (gameMode === 'solo') {
      const score = winner.score;
      shareText = `✨ Uau! Consegui *${score} pontos* na Jornada Bíblica! 🕊️ Foi uma bênção! Será que você conhece a Palavra mais do que eu? Te desafio a me vencer! ✝️ Jogue agora: ${gameUrl}`;
    } else {
      const podiumString = sortedPlayers.map((player, index) => {
        return `*${index + 1}º* - ${player.avatar} ${player.name} (${player.score} pts)`;
      }).join('\n');

      shareText = `🏆 Batalha dos Sábios na Jornada Bíblica! 📖\n\nFoi uma disputa incrível em família! O resultado final foi:\n${podiumString}\n\nTe desafio a reunir sua família e amigos para ver quem vence! 🙏\n\nAcesse e jogue: ${gameUrl}`;
    }

    const encodedText = encodeURIComponent(shareText);
    const whatsappUrl = `https://api.whatsapp.com/send?text=${encodedText}`;
    window.open(whatsappUrl, '_blank');
  };

  const podiumIcons = [
    <Award key="1" className="w-6 h-6 text-secondary" />,
    <Medal key="2" className="w-6 h-6 text-muted-foreground" />,
    <Star key="3" className="w-6 h-6 text-secondary/60" />,
  ];

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.95 }}
      animate={{ opacity: 1, scale: 1 }}
      className="text-center space-y-6"
    >
      <div className="space-y-2">
        <motion.h2
          initial={{ scale: 0 }}
          animate={{ scale: 1 }}
          transition={{ type: "spring", bounce: 0.5 }}
          className="text-4xl md:text-5xl font-black"
        >
          {isGameOver ? "Fim de Jogo!" : gameMode === 'solo' ? "Sessão Completa!" : "Fim da Batalha!"}
        </motion.h2>

        {gameMode === 'solo' ? (
          <div className="space-y-4">
            <motion.div
              initial={{ y: 20, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              transition={{ delay: 0.2 }}
              className="flex items-center justify-center gap-4"
            >
              <span className="text-6xl">{winner.avatar}</span>
              <div className="text-left">
                <p className="text-2xl font-bold text-foreground">{winner.name}</p>
                <p className="text-4xl font-black text-gradient-primary">{winner.score} pts</p>
              </div>
            </motion.div>

            <motion.p
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.4 }}
              className="text-lg text-muted-foreground"
            >
              {isGameOver 
                ? "Sua pontuação não foi salva (vidas esgotadas)." 
                : winner.score > 0
                ? "Sua pontuação foi salva no Hall da Fama!"
                : "Faça pontos para entrar no Hall da Fama!"}
            </motion.p>
          </div>
        ) : (
          <div className="space-y-6">
            <motion.div
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              transition={{ delay: 0.2, type: "spring", bounce: 0.5 }}
              className="text-2xl font-bold text-secondary"
            >
              {winner.score > 0 && sortedPlayers.every(p => p.score === winner.score)
                ? "Houve um Empate entre todos!"
                : winner.score > 0 && winner.score === sortedPlayers[1]?.score
                ? "Houve um Empate!"
                : `Parabéns, ${winner.name} venceu!`}
            </motion.div>

            <div className="max-w-md mx-auto space-y-3">
              {sortedPlayers.map((player, index) => (
                <motion.div
                  key={player.name}
                  initial={{ x: -50, opacity: 0 }}
                  animate={{ x: 0, opacity: 1 }}
                  transition={{ delay: 0.3 + index * 0.1 }}
                  className="flex items-center gap-4 p-4 bg-quiz-card rounded-xl border border-border"
                >
                  <span className="text-3xl">{player.avatar}</span>
                  <span className="text-2xl font-bold w-8">{index + 1}º</span>
                  {podiumIcons[index] || <div className="w-6" />}
                  <span className="flex-1 text-left font-semibold text-lg">{player.name}</span>
                  <span className="text-xl font-bold text-primary">{player.score} pts</span>
                </motion.div>
              ))}
            </div>
          </div>
        )}
      </div>

      {/* Share Button */}
      {!isGameOver && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.6 }}
        >
          <Button
            onClick={handleShare}
            className="w-full max-w-xs bg-[#25D366] hover:bg-[#1FAF55] text-white gap-2"
            size="lg"
          >
            <Share2 className="w-5 h-5" />
            Compartilhar no WhatsApp
          </Button>
        </motion.div>
      )}

      {/* Action Buttons */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.7 }}
        className="flex flex-col sm:flex-row justify-center gap-4"
      >
        {!isGameOver && (
          <Button onClick={onContinue} size="lg" variant="default">
            Continuar Jogando
          </Button>
        )}
        <Button onClick={onEndGame} size="lg" variant="outline">
          Encerrar Jogo
        </Button>
      </motion.div>
    </motion.div>
  );
}
