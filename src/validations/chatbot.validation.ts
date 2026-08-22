import { z } from 'zod';

export const chatMessageSchema = z.object({
  message: z.string().min(1, 'Message cannot be empty').max(1000, 'Message too long'),
  conversationHistory: z
    .array(
      z.object({
        role: z.enum(['user', 'assistant', 'system']),
        content: z.string(),
      })
    )
    .optional()
    .default([]),
  maxBudget: z.number().positive().optional(),
  category: z.string().optional(),
});

export type ChatMessageInput = z.infer<typeof chatMessageSchema>;
