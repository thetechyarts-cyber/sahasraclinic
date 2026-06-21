import { Router } from 'express';
import { authenticate } from '../../middlewares/auth.middleware';
import { authorize } from '../../middlewares/rbac.middleware';
import { validate } from '../../middlewares/validate.middleware';
import { ROLES } from '../../types';
import * as consultationController from './consultation.controller';
import { createConsultationSchema, updateConsultationSchema } from './consultation.schema';

const router = Router();

router.post(
  '/',
  authenticate,
  authorize(ROLES.DOCTOR, ROLES.SUPER_ADMIN),
  validate(createConsultationSchema),
  consultationController.createConsultation
);

router.get(
  '/doctor',
  authenticate,
  authorize(ROLES.DOCTOR),
  consultationController.getDoctorConsultations
);

router.get(
  '/:id',
  authenticate,
  authorize(ROLES.DOCTOR, ROLES.ADMIN, ROLES.SUPER_ADMIN, ROLES.PATIENT),
  consultationController.getConsultationById
);

router.put(
  '/:id',
  authenticate,
  authorize(ROLES.DOCTOR, ROLES.SUPER_ADMIN),
  validate(updateConsultationSchema),
  consultationController.updateConsultation
);

export default router;
