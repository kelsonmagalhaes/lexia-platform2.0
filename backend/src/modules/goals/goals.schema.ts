import { z } from 'zod';

export const createGoalSchema = z.object({
  title: z.string().min(3).max(100),
  targetValue: z.number().positive(),
  unit: z.string().min(1).max(50),
  deadline: z.string().datetime({ offset: true }).optional(),
});

export const updateGoalSchema = z.object({
  title: z.string().min(3).max(100).optional(),
  currentValue: z.number().min(0).optional(),
  done: z.boolean().optional(),
});

export type CreateGoalInput = z.infer<typeof createGoalSchema>;
export type UpdateGoalInput = z.infer<typeof updateGoalSchema>;
