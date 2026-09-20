import { Router } from 'express';
import {
  validateCoupon,
  createCoupon,
  getActiveCoupons,
  getAllCouponsAdmin,
  deleteCoupon,
  toggleCouponStatus,
} from '../controllers/coupon.controller';
import { requireAuth, requireRole } from '../middlewares/auth.middleware';

const router: Router = Router();

router.post('/validate', validateCoupon);
router.get('/active', getActiveCoupons);
router.get('/admin', requireAuth, requireRole(['admin']), getAllCouponsAdmin);
router.post('/', requireAuth, requireRole(['admin']), createCoupon);
router.patch('/:id/toggle', requireAuth, requireRole(['admin']), toggleCouponStatus);
router.delete('/:id', requireAuth, requireRole(['admin']), deleteCoupon);

export default router;

