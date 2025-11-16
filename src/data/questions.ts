import { Question } from "@/types/quiz";
// @ts-ignore
import BANCO_RAW from "./banco-perguntas-raw.js";

// Converte as perguntas do formato JS para TypeScript
const convertedQuestions: Question[] = BANCO_RAW.map((q: any, index: number) => ({
  id: `q${String(index + 1).padStart(4, '0')}`,
  type: "multiple" as const,
  isKids: q.isKids || false,
  difficulty: q.difficulty || 'medium',
  question: q.question,
  options: q.options,
  answer: q.answer,
  reference: q.reference || '',
  explanation: q.explanation || '',
  category: q.category || 'geral'
}));

export const FALLBACK_QUESTIONS: Question[] = convertedQuestions;

// Contador de perguntas únicas
export const TOTAL_QUESTIONS = FALLBACK_QUESTIONS.length;

export const GAME_CONSTANTS = {
  TIME_PER_QUESTION: 30,
  TIME_BONUS_MAX: 100,
  LIVES_PER_SESSION: 3,
  HINTS_PER_SESSION: 3,
  COMBO_MULTIPLIER: 0.1,
  POINTS: {
    easy: 100,
    junior: 100,
    medium: 200,
    hard: 300,
  }
};

export const AVATARS_SOLO = ["👨", "👩", "🧔", "👴", "👵", "🧑", "🧒", "👶"];
export const AVATARS_MULTI = ["👨", "👩", "🧔", "👴", "👵", "🧑", "🧒", "👦", "👧", "🙋‍♂️", "🙋‍♀️", "🤷‍♂️"];
