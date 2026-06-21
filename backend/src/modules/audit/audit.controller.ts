import { Request, Response, NextFunction } from 'express';
import { auditService } from './audit.service';
import { sendSuccess } from '../../utils/response';

/**
 * GET /audit-logs — List audit logs (paginated, filtered).
 */
export const getAuditLogs = async (
  req: Request,
  res: Response,
  next: NextFunction,
): Promise<void> => {
  try {
    const result = await auditService.search(req.query as Record<string, string>);
    sendSuccess(res, result);
  } catch (err) {
    next(err);
  }
};
