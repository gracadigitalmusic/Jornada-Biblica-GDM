import { motion } from "framer-motion";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Award, Lock } from "lucide-react";
import { Achievement } from "@/types/quiz";

interface AchievementsModalProps {
  open: boolean;
  onClose: () => void;
  achievements: Achievement[];
}

export function AchievementsModal({ open, onClose, achievements }: AchievementsModalProps) {
  const unlockedCount = achievements.filter(a => a.unlocked).length;

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="max-w-lg max-h-[80vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2 text-2xl">
            <Award className="w-6 h-6 text-secondary" />
            Conquistas
            <span className="text-sm text-muted-foreground ml-auto">
              {unlockedCount}/{achievements.length}
            </span>
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-3 mt-4">
          {achievements.map((achievement, index) => (
            <motion.div
              key={achievement.id}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.03 }}
              className={`
                flex items-center gap-4 p-4 rounded-xl transition-all
                ${achievement.unlocked 
                  ? 'bg-gradient-to-r from-primary/10 to-secondary/10 border border-primary/30' 
                  : 'bg-muted/5 border border-border opacity-50'
                }
              `}
            >
              {/* Icon */}
              <div className={`
                w-12 h-12 rounded-full flex items-center justify-center flex-shrink-0
                ${achievement.unlocked 
                  ? 'bg-gradient-to-br from-primary to-secondary' 
                  : 'bg-muted'
                }
              `}>
                {achievement.unlocked ? (
                  <Award className="w-6 h-6 text-primary-foreground" />
                ) : (
                  <Lock className="w-6 h-6 text-muted-foreground" />
                )}
              </div>

              {/* Info */}
              <div className="flex-1">
                <h4 className={`font-semibold ${achievement.unlocked ? 'text-primary' : 'text-muted-foreground'}`}>
                  {achievement.title}
                </h4>
                <p className="text-sm text-muted-foreground">
                  {achievement.desc}
                </p>
              </div>
            </motion.div>
          ))}
        </div>
      </DialogContent>
    </Dialog>
  );
}
