export interface Question {
  id: string;
  type: string;
  isKids: boolean;
  difficulty: 'junior' | 'easy' | 'medium' | 'hard';
  question: string;
  options: string[];
  answer: number;
  reference: string;
  explanation: string;
  category: string;
}

export interface Player {
  name: string;
  location: string;
  score: number;
  avatar: string;
}

export interface Achievement {
  id: string;
  title: string;
  desc: string;
  unlocked: boolean;
}

export interface AchievementData {
  totalAnswers: number;
  totalCorrect: number;
  totalWrong: number;
  totalTimeouts: number;
  totalCombos: number;
  maxCombo: number;
  unlocked: Set<string>;
  totalSessions: number;
}

export interface RankingEntry {
  name: string;
  location: string;
  score: number;
  avatar: string;
}

export type GameMode = 'menu' | 'solo' | 'multiplayer' | 'marathon' | 'study' | 'tournament' | 'quiz' | 'results' | 'review' | 'story' | 'shop';

export interface PowerUp {
  id: string;
  name: string;
  description: string;
  icon: string;
  cost: number;
  effect: 'divine_protection' | 'revelation' | 'extra_time' | 'double_points';
}

export interface PlayerLevel {
  level: number;
  title: string;
  minScore: number;
  benefits: string[];
  extraLives: number;
  extraHints: number;
}

export interface Tournament {
  id: string;
  weekStart: string;
  weekEnd: string;
  participants: TournamentEntry[];
}

export interface TournamentEntry {
  name: string;
  avatar: string;
  score: number;
  questionsAnswered: number;
  date: string;
}

export interface StoryChapter {
  id: string;
  title: string;
  description: string;
  narrative: string;
  unlocked: boolean;
  completed: boolean;
  requiredScore: number;
  questions: Question[];
  cutscene?: {
    image?: string;
    text: string;
    characterName?: string;
  };
}

export interface ShopItem {
  id: string;
  name: string;
  description: string;
  price: number;
  type: 'theme' | 'avatar' | 'effect' | 'powerup';
  icon: string;
  rarity: 'common' | 'rare' | 'epic' | 'legendary';
  preview?: string;
  owned?: boolean;
  seasonal?: boolean;
}

export interface PlayerCurrency {
  coins: number;
  gems: number;
}
