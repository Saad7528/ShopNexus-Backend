import { Router } from 'express';
import {
  getAdminMetrics,
  getAllOrdersAdmin,
  updateOrderStatusAdmin,
  getAllUsersAdmin,
  updateUserRoleAdmin,
  deleteUserAdmin,
  getVisitorStatsAdmin,
  getAbandonedCartsAdmin,
  sendAbandonedCartCoupon,
  updateAbandonedCartStatusAdmin,
  getAllReviewsAdmin,
  updateReviewStatusAdmin,
  getLiveTrackingParcelsAdmin,
} from '../controllers/admin.controller';
import { requireAuth, requireRole } from '../middlewares/auth.middleware';

/**
 * Express router for Admin Dashboard APIs.
 * Enforces authentication and Role-Based Access Control (RBAC) middleware for admin users.
 */
const router: Router = Router();

// Metrics & Analytics
router.get('/metrics', requireAuth, requireRole(['admin']), getAdminMetrics);
router.get('/visitors/stats', requireAuth, requireRole(['admin']), getVisitorStatsAdmin);

// Order Fulfillment Management
router.get('/orders', requireAuth, requireRole(['admin']), getAllOrdersAdmin);
router.patch('/orders/:id/status', requireAuth, requireRole(['admin']), updateOrderStatusAdmin);
router.get('/tracking/parcels', requireAuth, requireRole(['admin']), getLiveTrackingParcelsAdmin);

// Abandoned Cart Recovery
router.get('/abandoned-carts', requireAuth, requireRole(['admin']), getAbandonedCartsAdmin);
router.post('/abandoned-carts/:id/recover', requireAuth, requireRole(['admin']), sendAbandonedCartCoupon);
router.patch('/abandoned-carts/:id/status', requireAuth, requireRole(['admin']), updateAbandonedCartStatusAdmin);


// Review Moderation
router.get('/reviews', requireAuth, requireRole(['admin']), getAllReviewsAdmin);
router.patch('/reviews/:id/status', requireAuth, requireRole(['admin']), updateReviewStatusAdmin);

// User & Role Management
router.get('/users', requireAuth, requireRole(['admin']), getAllUsersAdmin);
router.patch('/users/:id/role', requireAuth, requireRole(['admin']), updateUserRoleAdmin);
router.delete('/users/:id', requireAuth, requireRole(['admin']), deleteUserAdmin);

export default router;


