import { Router, type Request, type Response } from 'express';
import { sendSuccess } from '@utils/response';

const router = Router();

// ─── Health Check ─────────────────────────────────────────────────────────────
router.get('/health', (_req: Request, res: Response) => {
  sendSuccess(res, { timestamp: new Date().toISOString() }, 'OK');
});

// ─── Feature Routers ──────────────────────────────────────────────────────────
// Mount feature routers here as the project grows, e.g.:
// import { authRouter } from './authRoutes';
// import { documentRouter } from './documentRoutes';
// import { conversationRouter } from './conversationRoutes';
//
// router.use('/auth', authRouter);
// router.use('/documents', documentRouter);
// router.use('/conversations', conversationRouter);

export { router as apiRouter };
