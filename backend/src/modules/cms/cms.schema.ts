import { z } from 'zod';

export const cmsSchema = z.object({
  body: z.object({
    type: z.enum([
      'treatments',
      'departments',
      'doctors',
      'testimonials',
      'home',
      'faq',
      'contact',
      'policies',
      'hospital_info',
    ]),
    title: z.string().min(1, 'Title is required'),
    content: z.record(z.unknown()),
    status: z.enum(['draft', 'published']).default('published'),
  }),
});

export const updateCmsSchema = z.object({
  body: z.object({
    title: z.string().optional(),
    content: z.record(z.unknown()).optional(),
    status: z.enum(['draft', 'published']).optional(),
  }),
});

export type CreateCmsPayload = z.infer<typeof cmsSchema>['body'];
export type UpdateCmsPayload = z.infer<typeof updateCmsSchema>['body'];
