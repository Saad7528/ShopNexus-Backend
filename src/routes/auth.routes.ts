import { Router } from 'express';
import {
  register,
  login,
  logout,
  getMe,
  updateProfile,
  googleAuth,
  githubAuth,
  forgotPassword,
  resetPassword,
} from '../controllers/auth.controller';
import { requireAuth } from '../middlewares/auth.middleware';

const router: Router = Router();

// Standard Email/Password routes
router.post('/register', register);
router.post('/login', login);
router.post('/logout', logout);
router.get('/me', requireAuth, getMe);
router.patch('/profile', requireAuth, updateProfile);

// Password Reset Security routes
router.post('/forgot-password', forgotPassword);
router.post('/reset-password', resetPassword);

// 1-Click Social OAuth routes
router.post('/google', googleAuth);
router.post('/github', githubAuth);

export default router;
