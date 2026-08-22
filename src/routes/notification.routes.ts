import { Router } from 'express';
import {
  getNotifications,
  markNotificationRead,
  markAllNotificationsRead,
} from '../controllers/notification.controller';
import { requireAuth } from '../middlewares/auth.middleware';

const router: Router = Router();

// GET /api/notifications
router.get('/', requireAuth, getNotifications);

// PATCH /api/notifications/:id/read
router.patch('/:id/read', requireAuth, markNotificationRead);

// POST /api/notifications/read-all
router.post('/read-all', requireAuth, markAllNotificationsRead);

export default router;
