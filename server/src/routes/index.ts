import { Router } from 'express';

const router = Router();

// Mount your feature routers here, e.g.:
// import { authRouter } from './authRoutes';
// router.use('/auth', authRouter);

// Health check / placeholder
router.get('/', (_req, res) => {
  res.json({ success: true, message: 'API v1 is running 🚀' });
});

export { router as apiRouter };
