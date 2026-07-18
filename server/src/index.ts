'use strict';

import 'dotenv/config';
import app from './app';
import { connectDB } from './config/db';
import { logger } from './utils/logger';

const PORT = process.env.PORT ?? 5000;

// ─── Process-level safety nets ────────────────────────────────────────────────

process.on('uncaughtException', (err: Error) => {
  logger.error('UNCAUGHT EXCEPTION — shutting down', err.message, err.stack);
  process.exit(1);
});

process.on('unhandledRejection', (reason: unknown) => {
  const msg = reason instanceof Error ? reason.message : String(reason);
  logger.error('UNHANDLED REJECTION — shutting down', msg);
  process.exit(1);
});

// ─── Boot ─────────────────────────────────────────────────────────────────────

const startServer = async (): Promise<void> => {
  try {
    await connectDB();
    const server = app.listen(PORT, () => {
      logger.info(`🚀 Server running on port ${PORT} in ${process.env.NODE_ENV ?? 'development'} mode`);
    });

    // Graceful shutdown on SIGTERM (sent by Docker / Render)
    process.on('SIGTERM', () => {
      logger.info('SIGTERM received — closing server gracefully');
      server.close(() => {
        logger.info('Server closed');
        process.exit(0);
      });
    });
  } catch (error) {
    logger.error('Failed to start server:', error instanceof Error ? error.message : String(error));
    process.exit(1);
  }
};

startServer();
