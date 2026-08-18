import { Response } from 'express';
import { User } from '../models/User';
import { Product } from '../models/Product';
import { Coupon } from '../models/Coupon';
import { AuthenticatedRequest } from '../middlewares/auth.middleware';

export const getAdminMetrics = async (req: AuthenticatedRequest, res: Response): Promise<void> => {
  try {
    if (!req.user || req.user.role !== 'admin') {
      res.status(403).json({ success: false, message: 'Forbidden: Admin access only' });
      return;
    }

    const [totalUsers, totalProducts, totalCoupons, lowStockProducts] = await Promise.all([
      User.countDocuments(),
      Product.countDocuments(),
      Coupon.countDocuments(),
      Product.countDocuments({ stock: { $lte: 5 } }),
    ]);

    // Aggregate monthly sales metrics (simulated analytics structure for MVP)
    const salesTrends = [
      { month: 'Jan', revenue: 14200, orders: 128 },
      { month: 'Feb', revenue: 18900, orders: 156 },
      { month: 'Mar', revenue: 22400, orders: 189 },
      { month: 'Apr', revenue: 27800, orders: 230 },
      { month: 'May', revenue: 34500, orders: 285 },
      { month: 'Jun', revenue: 41200, orders: 340 },
    ];

    res.status(200).json({
      success: true,
      data: {
        summary: {
          totalRevenue: 159000,
          totalUsers,
          totalProducts,
          totalCoupons,
          lowStockAlerts: lowStockProducts,
          averageOrderValue: 121.5,
        },
        salesTrends,
      },
    });
  } catch (error: any) {
    res.status(500).json({
      success: false,
      message: error.message || 'Failed to retrieve admin metrics',
    });
  }
};
