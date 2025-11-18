import { z } from 'zod';

// Player name validation
export const playerNameSchema = z.string()
  .trim()
  .min(2, 'Nome muito curto (mínimo 2 caracteres)')
  .max(20, 'Nome muito longo (máximo 20 caracteres)')
  .regex(/^[a-zA-ZÀ-ÿ0-9\s]+$/, 'Apenas letras, números e espaços');

// Chat message validation
export const chatMessageSchema = z.string()
  .trim()
  .min(1, 'Mensagem não pode ser vazia')
  .max(500, 'Mensagem muito longa (máximo 500 caracteres)');

// Session ID validation
export const sessionIdSchema = z.string()
  .trim()
  .length(8, 'ID de sessão inválido')
  .regex(/^[A-Z0-9]+$/, 'ID de sessão contém caracteres inválidos');

// Bible reference validation
export const bibleReferenceSchema = z.string()
  .trim()
  .min(1, 'Referência não pode ser vazia')
  .max(100, 'Referência muito longa');
