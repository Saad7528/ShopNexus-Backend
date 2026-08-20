import { z } from 'zod';
//Updated a zod schema for creating a review
export const createReviewSchema = z.object({
  rating: z.number().min(1, 'Rating must be at least 1 star').max(5, 'Rating cannot exceed 5 stars'),
  comment: z.string().min(3, 'Review comment must be at least 3 characters').max(1000, 'Review comment too long'),
});

export type CreateReviewInput = z.infer<typeof createReviewSchema>;
