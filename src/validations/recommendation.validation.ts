import { z } from 'zod';

export const recommendationQuerySchema = z.object({
  category: z.string().optional(),
  limit: z.coerce.number().min(1).max(20).optional().default(6),
  excludeId: z.string().optional(),
});

export type RecommendationQueryInput = z.infer<typeof recommendationQuerySchema>;
