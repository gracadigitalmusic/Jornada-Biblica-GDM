import React, { createContext, useContext, useState, useEffect, ReactNode, useCallback } from 'react';
import { useLocalStorage } from '@/hooks/useLocalStorage';
import { ShopItem } from '@/types/quiz';

interface Theme {
  id: string;
  name: string;
  description: string; // Adicionado a propriedade description
  variables: Record<string, string>; // Ex: { '--theme-primary': '200 50% 50%', '--theme-bg-start': '200 10% 5%' }
}

interface ThemeContextType {
  currentThemeId: string;
  applyTheme: (themeId: string) => void;
  getThemeVariables: (themeId: string) => Record<string, string>;
  availableThemes: Theme[];
}

const defaultTheme: Theme = {
  id: 'default',
  name: 'Padrão (Celestial)',
  description: 'O tema original da Jornada Bíblica, com tons celestiais.',
  variables: {
    '--theme-bg-start': '220 40% 10%',
    '--theme-bg-end': '240 50% 8%',
    '--theme-primary': '217 91% 60%',
    '--theme-secondary': '45 93% 47%',
    '--theme-card': '220 30% 14%',
    '--theme-card-hover': '220 30% 18%',
  },
};

const darkGoldTheme: Theme = {
  id: 'theme_dark_gold',
  name: 'Dourado Escuro',
  description: 'Um tema luxuoso com detalhes em ouro e tons escuros.',
  variables: {
    '--theme-bg-start': '20 20% 10%',
    '--theme-bg-end': '30 25% 8%',
    '--theme-primary': '40 90% 60%', // Ouro
    '--theme-secondary': '25 80% 50%', // Bronze
    '--theme-card': '20 15% 15%',
    '--theme-card-hover': '20 15% 20%',
  },
};

const oceanTheme: Theme = {
  id: 'theme_ocean',
  name: 'Oceano Celestial',
  description: 'Tema inspirado nas águas sagradas, com azuis e verdes profundos.',
  variables: {
    '--theme-bg-start': '220 60% 12%',
    '--theme-bg-end': '200 70% 10%',
    '--theme-primary': '200 90% 50%', // Azul Oceano
    '--theme-secondary': '180 70% 40%', // Verde Água
    '--theme-card': '220 40% 18%',
    '--theme-card-hover': '220 40% 22%',
  },
};

const ALL_THEMES: Theme[] = [defaultTheme, darkGoldTheme, oceanTheme];

const ThemeContext = createContext<ThemeContextType | undefined>(undefined);

export function ThemeProvider({ children }: { children: ReactNode }) {
  const [storedThemeId, setStoredThemeId] = useLocalStorage<string>('jb_active_theme', defaultTheme.id);
  const [currentThemeId, setCurrentThemeId] = useState<string>(storedThemeId);

  const getThemeVariables = useCallback((themeId: string) => {
    const theme = ALL_THEMES.find(t => t.id === themeId) || defaultTheme;
    return theme.variables;
  }, []);

  const applyTheme = useCallback((themeId: string) => {
    const themeVariables = getThemeVariables(themeId);
    for (const [key, value] of Object.entries(themeVariables)) {
      document.documentElement.style.setProperty(key, value);
    }
    setCurrentThemeId(themeId);
    setStoredThemeId(themeId);
  }, [getThemeVariables, setStoredThemeId]);

  useEffect(() => {
    applyTheme(storedThemeId);
  }, [storedThemeId, applyTheme]);

  const availableThemes = ALL_THEMES;

  return (
    <ThemeContext.Provider value={{ currentThemeId, applyTheme, getThemeVariables, availableThemes }}>
      {children}
    </ThemeContext.Provider>
  );
}

export function useTheme() {
  const context = useContext(ThemeContext);
  if (context === undefined) {
    throw new Error('useTheme must be used within a ThemeProvider');
  }
  return context;
}