import { z } from 'zod';

const chatHistoryItemSchema = z.object({
  role: z.string(),
  parts: z.string(),
});

export const chatSchema = z.object({
  message: z.string().min(1, 'Mensagem é obrigatória'),
  history: z.array(chatHistoryItemSchema).optional(),
});

export const explainSchema = z.object({
  content: z.string().min(1, 'Conteúdo é obrigatório'),
  disciplineName: z.string().optional(),
});

export const generateQuizSchema = z.object({
  topic: z.string().min(1),
  disciplineName: z.string().optional(),
  count: z.coerce.number().int().min(1).max(20).optional(),
  difficulty: z.enum(['easy', 'medium', 'hard']).optional(),
});

export const correctEssaySchema = z.object({
  question: z.string().min(1),
  answer: z.string().min(1),
  disciplineName: z.string().optional(),
});

export const simulateExamSchema = z.object({
  disciplineName: z.string().min(1),
  examType: z.enum(['oab', 'concurso', 'regular']),
  count: z.coerce.number().int().min(1).max(50).optional(),
});

export type ChatInput = z.infer<typeof chatSchema>;
export type ExplainInput = z.infer<typeof explainSchema>;
export type GenerateQuizInput = z.infer<typeof generateQuizSchema>;
export type CorrectEssayInput = z.infer<typeof correctEssaySchema>;
export type SimulateExamInput = z.infer<typeof simulateExamSchema>;
