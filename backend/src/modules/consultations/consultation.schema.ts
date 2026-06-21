import { z } from 'zod';

export const createConsultationSchema = z.object({
  body: z.object({
    patient_id: z.string().uuid(),
    case_sheet_id: z.string().uuid().optional(),
    queue_token_id: z.string().uuid().optional(),
  }),
});

export const updateConsultationSchema = z.object({
  body: z.object({
    notes: z.string().optional(),
    diagnosis: z.string().optional(),
    followup_date: z.string().optional(), // YYYY-MM-DD
    status: z.enum(['active', 'completed']).optional(),
  }),
});

export type CreateConsultationPayload = z.infer<typeof createConsultationSchema>['body'];
export type UpdateConsultationPayload = z.infer<typeof updateConsultationSchema>['body'];
