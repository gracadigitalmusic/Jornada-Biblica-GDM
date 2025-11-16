import { useLocalStorage } from './useLocalStorage';

interface GameSettings {
  isNarrationEnabled: boolean;
}

const defaultSettings: GameSettings = {
  isNarrationEnabled: false, // Começa desligado por padrão
};

export function useGameSettings() {
  const [settings, setSettings] = useLocalStorage<GameSettings>('jb_game_settings', defaultSettings);

  const toggleNarration = () => {
    setSettings(prev => ({ ...prev, isNarrationEnabled: !prev.isNarrationEnabled }));
  };

  return { settings, toggleNarration };
}