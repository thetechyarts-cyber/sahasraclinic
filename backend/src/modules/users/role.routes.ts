import { Router } from 'express';
import { authenticate } from '../../middlewares/auth.middleware';
import { authorize } from '../../middlewares/rbac.middleware';
import { ROLES } from '../../types';
import * as userController from './user.controller';

const router = Router();

router.use(authenticate);
router.use(authorize(ROLES.SUPER_ADMIN));

router.get('/', userController.getRoles);
router.get('/permissions', userController.getPermissions);
router.get('/:id/permissions', userController.getRolePermissions);
router.put('/:id/permissions', userController.updateRolePermissions);

export default router;
