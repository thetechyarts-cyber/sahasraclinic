import { z } from 'zod';

export const markPaidSchema = z.object({
  params: z.object({
    id: z.string().uuid('Invalid payment ID format'),
  }),
  body: z.object({
    status: z.enum(['success', 'failed']),
    notes: z.string().optional(),
  }),
});

export const uploadScreenshotSchema = z.object({
  params: z.object({
    id: z.string().uuid('Invalid payment ID format'),
  }),
  body: z.object({
    upiRef: z.string().min(1, 'UPI reference is required'),
  }),
});
