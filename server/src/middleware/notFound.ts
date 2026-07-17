import type { Request, Response, NextFunction } from 'express';
import { AppError } from './errorHandler';

export const notFound = (req: Request, _res: Response, next: NextFunction): void => {
  next(new AppError(`Route not found: ${req.originalUrl}`, 404));
};
