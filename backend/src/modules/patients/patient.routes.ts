import { Router } from 'express';
import { authenticate } from '../../middlewares/auth.middleware';
import { authorize } from '../../middlewares/rbac.middleware';
import { validate } from '../../middlewares/validate.middleware';
import { ROLES } from '../../types';
import {
  createPatientSchema,
  updatePatientSchema,
  searchPatientsSchema,
  patientIdParamSchema,
} from './patient.schema';
import * as patientController from './patient.controller';

const router = Router();

// All routes require authentication
router.use(authenticate);

// Admin registers patient (offline flow)
router.post(
  '/',
  authorize(ROLES.SUPER_ADMIN, ROLES.ADMIN),
  validate(createPatientSchema),
  patientController.createPatient,
);

// Search patients (admin + doctor)
router.get(
  '/',
  authorize(ROLES.SUPER_ADMIN, ROLES.ADMIN, ROLES.DOCTOR),
  validate(searchPatientsSchema),
  patientController.searchPatients,
);

// Get my profile
router.get(
  '/me',
  authorize(ROLES.PATIENT),
  patientController.getMyProfile,
);

// Get single patient profile
router.get(
  '/:id',
  authorize(ROLES.SUPER_ADMIN, ROLES.ADMIN, ROLES.DOCTOR),
  validate(patientIdParamSchema),
  patientController.getPatient,
);

// Update patient
router.put(
  '/:id',
  authorize(ROLES.SUPER_ADMIN, ROLES.ADMIN),
  validate(updatePatientSchema),
  patientController.updatePatient,
);

// Reactivate archived patient
router.put(
  '/:id/reactivate',
  authorize(ROLES.SUPER_ADMIN, ROLES.ADMIN, ROLES.DOCTOR),
  validate(patientIdParamSchema),
  patientController.reactivatePatient,
);

export default router;
