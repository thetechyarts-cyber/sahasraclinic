import { z } from 'zod';

export const createPatientSchema = z.object({
  body: z.object({
    name: z.string().min(2, 'Name must be at least 2 characters'),
    email: z.string().email('Invalid email address'),
    password: z.string().min(8, 'Password must be at least 8 characters'),
    phone: z.string().regex(/^\+91\d{10}$/, 'Phone must be in +91XXXXXXXXXX format'),
    gender: z.enum(['male', 'female', 'other']),
    dob: z.string().optional(),
    address: z.string().optional(),
    village: z.string().optional(),
    birth_place: z.string().optional(),
  }),
});

export const updatePatientSchema = z.object({
  params: z.object({
    id: z.string().uuid('Invalid patient ID'),
  }),
  body: z.object({
    name: z.string().min(2).optional(),
    phone: z.string().regex(/^\+91\d{10}$/).optional(),
    gender: z.enum(['male', 'female', 'other']).optional(),
    dob: z.string().optional(),
    address: z.string().optional(),
    village: z.string().optional(),
    birth_place: z.string().optional(),
  }),
});

export const searchPatientsSchema = z.object({
  query: z.object({
    registrationId: z.string().optional(),
    firstName: z.string().optional(),
    lastName: z.string().optional(),
    dob: z.string().optional(),
    mobile: z.string().optional(),
    email: z.string().optional(),
    village: z.string().optional(),
    birthPlace: z.string().optional(),
    lastConsultDate: z.string().optional(),
    page: z.string().default('1'),
    limit: z.string().default('20'),
  }),
});

export const patientIdParamSchema = z.object({
  params: z.object({
    id: z.string().uuid('Invalid patient ID'),
  }),
});

export type CreatePatientPayload = z.infer<typeof createPatientSchema>['body'];
export type UpdatePatientPayload = z.infer<typeof updatePatientSchema>['body'];
export type SearchPatientsQuery = z.infer<typeof searchPatientsSchema>['query'];
