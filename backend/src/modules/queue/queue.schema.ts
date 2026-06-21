import { z } from 'zod';

export const generateTokenSchema = z.object({
  body: z.object({
    patient_id: z.string().uuid(),
    billing_id: z.string().uuid().optional(),
    doctor_id: z.string().uuid().optional(),
  }),
});

export const updateTokenStatusSchema = z.object({
  body: z.object({
    status: z.enum(['waiting', 'in_consultation', 'completed', 'cancelled']),
  }),
});

export type GenerateTokenPayload = z.infer<typeof generateTokenSchema>['body'];
export type UpdateTokenStatusPayload = z.infer<typeof updateTokenStatusSchema>['body'];
