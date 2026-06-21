import { Router } from 'express';
import { authenticate } from '../../middlewares/auth.middleware';
import { authorize } from '../../middlewares/rbac.middleware';
import { validate } from '../../middlewares/validate.middleware';
import { ROLES } from '../../types';
import * as userController from './user.controller';
import { createUserSchema, updateUserSchema, assignRoleSchema } from './user.schema';

const router = Router();

// Protect all user management routes
router.use(authenticate);
router.use(authorize(ROLES.SUPER_ADMIN, ROLES.ADMIN));

router.get('/', userController.getUsers);
router.post('/', validate(createUserSchema), userController.createUser);
router.put('/:id', validate(updateUserSchema), userController.updateUser);
router.delete('/:id', userController.deleteUser);
router.post('/:id/assign-role', validate(assignRoleSchema), userController.assignRole);

export default router;
