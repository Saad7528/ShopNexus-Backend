import { Router } from 'express';
import {
  getAdminMetrics,
  getAllOrdersAdmin,
  updateOrderStatusAdmin,
} from '../controllers/admin.controller';
import { requireAuth, requireRole } from '../middlewares/auth.middleware';

const router: Router = Router();

router.get('/metrics', requireAuth, requireRole(['admin']), getAdminMetrics);
router.get('/orders', requireAuth, requireRole(['admin']), getAllOrdersAdmin);
router.patch('/orders/:id/status', requireAuth, requireRole(['admin']), updateOrderStatusAdmin);

export default router;
