import { z } from 'zod';

export const registerSchema = z.object({
  body: z.object({
    name: z.string().min(2, 'Name must be at least 2 characters'),
    email: z.string().email('Invalid email address'),
    password: z
      .string()
      .min(8, 'Password must be at least 8 characters')
      .regex(/[A-Z]/, 'Password must contain at least one uppercase letter')
      .regex(/[0-9]/, 'Password must contain at least one number')
      .regex(/[^A-Za-z0-9]/, 'Password must contain at least one special character'),
    phone: z.string().regex(/^\+91\d{10}$/, 'Phone must be in +91XXXXXXXXXX format'),
    gender: z.enum(['male', 'female', 'other']),
    dob: z.string().optional(),
    address: z.string().optional(),
    village: z.string().optional(),
    birth_place: z.string().optional(),
  }),
});

export const loginSchema = z.object({
  body: z.object({
    email: z.string().email('Invalid email address'),
    password: z.string().min(1, 'Password is required'),
  }),
});

export const otpSendSchema = z.object({
  body: z.object({
    email: z.string().email().optional(),
    phone: z.string().regex(/^\+91\d{10}$/).optional(),
  }).refine((data) => data.email || data.phone, {
    message: 'Either email or phone is required',
  }),
});

export const otpVerifySchema = z.object({
  body: z.object({
    email: z.string().email().optional(),
    phone: z.string().optional(),
    otp: z.string().length(6, 'OTP must be 6 digits'),
  }),
});

export const refreshTokenSchema = z.object({
  body: z.object({
    refreshToken: z.string().min(1, 'Refresh token is required'),
  }),
});

export type RegisterPayload = z.infer<typeof registerSchema>['body'];
export type LoginPayload = z.infer<typeof loginSchema>['body'];
export type OtpSendPayload = z.infer<typeof otpSendSchema>['body'];
export type OtpVerifyPayload = z.infer<typeof otpVerifySchema>['body'];

export const resetPasswordSchema = z.object({
  body: z.object({
    email: z.string().email(),
    otp: z.string().length(6, 'OTP must be 6 digits'),
    newPassword: z
      .string()
      .min(8, 'Password must be at least 8 characters')
      .regex(/[A-Z]/, 'Password must contain at least one uppercase letter')
      .regex(/[0-9]/, 'Password must contain at least one number')
      .regex(/[^A-Za-z0-9]/, 'Password must contain at least one special character'),
  }),
});

export type ResetPasswordPayload = z.infer<typeof resetPasswordSchema>['body'];
