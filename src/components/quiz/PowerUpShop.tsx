import { motion } from 'framer-motion';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { ShoppingBag, Sparkles, Check } from 'lucide-react';
import { usePowerUps } from '@/hooks/usePowerUps';
import { useCelebration } from '@/hooks/useCelebration';
import { usePlayerLevel } from '@/hooks/usePlayerLevel';
import { toast } from '@/hooks/use-toast';

interface PowerUpShopProps {
  open: boolean;
  onClose: () => void;
}

export function PowerUpShop({ open, onClose }: PowerUpShopProps) {
  const powerUps = usePowerUps();
  const playerLevel = usePlayerLevel();
  const celebration = useCelebration();

  const handlePurchase = (powerUpId: string, cost: number) => {
    if (playerLevel.totalScore < cost) {
      toast({
        title: "Pontos Insuficientes",
        description: `Você precisa de ${cost} pontos para comprar este power-up.`,
        variant: "destructive",
      });
      return;
    }

    const success = powerUps.purchasePowerUp(powerUpId, cost);
    if (success) {
      // Deduz os pontos do total
      playerLevel.addScore(-cost);
      celebration.celebratePowerUp();
      toast({
        title: "✨ Power-Up Comprado!",
        description: "Use-o durante uma partida para vantagens especiais.",
      });
    }
  };

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="text-2xl font-black flex items-center gap-2">
            <ShoppingBag className="w-6 h-6 text-primary" />
            Loja de Power-Ups
          </DialogTitle>
          <div className="flex items-center gap-2 text-sm">
            <Sparkles className="w-4 h-4 text-secondary" />
            <span>Seus Pontos: <span className="font-bold text-primary">{playerLevel.totalScore}</span></span>
          </div>
        </DialogHeader>

        <div className="grid md:grid-cols-2 gap-4 mt-4">
          {powerUps.powerUps.map((powerUp) => {
            const owned = powerUps.inventory[powerUp.id] || 0;
            const canAfford = playerLevel.totalScore >= powerUp.cost;

            return (
              <motion.div
                key={powerUp.id}
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                whileHover={{ scale: 1.02 }}
              >
                <Card className={`p-4 ${canAfford ? 'border-primary/30' : 'border-border opacity-60'}`}>
                  <div className="flex items-start justify-between mb-3">
                    <div className="flex items-center gap-3">
                      <span className="text-3xl">{powerUp.icon}</span>
                      <div>
                        <h3 className="font-bold text-lg">{powerUp.name}</h3>
                        <p className="text-xs text-muted-foreground">{powerUp.description}</p>
                      </div>
                    </div>
                    {owned > 0 && (
                      <Badge variant="secondary" className="flex items-center gap-1">
                        <Check className="w-3 h-3" />
                        {owned}x
                      </Badge>
                    )}
                  </div>

                  <div className="flex items-center justify-between">
                    <div className="text-sm">
                      <span className="text-muted-foreground">Custo:</span>
                      <span className="font-bold text-primary ml-2">{powerUp.cost} pts</span>
                    </div>
                    <Button
                      size="sm"
                      onClick={() => handlePurchase(powerUp.id, powerUp.cost)}
                      disabled={!canAfford}
                    >
                      <ShoppingBag className="w-4 h-4 mr-2" />
                      Comprar
                    </Button>
                  </div>
                </Card>
              </motion.div>
            );
          })}
        </div>

        <div className="mt-6 p-4 bg-muted rounded-lg">
          <p className="text-sm text-muted-foreground">
            <strong>💡 Dica:</strong> Power-ups são consumíveis de uso único. Use-os estrategicamente durante as partidas para maximizar seus pontos!
          </p>
        </div>
      </DialogContent>
    </Dialog>
  );
}
