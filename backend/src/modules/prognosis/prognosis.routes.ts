import { Router } from 'express';
import { authenticate } from '../../middlewares/auth.middleware';
import { authorize } from '../../middlewares/rbac.middleware';
import { validate } from '../../middlewares/validate.middleware';
import { ROLES } from '../../types';
import * as prognosisController from './prognosis.controller';
import { createPrognosisSchema, updatePrognosisSchema } from './prognosis.schema';

const router = Router();

router.use(authenticate);

// Doctor creates a prognosis entry
router.post(
  '/',
  authorize(ROLES.DOCTOR),
  validate(createPrognosisSchema),
  prognosisController.createPrognosis
);

// Get upcoming follow-ups
// Admin sees all, Doctor sees their own
router.get(
  '/follow-ups',
  authorize(ROLES.SUPER_ADMIN, ROLES.ADMIN, ROLES.DOCTOR),
  prognosisController.getFollowUps
);

// Get a patient's full prognosis history
router.get(
  '/patient/:patientId',
  authorize(ROLES.SUPER_ADMIN, ROLES.ADMIN, ROLES.DOCTOR, ROLES.PATIENT),
  prognosisController.getPatientPrognosisHistory
);

// Update a prognosis entry
router.put(
  '/:id',
  authorize(ROLES.DOCTOR),
  validate(updatePrognosisSchema),
  prognosisController.updatePrognosis
);

export default router;
