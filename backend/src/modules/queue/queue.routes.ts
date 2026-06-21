import { Router } from 'express';
import { authenticate } from '../../middlewares/auth.middleware';
import { authorize } from '../../middlewares/rbac.middleware';
import { validate } from '../../middlewares/validate.middleware';
import { ROLES } from '../../types';
import * as queueController from './queue.controller';
import { generateTokenSchema, updateTokenStatusSchema } from './queue.schema';

const router = Router();

// Publicly accessible Live Queue endpoint (e.g. for TV display, doesn't need strict auth, but we will protect it)
// We will allow all valid authenticated roles to view live queue.
router.get(
  '/live',
  authenticate,
  queueController.getLiveQueue
);

router.post(
  '/tokens',
  authenticate,
  authorize(ROLES.SUPER_ADMIN, ROLES.ADMIN, ROLES.DOCTOR, ROLES.PATIENT),
  validate(generateTokenSchema),
  queueController.generateToken
);

router.get(
  '/patients/:patientId/tokens',
  authenticate,
  authorize(ROLES.SUPER_ADMIN, ROLES.ADMIN, ROLES.DOCTOR, ROLES.PATIENT),
  queueController.getPatientQueue
);

router.put(
  '/tokens/:id/status',
  authenticate,
  authorize(ROLES.SUPER_ADMIN, ROLES.ADMIN, ROLES.DOCTOR),
  validate(updateTokenStatusSchema),
  queueController.updateTokenStatus
);

export default router;
