import { motion } from 'framer-motion';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { TrendingUp, Award, Star } from 'lucide-react';
import { usePlayerLevel } from '@/hooks/usePlayerLevel';

export function PlayerLevelCard() {
  const level = usePlayerLevel();
  const nextLevel = level.getNextLevel();
  const progress = level.getProgressToNextLevel();

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.95 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{ delay: 0.2 }}
      className="w-fit"
    >
      <Card className="p-2 bg-background/50 backdrop-blur-sm border-border/50 hover:border-primary/30 transition-colors">
        <div className="flex items-center gap-2">
          <div className="p-1.5 bg-primary/10 rounded">
            <Star className="w-3 h-3 text-primary" />
          </div>
          <div className="flex items-center gap-2">
            <span className="text-xs font-medium">{level.currentLevel.title}</span>
            <Badge variant="secondary" className="text-xs px-1.5 py-0">
              Nv. {level.currentLevel.level}
            </Badge>
          </div>
          {nextLevel && (
            <div className="flex items-center gap-1.5 ml-1 pl-2 border-l border-border/50">
              <Progress value={progress} className="h-1 w-12" />
              <span className="text-[10px] text-muted-foreground">{Math.floor(progress)}%</span>
            </div>
          )}
          {!nextLevel && (
            <Award className="w-3 h-3 text-primary ml-1" />
          )}
        </div>
      </Card>
    </motion.div>
  );
}
