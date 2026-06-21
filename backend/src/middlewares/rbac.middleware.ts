import { Request, Response, NextFunction } from 'express';
import { sendError } from '../utils/response';
import { RoleName } from '../types';

/**
 * RBAC middleware — checks if the authenticated user has one of the allowed roles.
 * Must be used AFTER authenticate middleware.
 *
 * Usage:
 *   router.post('/patients', authenticate, authorize('super_admin', 'admin'), createPatient);
 */
export const authorize = (...allowedRoles: RoleName[]) => {
  return (req: Request, res: Response, next: NextFunction): void => {
    if (!req.user) {
      sendError(res, 'Authentication required', 401);
      return;
    }

    if (!allowedRoles.includes(req.user.role)) {
      sendError(res, 'Access denied — insufficient permissions', 403);
      return;
    }

    next();
  };
};
