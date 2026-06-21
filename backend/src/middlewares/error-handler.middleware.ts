import { Request, Response, NextFunction } from 'express';
import { AppError } from '../utils/app-error';
import { sendError } from '../utils/response';
import { logger } from '../utils/logger';
import { env } from '../config/env';

/**
 * Global error handler — catches all errors thrown in routes/services.
 * Never exposes stack traces in production.
 */
export const errorHandler = (
  err: Error,
  _req: Request,
  res: Response,
  _next: NextFunction,
): void => {
  // Log all errors
  logger.error(err.message, {
    stack: err.stack,
    name: err.name,
  });

  // Handle known operational errors (AppError)
  if (err instanceof AppError) {
    sendError(res, err.message, err.statusCode);
    return;
  }

  // Handle unexpected errors
  const message =
    env.NODE_ENV === 'production'
      ? 'Internal server error'
      : err.message || 'Internal server error';

  sendError(res, message, 500);
};
