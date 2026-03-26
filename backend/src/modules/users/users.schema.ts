import { z } from 'zod';

export const updateMeSchema = z.object({
  name: z.string().min(2).max(100).optional(),
  currentPeriod: z.coerce.number().int().min(1).max(10).optional(),
  institutionCustom: z.string().max(255).optional(),
  institutionId: z.string().uuid().optional(),
});

export type UpdateMeInput = z.infer<typeof updateMeSchema>;
