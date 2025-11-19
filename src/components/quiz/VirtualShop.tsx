import { motion } from 'framer-motion';
import { ShoppingBag, Coins, Gem, Sparkles, ArrowLeft, Check, Palette } from 'lucide-react'; // Adicionado Palette
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { ShopItem, PlayerCurrency } from '@/types/quiz';
import { toast } from 'sonner';
import { useTheme } from '@/contexts/ThemeContext'; // Importar useTheme

interface VirtualShopProps {
  open: boolean;
  onClose: () => void;
  shopItems: ShopItem[];
  currency: PlayerCurrency;
  onPurchase: (itemId: string) => boolean;
}

const rarityColors = {
  common: 'bg-gray-500',
  rare: 'bg-blue-500',
  epic: 'bg-purple-500',
  legendary: 'bg-yellow-500'
};

const rarityLabels = {
  common: 'Comum',
  rare: 'Raro',
  epic: 'Épico',
  legendary: 'Lendário'
};

export function VirtualShop({ open, onClose, shopItems, currency, onPurchase }: VirtualShopProps) {
  const { currentThemeId, applyTheme, availableThemes } = useTheme();

  const handlePurchase = (item: ShopItem) => {
    if (item.owned) {
      if (item.type === 'theme') {
        applyTheme(item.id);
        toast.success('Tema aplicado!', {
          description: `O tema ${item.name} foi ativado.`,
          icon: '🎨'
        });
      } else {
        toast.info('Você já possui este item!');
      }
      return;
    }

    if (currency.coins < item.price) {
      toast.error('Moedas insuficientes!', {
        description: `Você precisa de ${item.price - currency.coins} moedas a mais.`
      });
      return;
    }

    const success = onPurchase(item.id);
    if (success) {
      toast.success('Item comprado!', {
        description: `${item.name} foi adicionado à sua coleção.`,
        icon: '🎉'
      });
      if (item.type === 'theme') {
        applyTheme(item.id); // Aplica o tema imediatamente após a compra
      }
    }
  };

  const shopItemsWithThemes = shopItems.map(item => {
    if (item.type === 'theme') {
      const theme = availableThemes.find(t => t.id === item.id);
      return {
        ...item,
        name: theme?.name || item.name,
        description: theme?.description || item.description,
        owned: item.owned || (theme?.id === 'default') // Tema padrão é sempre 'owned'
      };
    }
    return item;
  });

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="max-w-5xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-3 text-2xl">
            <ShoppingBag className="w-8 h-8 text-primary" />
            Loja Virtual
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-6">
          <Card className="bg-gradient-to-r from-primary/10 to-primary/5">
            <CardContent className="p-6">
              <div className="flex items-center justify-around">
                <div className="flex items-center gap-3">
                  <Coins className="w-8 h-8 text-yellow-500" />
                  <div>
                    <p className="text-sm text-muted-foreground">Moedas</p>
                    <p className="text-2xl font-bold">{currency.coins}</p>
                  </div>
                </div>
                <div className="h-12 w-px bg-border" />
                <div className="flex items-center gap-3">
                  <Gem className="w-8 h-8 text-blue-500" />
                  <div>
                    <p className="text-sm text-muted-foreground">Gemas</p>
                    <p className="text-2xl font-bold">{currency.gems}</p>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          <div>
            <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
              <Sparkles className="w-5 h-5 text-primary" />
              Itens Disponíveis
            </h3>
            
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {shopItemsWithThemes.map((item, index) => (
                <motion.div
                  key={item.id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: index * 0.05 }}
                >
                  <Card className={`relative overflow-hidden ${item.owned ? 'border-green-500' : ''} ${item.id === currentThemeId ? 'ring-2 ring-primary' : ''}`}>
                    <div className={`absolute top-0 right-0 w-24 h-24 ${rarityColors[item.rarity]} opacity-10 rounded-bl-full`} />
                    
                    <CardHeader className="pb-3">
                      <div className="flex items-start justify-between">
                        <div className="text-5xl mb-2">{item.icon}</div>
                        <Badge className={rarityColors[item.rarity]}>
                          {rarityLabels[item.rarity]}
                        </Badge>
                      </div>
                      <h4 className="font-bold">{item.name}</h4>
                      <p className="text-xs text-muted-foreground">{item.description}</p>
                    </CardHeader>

                    <CardContent>
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2">
                          <Coins className="w-5 h-5 text-yellow-500" />
                          <span className="font-bold">{item.price}</span>
                        </div>
                        
                        {item.owned ? (
                          item.type === 'theme' ? (
                            <Button
                              size="sm"
                              onClick={() => handlePurchase(item)}
                              disabled={item.id === currentThemeId}
                              variant={item.id === currentThemeId ? 'secondary' : 'default'}
                            >
                              {item.id === currentThemeId ? (
                                <>
                                  <Check className="w-3 h-3 mr-1" />
                                  Aplicado
                                </>
                              ) : (
                                <>
                                  <Palette className="w-3 h-3 mr-1" />
                                  Aplicar
                                </>
                              )}
                            </Button>
                          ) : (
                            <Badge variant="default" className="bg-green-500">
                              <Check className="w-3 h-3 mr-1" />
                              Possui
                            </Badge>
                          )
                        ) : (
                          <Button
                            size="sm"
                            onClick={() => handlePurchase(item)}
                            disabled={currency.coins < item.price}
                          >
                            Comprar
                          </Button>
                        )}
                      </div>
                    </CardContent>
                  </Card>
                </motion.div>
              ))}
            </div>
          </div>

          <div className="bg-muted/50 p-4 rounded-lg">
            <p className="text-sm text-muted-foreground text-center">
              💡 <strong>Dica:</strong> Ganhe moedas jogando partidas e completando conquistas!
            </p>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}