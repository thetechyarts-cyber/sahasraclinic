import { Request, Response, NextFunction } from 'express';
import { AnyZodObject, ZodError } from 'zod';
import { sendError } from '../utils/response';

/**
 * Zod validation middleware — validates req.body, req.params, and req.query
 * against the provided Zod schema.
 *
 * Usage:
 *   router.post('/patients', validate(createPatientSchema), createPatient);
 */
export const validate = (schema: AnyZodObject) => {
  return (req: Request, res: Response, next: NextFunction): void => {
    try {
      schema.parse({
        body: req.body,
        params: req.params,
        query: req.query,
      });
      next();
    } catch (err) {
      if (err instanceof ZodError) {
        sendError(res, 'Validation failed', 400, err.errors);
        return;
      }
      next(err);
    }
  };
};
