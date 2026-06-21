import { Router } from 'express';
import { authenticate } from '../../middlewares/auth.middleware';
import { validate } from '../../middlewares/validate.middleware';
import { registerSchema, loginSchema, otpSendSchema, otpVerifySchema, resetPasswordSchema } from './auth.schema';
import * as authController from './auth.controller';

const router = Router();

// Public routes
router.post('/register', validate(registerSchema), authController.register);
router.post('/login', validate(loginSchema), authController.login);
router.post('/otp/send', validate(otpSendSchema), authController.sendOtp);
router.post('/otp/verify', validate(otpVerifySchema), authController.verifyOtp);
router.post('/reset-password', validate(resetPasswordSchema), authController.resetPassword);

// Protected routes
router.post('/refresh', authenticate, authController.refreshToken);
router.post('/logout', authenticate, authController.logout);

export default router;
