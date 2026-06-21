import { z } from 'zod';

export const createUserSchema = z.object({
  body: z.object({
    name: z.string().min(2),
    email: z.string().email(),
    password: z.string().min(8),
    role_id: z.string().uuid(),
    status: z.enum(['active', 'inactive', 'suspended']).default('active'),
  }),
});

export const updateUserSchema = z.object({
  body: z.object({
    name: z.string().min(2).optional(),
    email: z.string().email().optional(),
    status: z.enum(['active', 'inactive', 'suspended']).optional(),
  }),
});

export const assignRoleSchema = z.object({
  body: z.object({
    role_id: z.string().uuid(),
  }),
});

export type CreateUserPayload = z.infer<typeof createUserSchema>['body'];
export type UpdateUserPayload = z.infer<typeof updateUserSchema>['body'];
export type AssignRolePayload = z.infer<typeof assignRoleSchema>['body'];
