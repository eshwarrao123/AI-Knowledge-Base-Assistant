import { Router, type Request, type Response } from 'express';
import { sendSuccess } from '@utils/response';
import authRoutes from '@routes/authRoutes';

const router = Router();

// ─── Health Check ─────────────────────────────────────────────────────────────
router.get('/health', (_req: Request, res: Response) => {
  sendSuccess(res, { timestamp: new Date().toISOString() }, 'OK');
});

// ─── Feature Routers ──────────────────────────────────────────────────────────
router.use('/auth', authRoutes);

// Future routers:
// import documentRoutes from '@routes/documentRoutes';
// import conversationRoutes from '@routes/conversationRoutes';
// router.use('/documents', documentRoutes);
// router.use('/conversations', conversationRoutes);

export { router as apiRouter };
