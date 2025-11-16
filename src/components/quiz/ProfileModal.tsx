import { motion } from "framer-motion";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { User, LayoutGrid } from "lucide-react";
import { PlayerLevelCard } from "./PlayerLevelCard";
import { BadgesDisplay } from "./BadgesDisplay";
import { DailyChallengeCard } from "./DailyChallengeCard";
import { OfflineMode } from "./OfflineMode";
import { Card, CardHeader, CardTitle } from "@/components/ui/card";

interface ProfileModalProps {
  open: boolean;
  onClose: () => void;
  onStartChallenge: () => void;
  onClaimReward: () => void;
}

export function ProfileModal({ open, onClose, onStartChallenge, onClaimReward }: ProfileModalProps) {
  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2 text-2xl">
            <User className="w-6 h-6 text-primary" />
            Seu Perfil e Status
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-6 mt-4">
          {/* Status e Nível */}
          <Card className="p-4 bg-quiz-card/50 backdrop-blur border-primary/20">
            <CardHeader className="p-0 pb-3">
              <CardTitle className="text-lg flex items-center gap-2">
                <LayoutGrid className="w-5 h-5 text-primary" />
                Progresso
              </CardTitle>
            </CardHeader>
            <div className="space-y-3">
              <PlayerLevelCard />
              <BadgesDisplay />
            </div>
          </Card>

          {/* Desafio Diário */}
          <DailyChallengeCard onStartChallenge={onStartChallenge} onClaimReward={onClaimReward} />

          {/* Modo Offline */}
          <OfflineMode />
        </div>
      </DialogContent>
    </Dialog>
  );
}