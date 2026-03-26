import { z } from 'zod';

export const startQuizSchema = z.object({
  mode: z.string().min(1),
  disciplineId: z.string().uuid().optional(),
  topicId: z.string().uuid().optional(),
  limit: z.coerce.number().int().min(1).max(50).optional(),
  difficulty: z.enum(['easy', 'medium', 'hard']).optional(),
});

export const submitQuizSchema = z.object({
  attemptId: z.string().uuid(),
  answers: z.record(z.string(), z.string()),
});

export type StartQuizInput = z.infer<typeof startQuizSchema>;
export type SubmitQuizInput = z.infer<typeof submitQuizSchema>;
