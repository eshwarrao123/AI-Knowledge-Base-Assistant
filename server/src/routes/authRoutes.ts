import { Router } from 'express';
import { body } from 'express-validator';
import { register, login, getMe } from '@controllers/authController';
import { verifyToken } from '@middleware/auth';

const router = Router();

// POST /api/auth/register
router.post(
  '/register',
  [
    body('name')
      .trim()
      .isLength({ min: 2, max: 50 })
      .withMessage('Name must be between 2 and 50 characters'),
    body('email')
      .isEmail()
      .normalizeEmail()
      .withMessage('Please provide a valid email address'),
    body('password')
      .isLength({ min: 6 })
      .withMessage('Password must be at least 6 characters'),
  ],
  register,
);

// POST /api/auth/login
router.post(
  '/login',
  [
    body('email')
      .isEmail()
      .normalizeEmail()
      .withMessage('Please provide a valid email address'),
    body('password').notEmpty().withMessage('Password is required'),
  ],
  login,
);

// GET /api/auth/me  (protected)
router.get('/me', verifyToken, getMe);

export default router;
