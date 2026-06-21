import { Router } from 'express';
import multer from 'multer';
import { authenticate } from '../../middlewares/auth.middleware';
import { authorize } from '../../middlewares/rbac.middleware';
import { validate } from '../../middlewares/validate.middleware';
import { ROLES } from '../../types';
import * as caseSheetController from './case-sheet.controller';
import { createCaseSheetSchema, updateCaseSheetSchema } from './case-sheet.schema';

const router = Router();

// Configure multer for memory storage
const upload = multer({
  storage: multer.memoryStorage(),
  limits: { fileSize: 10 * 1024 * 1024 }, // 10MB limit
});

router.use(authenticate);

// Patients can create online case sheets for themselves
// Admins and Doctors can create offline/female case sheets for patients
router.post(
  '/',
  authorize(ROLES.SUPER_ADMIN, ROLES.ADMIN, ROLES.DOCTOR, ROLES.PATIENT),
  validate(createCaseSheetSchema),
  caseSheetController.createCaseSheet,
);

router.get(
  '/:id',
  authorize(ROLES.SUPER_ADMIN, ROLES.ADMIN, ROLES.DOCTOR, ROLES.PATIENT),
  caseSheetController.getCaseSheet,
);

router.put(
  '/:id',
  authorize(ROLES.SUPER_ADMIN, ROLES.ADMIN, ROLES.DOCTOR),
  validate(updateCaseSheetSchema),
  caseSheetController.updateCaseSheet,
);

router.post(
  '/:id/documents',
  authorize(ROLES.SUPER_ADMIN, ROLES.ADMIN, ROLES.DOCTOR, ROLES.PATIENT),
  upload.array('files', 5), // Max 5 files
  caseSheetController.uploadDocuments,
);

router.delete(
  '/documents/:docId',
  authorize(ROLES.SUPER_ADMIN, ROLES.ADMIN, ROLES.DOCTOR),
  caseSheetController.deleteDocument,
);

export default router;
