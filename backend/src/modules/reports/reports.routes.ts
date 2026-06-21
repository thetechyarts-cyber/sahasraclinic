import { Router } from 'express';
import { authenticate } from '../../middlewares/auth.middleware';
import { authorize } from '../../middlewares/rbac.middleware';
import { ROLES } from '../../types';
import * as reportsController from './reports.controller';

const router = Router();

// Both Admin and Super Admin can view reports
router.get(
  '/dashboard',
  authenticate,
  authorize(ROLES.SUPER_ADMIN, ROLES.ADMIN),
  reportsController.getDashboardStats
);

// Doctor dashboard stats
router.get(
  '/doctor/dashboard',
  authenticate,
  authorize(ROLES.DOCTOR),
  reportsController.getDoctorDashboardStats
);

router.get(
  '/pharmacist/dashboard',
  authenticate,
  authorize(ROLES.PHARMACIST),
  reportsController.getPharmacistDashboardStats
);

export default router;
