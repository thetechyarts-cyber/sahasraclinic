import { z } from 'zod';

export const updateSettingsSchema = z.object({
  body: z.object({
    value: z.record(z.any()),
  }),
});
