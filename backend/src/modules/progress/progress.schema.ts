import { z } from 'zod';

export const upsertProgressSchema = z.object({
  status: z.enum(['not_started', 'in_progress', 'completed']),
  score: z.number().min(0).max(100).optional(),
});

export type UpsertProgressInput = z.infer<typeof upsertProgressSchema>;
