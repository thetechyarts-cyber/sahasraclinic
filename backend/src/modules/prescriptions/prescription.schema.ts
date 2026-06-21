import { z } from 'zod';

export const createPrescriptionSchema = z.object({
  body: z.object({
    consultation_id: z.string().uuid(),
    patient_id: z.string().uuid(),
    medicines: z.array(
      z.object({
        name: z.string(),
        dosage: z.string(),
        frequency: z.string(),
        duration: z.string(),
        instructions: z.string().optional(),
      })
    ).min(1),
    notes: z.string().optional(),
  }),
});

export const requestPrescriptionCopySchema = z.object({
  body: z.object({
    prescription_id: z.string().uuid(),
    patient_id: z.string().uuid(),
    request_type: z.enum(['copy', 'refill']).default('copy'),
  }),
});

export type CreatePrescriptionPayload = z.infer<typeof createPrescriptionSchema>['body'];
export type RequestPrescriptionCopyPayload = z.infer<typeof requestPrescriptionCopySchema>['body'];
