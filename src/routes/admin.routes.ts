import { Router } from 'express';
import {
  getAdminMetrics,
  getAllOrdersAdmin,
  updateOrderStatusAdmin,
} from '../controllers/admin.controller';
import { requireAuth, requireRole } from '../middlewares/auth.middleware';

/**
 * Express router for Admin Dashboard APIs.
 * Enforces authentication and Role-Based Access Control (RBAC) middleware for admin users.
 */
const router: Router = Router();

// GET /api/v1/admin/metrics - Overview dashboard metrics & revenue analytics
router.get('/metrics', requireAuth, requireRole(['admin']), getAdminMetrics);

// GET /api/v1/admin/orders - Fetch all orders for fulfillment management
router.get('/orders', requireAuth, requireRole(['admin']), getAllOrdersAdmin);

// PATCH /api/v1/admin/orders/:id/status - Update order status state machine
router.patch('/orders/:id/status', requireAuth, requireRole(['admin']), updateOrderStatusAdmin);

export default router;
