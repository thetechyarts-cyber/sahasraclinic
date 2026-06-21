import { Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';
import { env } from '../config/env';
import { supabase } from '../config/supabase';
import { sendError } from '../utils/response';
import { logger } from '../utils/logger';
import { AuthUser, ROLES, RoleName } from '../types';

/**
 * Authentication middleware — verifies JWT from Authorization header.
 * Attaches the full AuthUser object to req.user.
 */
export const authenticate = async (
  req: Request,
  res: Response,
  next: NextFunction,
): Promise<void> => {
  try {
    const authHeader = req.headers.authorization;
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      sendError(res, 'No token provided', 401);
      return;
    }

    const token = authHeader.replace('Bearer ', '');

    // Verify JWT
    const decoded = jwt.verify(token, env.JWT_SECRET) as {
      userId: string;
      email: string;
    };

    // Fetch user with role from database
    const { data: user, error } = await supabase
      .from('users')
      .select(`
        id,
        email,
        name,
        role_id,
        status,
        roles ( name )
      `)
      .eq('id', decoded.userId)
      .single();

    if (error || !user) {
      sendError(res, 'Invalid or expired token', 401);
      return;
    }

    if (user.status !== 'active') {
      sendError(res, 'Account is not active', 403);
      return;
    }

    // Attach user to request
    const roleName = (user.roles as unknown as { name: string })?.name as RoleName;
    req.user = {
      id: user.id,
      email: user.email,
      name: user.name,
      role: roleName,
      role_id: user.role_id,
    };

    next();
  } catch (err) {
    if (err instanceof jwt.TokenExpiredError) {
      sendError(res, 'Token expired', 401);
      return;
    }
    if (err instanceof jwt.JsonWebTokenError) {
      sendError(res, 'Invalid token', 401);
      return;
    }
    logger.error('Authentication error:', err);
    sendError(res, 'Authentication failed', 401);
  }
};
