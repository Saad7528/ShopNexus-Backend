import { Router } from 'express';
import { validateCoupon, createCoupon, getActiveCoupons } from '../controllers/coupon.controller';
import { requireAuth } from '../middlewares/auth.middleware';

const router: Router = Router();

router.post('/validate', validateCoupon);
router.get('/active', getActiveCoupons);
router.post('/', requireAuth, createCoupon);

export default router;
