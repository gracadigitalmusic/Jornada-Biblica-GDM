import React, { Suspense } from 'react';
import { Loader2 } from 'lucide-react';
import { useRanking } from "@/hooks/useRanking";
import { useAchievements } from "@/hooks/useAchievements";
import { useVirtualShop } from "@/hooks/useVirtualShop";
import { useDailyChallenge } from "@/hooks/useDailyChallenge";
import { useCelebration } from "@/hooks/useCelebration";
import { useToast } from "@/hooks/use-toast";

// Lazy imports for heavy modals
const LazyRankingModal = React.lazy(() => import("@/components/quiz/RankingModal").then(mod => ({ default: mod.RankingModal })));
const LazyAchievementsModal = React.lazy(() => import("@/components/quiz/AchievementsModal").then(mod => ({ default: mod.AchievementsModal })));
const LazyVirtualShop = React.lazy(() => import("@/components/quiz/VirtualShop").then(mod => ({ default: mod.VirtualShop })));
const LazyStatsModal = React.lazy(() => import("@/components/quiz/StatsModal").then(mod => ({ default: mod.StatsModal })));
const LazyProfileModal = React.lazy(() => import("@/components/quiz/ProfileModal").then(mod => ({ default: mod.ProfileModal })));


interface GameModalsProps {
  showRanking: boolean;
  setShowRanking: (show: boolean) => void;
  showAchievements: boolean;
  setShowAchievements: (show: boolean) => void;
  showPowerUpShop: boolean;
  setShowPowerUpShop: (show: boolean) => void;
  showStats: boolean;
  setShowStats: (show: boolean) => void;
  showProfile: boolean;
  setShowProfile: (show: boolean) => void;
  onStartSolo: () => void;
}

export function GameModals({
  showRanking,
  setShowRanking,
  showAchievements,
  setShowAchievements,
  showPowerUpShop,
  setShowPowerUpShop,
  showStats,
  setShowStats,
  showProfile,
  setShowProfile,
  onStartSolo,
}: GameModalsProps) {
  const ranking = useRanking();
  const achievements = useAchievements();
  const virtualShop = useVirtualShop();
  const dailyChallenge = useDailyChallenge();
  const celebration = useCelebration();
  const { toast } = useToast();

  const handleClaimDailyReward = () => {
    const reward = dailyChallenge.claimReward();
    if (reward.coins > 0) {
      virtualShop.addCoins(reward.coins);
      if (reward.item) {
        virtualShop.purchaseItem(reward.item.id); 
      }
      celebration.celebrateAchievement();
      toast({
        title: "Recompensa Resgatada! 💰",
        description: `Você recebeu ${reward.coins} moedas e ${reward.item?.name || 'um item'}.`,
        duration: 5000,
      });
    }
  };

  return (
    <Suspense fallback={<div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80"><Loader2 className="w-12 h-12 animate-spin text-primary" /></div>}>
      {showRanking && (
        <LazyRankingModal
          open={showRanking}
          onClose={() => setShowRanking(false)}
          ranking={ranking.ranking}
        />
      )}

      {showAchievements && (
        <LazyAchievementsModal
          open={showAchievements}
          onClose={() => setShowAchievements(false)}
          achievements={achievements.getAchievements()}
        />
      )}

      {showPowerUpShop && (
        <LazyVirtualShop
          open={showPowerUpShop}
          onClose={() => setShowPowerUpShop(false)}
          shopItems={virtualShop.shopItems}
          currency={virtualShop.currency}
          onPurchase={virtualShop.purchaseItem}
        />
      )}
      
      {showStats && (
        <LazyStatsModal
          open={showStats}
          onClose={() => setShowStats(false)}
        />
      )}
      
      {showProfile && (
        <LazyProfileModal
          open={showProfile}
          onClose={() => setShowProfile(false)}
          onStartChallenge={onStartSolo}
          onClaimReward={handleClaimDailyReward}
        />
      )}
    </Suspense>
  );
}