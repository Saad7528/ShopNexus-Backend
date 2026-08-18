import { Request, Response } from 'express';
import { Coupon } from '../models/Coupon';
import { z } from 'zod';
import { AuthenticatedRequest } from '../middlewares/auth.middleware';

const validateCouponSchema = z.object({
  code: z.string().min(1, 'Coupon code is required'),
  cartTotal: z.number().nonnegative('Cart total must be positive'),
});

const createCouponSchema = z.object({
  code: z.string().min(2).max(20),
  discountType: z.enum(['percentage', 'fixed']),
  discountValue: z.number().positive(),
  minPurchaseAmount: z.number().nonnegative().optional().default(0),
  maxDiscountAmount: z.number().positive().optional(),
  expiryDate: z.string(),
  usageLimit: z.number().int().positive().optional(),
});

export const validateCoupon = async (req: Request, res: Response): Promise<void> => {
  try {
    const { code, cartTotal } = validateCouponSchema.parse(req.body);

    const coupon = await Coupon.findOne({
      code: code.toUpperCase(),
      isActive: true,
    });

    if (!coupon) {
      res.status(404).json({
        success: false,
        message: 'Invalid or inactive coupon code.',
      });
      return;
    }

    const now = new Date();
    if (now < coupon.startDate || now > coupon.expiryDate) {
      res.status(400).json({
        success: false,
        message: 'This coupon has expired or is not yet active.',
      });
      return;
    }

    if (coupon.usageLimit && coupon.usedCount >= coupon.usageLimit) {
      res.status(400).json({
        success: false,
        message: 'This coupon has reached its maximum usage limit.',
      });
      return;
    }

    if (cartTotal < coupon.minPurchaseAmount) {
      res.status(400).json({
        success: false,
        message: `Minimum purchase of $${coupon.minPurchaseAmount} is required for this coupon.`,
      });
      return;
    }

    let discountAmount = 0;
    if (coupon.discountType === 'percentage') {
      discountAmount = (cartTotal * coupon.discountValue) / 100;
      if (coupon.maxDiscountAmount && discountAmount > coupon.maxDiscountAmount) {
        discountAmount = coupon.maxDiscountAmount;
      }
    } else {
      discountAmount = Math.min(coupon.discountValue, cartTotal);
    }

    discountAmount = parseFloat(discountAmount.toFixed(2));

    res.status(200).json({
      success: true,
      message: 'Coupon applied successfully!',
      data: {
        code: coupon.code,
        discountType: coupon.discountType,
        discountValue: coupon.discountValue,
        discountAmount,
      },
    });
  } catch (error: any) {
    if (error.name === 'ZodError') {
      res.status(400).json({ success: false, message: 'Validation failed', errors: error.errors });
      return;
    }
    res.status(500).json({ success: false, message: error.message || 'Error validating coupon' });
  }
};

export const createCoupon = async (req: AuthenticatedRequest, res: Response): Promise<void> => {
  try {
    if (!req.user || req.user.role !== 'admin') {
      res.status(403).json({ success: false, message: 'Only admins can create coupons' });
      return;
    }

    const validatedData = createCouponSchema.parse(req.body);

    const existing = await Coupon.findOne({ code: validatedData.code.toUpperCase() });
    if (existing) {
      res.status(409).json({ success: false, message: 'A coupon with this code already exists' });
      return;
    }

    const coupon = await Coupon.create({
      ...validatedData,
      code: validatedData.code.toUpperCase(),
      expiryDate: new Date(validatedData.expiryDate),
    });

    res.status(201).json({
      success: true,
      message: 'Coupon created successfully',
      data: { coupon },
    });
  } catch (error: any) {
    if (error.name === 'ZodError') {
      res.status(400).json({ success: false, message: 'Validation failed', errors: error.errors });
      return;
    }
    res.status(500).json({ success: false, message: error.message || 'Failed to create coupon' });
  }
};

export const getActiveCoupons = async (_req: Request, res: Response): Promise<void> => {
  try {
    const coupons = await Coupon.find({
      isActive: true,
      expiryDate: { $gt: new Date() },
    }).select('-__v');

    res.status(200).json({ success: true, data: { coupons } });
  } catch (error: any) {
    res.status(500).json({ success: false, message: error.message || 'Failed to fetch coupons' });
  }
};
