import { Router } from 'express';
import { authenticate } from '../../middlewares/auth.middleware';
import { authorize } from '../../middlewares/rbac.middleware';
import { validate } from '../../middlewares/validate.middleware';
import { ROLES } from '../../types';
import * as paymentController from './payment.controller';
import { markPaidSchema, uploadScreenshotSchema } from './payment.schema';
import multer from 'multer';

const router = Router();

const upload = multer({
  storage: multer.memoryStorage(),
  limits: { fileSize: 5 * 1024 * 1024 }, // 5MB limit
});

router.post(
  '/:id/mark-paid',
  authenticate,
  authorize(ROLES.SUPER_ADMIN, ROLES.ADMIN),
  validate(markPaidSchema),
  paymentController.markPaid
);

router.get(
  '/patient/:id',
  authenticate,
  authorize(ROLES.SUPER_ADMIN, ROLES.ADMIN, ROLES.DOCTOR, ROLES.PATIENT),
  paymentController.getPatientPayments
);

router.get(
  '/pending',
  authenticate,
  authorize(ROLES.SUPER_ADMIN, ROLES.ADMIN),
  paymentController.getPendingPayments
);

router.post(
  '/:id/screenshot',
  authenticate,
  authorize(ROLES.SUPER_ADMIN, ROLES.ADMIN, ROLES.PATIENT),
  upload.single('screenshot'),
  validate(uploadScreenshotSchema),
  paymentController.uploadScreenshot
);

export default router;
