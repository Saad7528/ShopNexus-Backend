import { Router } from 'express';
import { requireAuth, requireRole } from '../middlewares/auth.middleware';
import {
  getVendorProfile,
  updateVendorProfile,
  getPublicVendorShop,
} from '../controllers/vendor.controller';

const router = Router();

// Public storefront endpoint
router.get('/:vendorId/shop', getPublicVendorShop);

// Protected vendor routes
router.get('/profile', requireAuth, requireRole(['vendor', 'admin']), getVendorProfile);
router.put('/profile', requireAuth, requireRole(['vendor', 'admin']), updateVendorProfile);

export default router;
