import { motion } from 'framer-motion';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { Trophy, Coins, Check, ArrowRight, Sparkles, Target, Zap, BookOpen } from 'lucide-react'; // Novos ícones
import { useDailyChallenge } from '@/hooks/useDailyChallenge';
import { useToast } from '@/hooks/use-toast';

interface DailyChallengeCardProps {
  onStartChallenge: () => void;
  onClaimReward: () => void;
}

export function DailyChallengeCard({ onStartChallenge, onClaimReward }: DailyChallengeCardProps) {
  const { challenge } = useDailyChallenge();
  const { toast } = useToast();

  if (!challenge) return null;

  const progressPercent = (challenge.currentProgress / challenge.target) * 100;

  const handleClaimReward = () => {
    onClaimReward();
    
    toast({
      title: "Recompensa Resgatada! 💰",
      description: `Você recebeu ${challenge.rewardCoins} moedas e ${challenge.rewardItem?.name || 'um item'}.`,
      duration: 5000,
    });
  };

  const getChallengeDescription = () => {
    switch (challenge.type) {
      case 'score':
        return `Alcance <span class="font-bold text-primary">${challenge.target} pontos</span> em qualquer modo para ganhar recompensas!`;
      case 'combo':
        return `Alcance um combo de <span class="font-bold text-primary">${challenge.target} acertos</span> seguidos para ganhar recompensas!`;
      case 'category_correct':
        return `Acerte <span class="font-bold text-primary">${challenge.target} perguntas</span> na categoria <span class="font-bold text-primary">${challenge.category?.replace(/_/g, ' ').toUpperCase()}</span>!`;
      case 'marathon_score':
        return `Faça <span class="font-bold text-primary">${challenge.target} pontos</span> no Modo Maratona para ganhar recompensas!`;
      default:
        return `Complete este desafio para ganhar recompensas!`;
    }
  };

  const getChallengeIcon = () => {
    switch (challenge.type) {
      case 'score': return <Trophy className="w-5 h-5 text-secondary" />;
      case 'combo': return <Zap className="w-5 h-5 text-secondary" />;
      case 'category_correct': return <BookOpen className="w-5 h-5 text-secondary" />;
      case 'marathon_score': return <Target className="w-5 h-5 text-secondary" />;
      default: return <Trophy className="w-5 h-5 text-secondary" />;
    }
  };

  const getProgressText = () => {
    switch (challenge.type) {
      case 'score':
      case 'marathon_score':
        return `${challenge.currentProgress} / ${challenge.target} pts`;
      case 'combo':
        return `Combo: ${challenge.currentProgress} / ${challenge.target}`;
      case 'category_correct':
        return `Acertos: ${challenge.currentProgress} / ${challenge.target}`;
      default:
        return `${challenge.currentProgress} / ${challenge.target}`;
    }
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
            {getChallengeIcon()}
            <h3 className="font-bold text-lg">Desafio Diário</h3>
          </div>
          <span className="text-xs text-muted-foreground">
            {challenge.date}
          </span>
        </div>

        <p className="text-sm text-muted-foreground mb-3" dangerouslySetInnerHTML={{ __html: getChallengeDescription() }} />

        <Progress value={progressPercent} className="h-2 mb-3" />
        <p className="text-xs text-muted-foreground text-right mb-4">
          {getProgressText()}
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