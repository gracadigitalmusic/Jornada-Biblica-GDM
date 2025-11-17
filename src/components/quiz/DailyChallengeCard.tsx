import { motion } from 'framer-motion';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { Trophy, Coins, Check, ArrowRight, Sparkles } from 'lucide-react';
import { useDailyChallenge } from '@/hooks/useDailyChallenge';
import { useVirtualShop } from '@/hooks/useVirtualShop';
import { useToast } from '@/hooks/use-toast';

interface DailyChallengeCardProps {
  onStartChallenge: () => void;
  onClaimReward: () => void;
}

export function DailyChallengeCard({ onStartChallenge, onClaimReward }: DailyChallengeCardProps) {
  const { challenge } = useDailyChallenge();
  const { toast } = useToast();

  if (!challenge) return null;

  const progressPercent = (challenge.currentProgress / challenge.targetScore) * 100;

  const handleClaimReward = () => {
    onClaimReward();
    
    toast({
      title: "Recompensa Resgatada! 💰",
      description: `Você recebeu ${challenge.rewardCoins} moedas e ${challenge.rewardItem?.name || 'um item'}.`,
      duration: 5000,
    });
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: 0.8 }}
      className="w-full"
    >
      <Card className={`p-4 border-2 ${challenge.isCompleted ? 'border-success animate-pulse-glow-primary' : 'border-secondary/30 shimmer'}`}>
        <div className="flex items-center justify-between mb-3">
          <div className="flex items-center gap-2">
            <Trophy className="w-5 h-5 text-secondary" />
            <h3 className="font-bold text-lg">Desafio Diário</h3>
          </div>
          <span className="text-xs text-muted-foreground">
            {challenge.date}
          </span>
        </div>

        <p className="text-sm text-muted-foreground mb-3">
          Alcance <span className="font-bold text-primary">{challenge.targetScore} pontos</span> em qualquer modo para ganhar recompensas!
        </p>

        <Progress value={progressPercent} className="h-2 mb-3" />
        <p className="text-xs text-muted-foreground text-right mb-4">
          {challenge.currentProgress} / {challenge.targetScore} pts
        </p>

        <div className="flex justify-between items-center">
          <div className="flex items-center gap-2">
            <Coins className="w-5 h-5 text-yellow-500" />
            <span className="text-sm font-semibold text-yellow-500">
              {challenge.rewardCoins} Moedas
            </span>
            {challenge.rewardItem && (
              <span className="text-sm font-semibold text-primary flex items-center gap-1 ml-2">
                <Sparkles className="w-4 h-4" /> {challenge.rewardItem.name}
              </span>
            )}
          </div>

          {challenge.isCompleted ? (
            <Button onClick={handleClaimReward} disabled={challenge.isCompleted}>
              <Check className="w-4 h-4 mr-2" />
              Resgatado
            </Button>
          ) : (
            <Button onClick={onStartChallenge} size="sm" variant="secondary">
              Jogar
              <ArrowRight className="w-4 h-4 ml-2" />
            </Button>
          )}
        </div>
      </Card>
    </motion.div>
  );
}