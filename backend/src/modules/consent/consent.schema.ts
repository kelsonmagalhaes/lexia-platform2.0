import { z } from 'zod';

export const upsertConsentSchema = z.object({
  consentType: z.string().min(1),
  accepted: z.boolean(),
});

export type UpsertConsentInput = z.infer<typeof upsertConsentSchema>;
