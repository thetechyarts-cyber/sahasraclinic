import { Router } from 'express';
import { authenticate } from '../../middlewares/auth.middleware';
import { authorize } from '../../middlewares/rbac.middleware';
import { ROLES } from '../../types';
import * as auditController from './audit.controller';

const router = Router();

// Super admin + admin can view audit logs
router.get(
  '/',
  authenticate,
  authorize(ROLES.SUPER_ADMIN, ROLES.ADMIN),
  auditController.getAuditLogs,
);

export default router;
