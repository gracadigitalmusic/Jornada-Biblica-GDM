import { motion } from 'framer-motion';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Award, Trophy, Zap, Target, Crown, Star, Flame, Shield } from 'lucide-react';
import { useAchievements } from '@/hooks/useAchievements';
import { usePlayerLevel } from '@/hooks/usePlayerLevel';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';

const BADGE_ICONS: Record<string, any> = {
  first_correct: Award,
  combo_3: Flame,
  combo_5: Flame,
  combo_10: Flame,
  perfect_session: Trophy,
  clutch_master: Target,
  no_hints_god: Crown,
  full_lives: Shield,
  speed_demon: Zap,
};

export function BadgesDisplay() {
  const achievements = useAchievements();
  const level = usePlayerLevel();
  
  const unlockedAchievements = achievements.getAchievements().filter(a => a.unlocked);
  const totalBadges = unlockedAchievements.length + (level.currentLevel.level - 1);

  return (
    <motion.div
      initial={{ opacity: 0, y: -10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: 0.4 }}
    >
      <Card className="p-3 bg-background/50 backdrop-blur-sm border-border/50">
        <div className="flex items-center justify-between mb-2">
          <div className="flex items-center gap-2">
            <Trophy className="w-4 h-4 text-primary" />
            <span className="text-sm font-bold">Badges</span>
          </div>
          <Badge variant="secondary" className="text-xs">
            {totalBadges}
          </Badge>
        </div>
        
        <TooltipProvider>
          <div className="flex flex-wrap gap-2">
            {/* Level Badges */}
            {level.allLevels.slice(1, level.currentLevel.level).map((lvl) => (
              <Tooltip key={`level-${lvl.level}`}>
                <TooltipTrigger>
                  <motion.div
                    initial={{ scale: 0 }}
                    animate={{ scale: 1 }}
                    transition={{ type: 'spring', stiffness: 300 }}
                    className="p-2 bg-gradient-to-br from-primary/20 to-primary/10 rounded-lg border border-primary/30 hover:scale-110 transition-transform"
                  >
                    <Star className="w-4 h-4 text-primary" />
                  </motion.div>
                </TooltipTrigger>
                <TooltipContent>
                  <p className="font-bold">{lvl.title}</p>
                  <p className="text-xs text-muted-foreground">Nível {lvl.level}</p>
                </TooltipContent>
              </Tooltip>
            ))}

            {/* Achievement Badges */}
            {unlockedAchievements.map((achievement) => {
              const Icon = BADGE_ICONS[achievement.id] || Award;
              return (
                <Tooltip key={achievement.id}>
                  <TooltipTrigger>
                    <motion.div
                      initial={{ scale: 0 }}
                      animate={{ scale: 1 }}
                      transition={{ type: 'spring', stiffness: 300 }}
                      className="p-2 bg-gradient-to-br from-secondary/20 to-secondary/10 rounded-lg border border-secondary/30 hover:scale-110 transition-transform"
                    >
                      <Icon className="w-4 h-4 text-secondary" />
                    </motion.div>
                  </TooltipTrigger>
                  <TooltipContent>
                    <p className="font-bold">{achievement.title}</p>
                    <p className="text-xs text-muted-foreground">{achievement.desc}</p>
                  </TooltipContent>
                </Tooltip>
              );
            })}

            {/* Empty slots */}
            {totalBadges === 0 && (
              <p className="text-xs text-muted-foreground">
                Complete desafios para ganhar badges!
              </p>
            )}
          </div>
        </TooltipProvider>
      </Card>
    </motion.div>
  );
}
