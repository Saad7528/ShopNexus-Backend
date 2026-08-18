import { z } from 'zod';

export const createProductSchema = z.object({
  title: z.string().min(3, 'Title must be at least 3 characters'),
  description: z.string().min(10, 'Description must be at least 10 characters'),
  category: z.string().min(2, 'Category is required'),
  brand: z.string().min(2, 'Brand is required'),
  price: z.number().positive('Price must be greater than 0'),
  discountPrice: z.number().positive().optional(),
  stock: z.number().int().nonnegative('Stock cannot be negative'),
  images: z.array(z.string().url()).min(1, 'At least one image is required'),
  isFlashSale: z.boolean().optional().default(false),
  flashSaleDiscountPercent: z.number().min(0).max(100).optional(),
  tags: z.array(z.string()).optional().default([]),
  variants: z
    .array(
      z.object({
        sku: z.string(),
        name: z.string(),
        price: z.number().positive(),
        stock: z.number().int().nonnegative(),
        attributes: z.record(z.string(), z.string()).optional(),
      })
    )
    .optional()
    .default([]),
});

export const productQuerySchema = z.object({
  page: z.string().optional().default('1'),
  limit: z.string().optional().default('12'),
  search: z.string().optional(),
  category: z.string().optional(),
  brand: z.string().optional(),
  minPrice: z.string().optional(),
  maxPrice: z.string().optional(),
  minRating: z.string().optional(),
  sortBy: z.enum(['price_asc', 'price_desc', 'rating', 'newest']).optional().default('newest'),
  isFlashSale: z.string().optional(),
});

export const createReviewSchema = z.object({
  productId: z.string().min(1, 'Product ID is required'),
  rating: z.number().int().min(1).max(5),
  comment: z.string().min(5, 'Review comment must be at least 5 characters').max(1000),
});
