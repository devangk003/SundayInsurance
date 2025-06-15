import express from 'express';
import { authenticateToken } from '../middleware/auth';
import {
  registerUser,
  loginUser,
  getCurrentUser,
  updateUserProfile,
  getUserDashboard
} from '../controllers/authController';

const router = express.Router();

// Public routes
router.post('/register', registerUser);
router.post('/login', loginUser);

// Protected routes
router.use(authenticateToken);
router.get('/me', getCurrentUser);
router.put('/profile', updateUserProfile);
router.get('/dashboard', getUserDashboard);

export default router;
