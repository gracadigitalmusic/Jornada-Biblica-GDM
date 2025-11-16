import { useState, useEffect, useCallback } from 'react';
import { PowerUp } from '@/types/quiz';

const POWER_UPS: PowerUp[] = [
  { id: 'divine_protection', name: 'Proteção Divina', description: 'Salva você de um erro', icon: '🛡️', cost: 500, effect: 'divine_protection' },
  { id: 'revelation', name: 'Revelação', description: 'Mostra a resposta certa por 2s', icon: '✨', cost: 300, effect: 'revelation' },
  { id: 'extra_time', name: 'Tempo Extra', description: '+10 segundos no timer', icon: '⏰', cost: 200, effect: 'extra_time' },
  { id: 'double_points', name: 'Dobro de Pontos', description: 'Pontos x2 nesta pergunta', icon: '💎', cost: 400, effect: 'double_points' },
];

interface PowerUpInventory {
  [key: string]: number;
}

export function usePowerUps() {
  const [inventory, setInventory] = useState<PowerUpInventory>({});
  const [activePowerUps, setActivePowerUps] = useState<Set<string>>(new Set());

  useEffect(() => {
    const stored = localStorage.getItem('jb_powerups');
    if (stored) {
      setInventory(JSON.parse(stored));
    }
  }, []);

  const saveInventory = useCallback((inv: PowerUpInventory) => {
    localStorage.setItem('jb_powerups', JSON.stringify(inv));
    setInventory(inv);
  }, []);

  const purchasePowerUp = useCallback((powerUpId: string, points: number) => {
    const powerUp = POWER_UPS.find(p => p.id === powerUpId);
    if (!powerUp || points < powerUp.cost) return false;

    const newInventory = { ...inventory };
    newInventory[powerUpId] = (newInventory[powerUpId] || 0) + 1;
    saveInventory(newInventory);
    return true;
  }, [inventory, saveInventory]);

  const usePowerUp = useCallback((powerUpId: string) => {
    if (!inventory[powerUpId] || inventory[powerUpId] <= 0) return false;

    const newInventory = { ...inventory };
    newInventory[powerUpId]--;
    saveInventory(newInventory);

    setActivePowerUps(prev => new Set([...prev, powerUpId]));
    return true;
  }, [inventory, saveInventory]);

  const deactivatePowerUp = useCallback((powerUpId: string) => {
    setActivePowerUps(prev => {
      const newSet = new Set(prev);
      newSet.delete(powerUpId);
      return newSet;
    });
  }, []);

  const isPowerUpActive = useCallback((powerUpId: string) => {
    return activePowerUps.has(powerUpId);
  }, [activePowerUps]);

  return {
    powerUps: POWER_UPS,
    inventory,
    activePowerUps,
    purchasePowerUp,
    usePowerUp,
    deactivatePowerUp,
    isPowerUpActive,
  };
}
