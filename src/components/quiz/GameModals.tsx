import { RankingModal } from "@/components/quiz/RankingModal";
import { AchievementsModal } from "@/components/quiz/AchievementsModal";
import { VirtualShop } from "@/components/quiz/VirtualShop";
import { StatsModal } from "@/components/quiz/StatsModal";
import { ProfileModal } from "@/components/quiz/ProfileModal";
import { useRanking } from "@/hooks/useRanking";
import { useAchievements } from "@/hooks/useAchievements";
import { useVirtualShop } from "@/hooks/useVirtualShop";
import { useStats } from "@/hooks/useStats";
import { useDailyChallenge } from "@/hooks/useDailyChallenge";
import { useCelebration } from "@/hooks/useCelebration";
import { useToast } from "@/hooks/use-toast";

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
    <>
      <RankingModal
        open={showRanking}
        onClose={() => setShowRanking(false)}
        ranking={ranking.ranking}
      />

      <AchievementsModal
        open={showAchievements}
        onClose={() => setShowAchievements(false)}
        achievements={achievements.getAchievements()}
      />

      <VirtualShop
        open={showPowerUpShop}
        onClose={() => setShowPowerUpShop(false)}
        shopItems={virtualShop.shopItems}
        currency={virtualShop.currency}
        onPurchase={virtualShop.purchaseItem}
      />
      
      <StatsModal
        open={showStats}
        onClose={() => setShowStats(false)}
      />
      
      <ProfileModal
        open={showProfile}
        onClose={() => setShowProfile(false)}
        onStartChallenge={onStartSolo}
        onClaimReward={handleClaimDailyReward}
      />
    </>
  );
}