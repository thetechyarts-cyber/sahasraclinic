import { z } from 'zod';

export const createPrognosisSchema = z.object({
  body: z.object({
    patient_id: z.string().uuid('Invalid patient ID'),
    prescription_id: z.string().uuid('Invalid prescription ID').optional(),
    patient_feedback: z.string().optional(),
    recovery_status: z.enum(['improving', 'stable', 'deteriorating', 'recovered']),
    mood: z.string().optional(),
    progress_notes: z.string().min(1, 'Progress notes are required'),
    followup_date: z.string().datetime().optional(),
  }),
});

export const updatePrognosisSchema = z.object({
  params: z.object({
    id: z.string().uuid('Invalid prognosis ID format'),
  }),
  body: z.object({
    patient_feedback: z.string().optional(),
    recovery_status: z.enum(['improving', 'stable', 'deteriorating', 'recovered']).optional(),
    mood: z.string().optional(),
    progress_notes: z.string().optional(),
    followup_date: z.string().datetime().optional(),
  }),
});
