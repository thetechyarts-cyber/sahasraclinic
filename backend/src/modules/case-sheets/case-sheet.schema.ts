import { z } from 'zod';

const femaleHistorySchema = z.object({
  menstrual_history: z.record(z.any()).optional(),
  pregnancy_history: z.record(z.any()).optional(),
  lmp_date: z.string().optional(),
  lmp_details: z.string().optional(),
  obstetric_history: z.record(z.any()).optional(),
  gynaecological_history: z.record(z.any()).optional(),
  contraceptive_history: z.string().optional(),
  notes: z.string().optional(),
});

export const createCaseSheetSchema = z.object({
  body: z.object({
    patient_id: z.string().uuid(),
    type: z.enum(['online', 'offline', 'female']),
    chief_complaint: z.string().min(2),
    history: z.record(z.any()).optional(),
    vitals: z.record(z.any()).optional(),
    status: z.enum(['draft', 'complete']).default('draft'),
    female_history: femaleHistorySchema.optional(),
  }),
});

export const updateCaseSheetSchema = z.object({
  body: z.object({
    type: z.enum(['online', 'offline', 'female']).optional(),
    chief_complaint: z.string().min(2).optional(),
    history: z.record(z.any()).optional(),
    vitals: z.record(z.any()).optional(),
    status: z.enum(['draft', 'complete']).optional(),
    female_history: femaleHistorySchema.optional(),
  }),
});

export type CreateCaseSheetPayload = z.infer<typeof createCaseSheetSchema>['body'];
export type UpdateCaseSheetPayload = z.infer<typeof updateCaseSheetSchema>['body'];
