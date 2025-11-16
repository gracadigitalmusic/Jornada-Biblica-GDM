import { useState, useEffect } from 'react';
import { ShopItem, PlayerCurrency } from '@/types/quiz';
import { useLocalStorage } from './useLocalStorage';

const SHOP_ITEMS: ShopItem[] = [
  {
    id: 'theme_dark_gold',
    name: 'Tema Dourado Escuro',
    description: 'Um tema luxuoso com detalhes em ouro',
    price: 1000,
    type: 'theme',
    icon: '🌟',
    rarity: 'epic'
  },
  {
    id: 'theme_ocean',
    name: 'Tema Oceano Celestial',
    description: 'Tema inspirado nas águas sagradas',
    price: 800,
    type: 'theme',
    icon: '🌊',
    rarity: 'rare'
  },
  {
    id: 'avatar_angel',
    name: 'Avatar Anjo',
    description: 'Avatar animado de um anjo celestial',
    price: 1500,
    type: 'avatar',
    icon: '👼',
    rarity: 'legendary'
  },
  {
    id: 'avatar_prophet',
    name: 'Avatar Profeta',
    description: 'Avatar de um sábio profeta',
    price: 1200,
    type: 'avatar',
    icon: '🧙',
    rarity: 'epic'
  },
  {
    id: 'effect_holy_light',
    name: 'Luz Sagrada',
    description: 'Efeito de luz divina nas respostas corretas',
    price: 600,
    type: 'effect',
    icon: '✨',
    rarity: 'rare'
  },
  {
    id: 'effect_rainbow',
    name: 'Arco-Íris da Aliança',
    description: 'Efeito de arco-íris nas conquistas',
    price: 500,
    type: 'effect',
    icon: '🌈',
    rarity: 'common'
  },
  {
    id: 'powerup_bundle',
    name: 'Pacote de Power-ups',
    description: '5 power-ups aleatórios',
    price: 1000,
    type: 'powerup',
    icon: '🎁',
    rarity: 'rare'
  }
];

export function useVirtualShop() {
  const [currency, setCurrency] = useLocalStorage<PlayerCurrency>('jb_currency', { coins: 0, gems: 0 });
  const [ownedItems, setOwnedItems] = useLocalStorage<string[]>('jb_owned_items', []);

  const shopItems = SHOP_ITEMS.map(item => ({
    ...item,
    owned: ownedItems.includes(item.id)
  }));

  const addCoins = (amount: number) => {
    setCurrency(prev => ({ ...prev, coins: prev.coins + amount }));
  };

  const addGems = (amount: number) => {
    setCurrency(prev => ({ ...prev, gems: prev.gems + amount }));
  };

  const purchaseItem = (itemId: string): boolean => {
    const item = SHOP_ITEMS.find(i => i.id === itemId);
    if (!item || ownedItems.includes(itemId)) return false;

    if (currency.coins >= item.price) {
      setCurrency(prev => ({ ...prev, coins: prev.coins - item.price }));
      setOwnedItems(prev => [...prev, itemId]);
      return true;
    }
    return false;
  };

  return {
    currency,
    shopItems,
    addCoins,
    addGems,
    purchaseItem,
    ownedItems
  };
}
