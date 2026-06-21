import { Router } from 'express';
import { authenticate } from '../../middlewares/auth.middleware';
import { authorize } from '../../middlewares/rbac.middleware';
import { validate } from '../../middlewares/validate.middleware';
import { ROLES } from '../../types';
import * as prescriptionController from './prescription.controller';
import { createPrescriptionSchema, requestPrescriptionCopySchema } from './prescription.schema';

const router = Router();

// Prescriptions
router.post(
  '/',
  authenticate,
  authorize(ROLES.DOCTOR),
  validate(createPrescriptionSchema),
  prescriptionController.createPrescription
);

router.get(
  '/admin',
  authenticate,
  authorize(ROLES.ADMIN, ROLES.SUPER_ADMIN),
  prescriptionController.getAdminPrescriptions
);

router.get(
  '/doctor',
  authenticate,
  authorize(ROLES.DOCTOR),
  prescriptionController.getDoctorPrescriptions
);

router.get(
  '/me',
  authenticate,
  authorize(ROLES.PATIENT),
  prescriptionController.getPatientPrescriptions
);

router.get(
  '/pharmacist/today',
  authenticate,
  authorize(ROLES.PHARMACIST),
  prescriptionController.getPharmacistTodayPrescriptions
);

router.get(
  '/pharmacist/history',
  authenticate,
  authorize(ROLES.PHARMACIST),
  prescriptionController.getPharmacistHistory
);

router.get(
  '/:id',
  authenticate,
  authorize(ROLES.DOCTOR, ROLES.ADMIN, ROLES.SUPER_ADMIN, ROLES.PATIENT, ROLES.PHARMACIST),
  prescriptionController.getPrescriptionById
);

router.put(
  '/:id/approve',
  authenticate,
  authorize(ROLES.ADMIN, ROLES.SUPER_ADMIN),
  prescriptionController.approvePrescription
);

router.put(
  '/:id/dispense',
  authenticate,
  authorize(ROLES.PHARMACIST),
  prescriptionController.dispensePrescription
);

// Requests
router.post(
  '/requests',
  authenticate,
  authorize(ROLES.PATIENT, ROLES.ADMIN),
  validate(requestPrescriptionCopySchema),
  prescriptionController.requestPrescriptionCopy
);

router.get(
  '/requests',
  authenticate,
  authorize(ROLES.DOCTOR),
  prescriptionController.getDoctorPrescriptionRequests
);

router.put(
  '/requests/:id/approve',
  authenticate,
  authorize(ROLES.DOCTOR, ROLES.SUPER_ADMIN),
  prescriptionController.approvePrescriptionRequest
);

export default router;
