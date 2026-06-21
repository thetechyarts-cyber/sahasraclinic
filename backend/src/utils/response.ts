import { Response } from 'express';

/**
 * Standard success response shape:
 * { success: true, data: T, message?: string }
 */
export const sendSuccess = <T>(
  res: Response,
  data: T,
  statusCode: number = 200,
  message?: string,
): Response => {
  return res.status(statusCode).json({
    success: true,
    data,
    ...(message && { message }),
  });
};

/**
 * Standard error response shape:
 * { success: false, error: string, details?: unknown[] }
 */
export const sendError = (
  res: Response,
  error: string,
  statusCode: number = 400,
  details?: unknown[],
): Response => {
  return res.status(statusCode).json({
    success: false,
    error,
    ...(details && { details }),
  });
};
