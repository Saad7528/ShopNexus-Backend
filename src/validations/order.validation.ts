import { z } from 'zod';

export const createOrderSchema = z.object({
  items: z
    .array(
      z.object({
        productId: z.string().min(1, 'Product ID is required'),
        name: z.string().min(1, 'Product name is required'),
        price: z.number().positive('Price must be positive'),
        quantity: z.number().int().min(1, 'Quantity must be at least 1'),
        image: z.string().url('Product image must be a valid URL'),
      })
    )
    .min(1, 'Order must contain at least one item'),
  shippingAddress: z.object({
    fullName: z.string().min(2, 'Full name is required'),
    phoneNumber: z.string().min(6, 'Valid phone number is required'),
    streetAddress: z.string().min(5, 'Street address is required'),
    city: z.string().min(2, 'City is required'),
    state: z.string().min(2, 'State/Division is required'),
    zipCode: z.string().min(3, 'Postal code is required'),
    country: z.string().default('Bangladesh'),
  }),
  paymentMethod: z.enum(['stripe_card', 'mfs_bkash_nagad', 'cash_on_delivery']),
});

export type CreateOrderInput = z.infer<typeof createOrderSchema>;
