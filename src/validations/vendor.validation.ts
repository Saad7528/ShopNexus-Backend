import { z } from 'zod';

export const updateVendorProfileSchema = z.object({
  storeName: z.string().min(2, 'Store name must be at least 2 characters').max(100),
  storeDescription: z.string().max(1000).optional(),
  storeBanner: z.string().url('Invalid URL format for banner image').optional().or(z.literal('')),
  storeLogo: z.string().url('Invalid URL format for logo image').optional().or(z.literal('')),
  supportEmail: z.string().email('Invalid email address').optional().or(z.literal('')),
  supportPhone: z.string().min(6, 'Phone number is too short').max(20).optional().or(z.literal('')),
  address: z.object({
    street: z.string().optional(),
    city: z.string().optional(),
    state: z.string().optional(),
    zipCode: z.string().optional(),
    country: z.string().optional(),
  }).optional(),
});

export type UpdateVendorProfileInput = z.infer<typeof updateVendorProfileSchema>;
