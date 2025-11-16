import { motion } from "framer-motion";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Trophy } from "lucide-react";
import { RankingEntry } from "@/types/quiz";

interface RankingModalProps {
  open: boolean;
  onClose: () => void;
  ranking: RankingEntry[];
}

export function RankingModal({ open, onClose, ranking }: RankingModalProps) {
  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="max-w-lg max-h-[80vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2 text-2xl">
            <Trophy className="w-6 h-6 text-secondary" />
            Hall da Fama
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-3 mt-4">
          {ranking.length === 0 ? (
            <p className="text-center text-muted-foreground py-8">
              Ninguém jogou ainda. Seja o primeiro!
            </p>
          ) : (
            ranking.map((entry, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: index * 0.05 }}
                className={`
                  flex items-center justify-between p-4 rounded-xl
                  ${index === 0 
                    ? 'bg-gradient-to-r from-secondary/20 to-primary/20 border-2 border-secondary' 
                    : index === 1
                    ? 'bg-muted/20 border-2 border-muted'
                    : index === 2
                    ? 'bg-muted/10 border-2 border-muted/50'
                    : 'bg-quiz-card border border-border'
                  }
                `}
              >
                <div className="flex items-center gap-4">
                  {/* Position */}
                  <div className={`
                    w-10 h-10 rounded-full flex items-center justify-center font-bold text-lg
                    ${index === 0 
                      ? 'bg-gradient-to-br from-secondary to-primary text-secondary-foreground' 
                      : index === 1
                      ? 'bg-muted text-muted-foreground'
                      : index === 2
                      ? 'bg-muted/50 text-muted-foreground'
                      : 'bg-quiz-card text-foreground'
                    }
                  `}>
                    {index + 1}
                  </div>

                  {/* Avatar */}
                  <div className="w-12 h-12 rounded-full bg-primary flex items-center justify-center text-2xl">
                    {entry.avatar}
                  </div>

                  {/* Name */}
                  <div>
                    <h4 className={`font-semibold text-lg ${index === 0 ? 'text-secondary' : 'text-foreground'}`}>
                      {entry.name}
                    </h4>
                    {entry.location && (
                      <p className="text-xs text-muted-foreground">{entry.location}</p>
                    )}
                  </div>
                </div>

                {/* Score */}
                <div className={`font-bold text-xl ${index === 0 ? 'text-secondary' : 'text-foreground'}`}>
                  {entry.score} pts
                </div>
              </motion.div>
            ))
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
}
