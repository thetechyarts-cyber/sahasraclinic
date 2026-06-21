import { Router } from 'express';
import { authenticate } from '../../middlewares/auth.middleware';
import { authorize } from '../../middlewares/rbac.middleware';
import { validate } from '../../middlewares/validate.middleware';
import { ROLES } from '../../types';
import { cmsSchema, updateCmsSchema } from './cms.schema';
import * as cmsController from './cms.controller';

const router = Router();

// Public routes for website to consume
router.get('/', cmsController.getAllContent);
router.get('/:id', cmsController.getContentById);

// Protected routes (Super Admin only)
router.post(
  '/',
  authenticate,
  authorize(ROLES.SUPER_ADMIN),
  validate(cmsSchema),
  cmsController.createContent
);

router.put(
  '/:id',
  authenticate,
  authorize(ROLES.SUPER_ADMIN),
  validate(updateCmsSchema),
  cmsController.updateContent
);

router.delete(
  '/:id',
  authenticate,
  authorize(ROLES.SUPER_ADMIN),
  cmsController.deleteContent
);

export default router;
