import { Request, Response, NextFunction } from 'express';
import { authService } from './auth.service';
import { sendSuccess, sendError } from '../../utils/response';
import { RegisterPayload, LoginPayload, OtpSendPayload, OtpVerifyPayload, ResetPasswordPayload } from './auth.schema';

/**
 * POST /auth/register — Patient self-registration.
 */
export const register = async (
  req: Request,
  res: Response,
  next: NextFunction,
): Promise<void> => {
  try {
    const body = req.body as RegisterPayload;
    const result = await authService.register(body);
    sendSuccess(res, result, 201, 'Registration successful');
  } catch (err) {
    next(err);
  }
};

/**
 * POST /auth/login — Email + password login.
 */
export const login = async (
  req: Request,
  res: Response,
  next: NextFunction,
): Promise<void> => {
  try {
    const body = req.body as LoginPayload;
    const result = await authService.login(body);
    sendSuccess(res, result, 200, 'Login successful');
  } catch (err) {
    next(err);
  }
};

/**
 * POST /auth/logout — Logout and audit.
 */
export const logout = async (
  req: Request,
  res: Response,
  next: NextFunction,
): Promise<void> => {
  try {
    if (!req.user) {
      sendError(res, 'Not authenticated', 401);
      return;
    }
    await authService.logout(req.user.id);
    sendSuccess(res, null, 200, 'Logged out successfully');
  } catch (err) {
    next(err);
  }
};

/**
 * POST /auth/otp/send — Send OTP (Twilio / SendGrid mock)
 */
export const sendOtp = async (
  req: Request,
  res: Response,
  next: NextFunction,
): Promise<void> => {
  try {
    const body = req.body as OtpSendPayload;
    await authService.sendOtp(body);
    sendSuccess(res, { sent: true }, 200, 'OTP sent successfully');
  } catch (err) {
    next(err);
  }
};

/**
 * POST /auth/otp/verify — Verify OTP
 */
export const verifyOtp = async (
  req: Request,
  res: Response,
  next: NextFunction,
): Promise<void> => {
  try {
    const body = req.body as OtpVerifyPayload;
    const result = await authService.verifyOtp(body);
    sendSuccess(res, result, 200, 'OTP verified successfully');
  } catch (err) {
    next(err);
  }
};

/**
 * POST /auth/refresh — Refresh JWT
 */
export const refreshToken = async (
  req: Request,
  res: Response,
  next: NextFunction,
): Promise<void> => {
  try {
    const body = req.body as { refreshToken: string };
    const token = await authService.refreshToken(body.refreshToken);
    sendSuccess(res, { token }, 200, 'Token refreshed successfully');
  } catch (err) {
    next(err);
  }
};

/**
 * POST /auth/reset-password — Reset Password
 */
export const resetPassword = async (
  req: Request,
  res: Response,
  next: NextFunction,
): Promise<void> => {
  try {
    const body = req.body as ResetPasswordPayload;
    await authService.resetPassword(body);
    sendSuccess(res, { success: true }, 200, 'Password reset successfully');
  } catch (err) {
    next(err);
  }
};
