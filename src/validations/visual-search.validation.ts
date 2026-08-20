import { z } from 'zod';

export const visualSearchSchema = z.object({
  imageUrl: z.string().url().optional(),
  imageBase64: z.string().optional(),
  category: z.string().optional(),
  threshold: z.number().min(0).max(1).optional().default(0.7),
});

export type VisualSearchInput = z.infer<typeof visualSearchSchema>;
