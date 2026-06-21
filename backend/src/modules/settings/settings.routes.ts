import { Router } from 'express';
import { authenticate } from '../../middlewares/auth.middleware';
import { authorize } from '../../middlewares/rbac.middleware';
import { validate } from '../../middlewares/validate.middleware';
import { ROLES } from '../../types';
import { updateSettingsSchema } from './settings.schema';
import * as settingsController from './settings.controller';

const router = Router();

// Public routes (if needed by frontend)
router.get('/', settingsController.getAllSettings);
router.get('/:key', settingsController.getSettingByKey);

// Protected routes
router.put(
  '/:key',
  authenticate,
  authorize(ROLES.SUPER_ADMIN),
  validate(updateSettingsSchema),
  settingsController.updateSetting
);

export default router;
