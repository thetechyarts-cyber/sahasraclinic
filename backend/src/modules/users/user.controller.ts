import { Request, Response, NextFunction } from 'express';
import { userService } from './user.service';
import { sendSuccess } from '../../utils/response';

export const getUsers = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const users = await userService.getUsers();
    sendSuccess(res, users);
  } catch (err) {
    next(err);
  }
};

export const createUser = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const user = await userService.createUser(req.body);
    sendSuccess(res, user, 201, 'User created');
  } catch (err) {
    next(err);
  }
};

export const updateUser = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const user = await userService.updateUser(req.params.id, req.body);
    sendSuccess(res, user, 200, 'User updated');
  } catch (err) {
    next(err);
  }
};

export const assignRole = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const user = await userService.assignRole(req.params.id, req.body.role_id);
    sendSuccess(res, user, 200, 'Role assigned successfully');
  } catch (err) {
    next(err);
  }
};

export const deleteUser = async (req: Request, res: Response, next: NextFunction) => {
  try {
    await userService.deleteUser(req.params.id);
    sendSuccess(res, null, 200, 'User deleted successfully');
  } catch (err) {
    next(err);
  }
};

export const getRoles = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const roles = await userService.getRoles();
    sendSuccess(res, roles);
  } catch (err) {
    next(err);
  }
};

export const getPermissions = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const permissions = await userService.getPermissions();
    sendSuccess(res, permissions);
  } catch (err) {
    next(err);
  }
};

export const getRolePermissions = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const rolePermissions = await userService.getRolePermissions(req.params.id);
    sendSuccess(res, rolePermissions);
  } catch (err) {
    next(err);
  }
};

export const updateRolePermissions = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const result = await userService.updateRolePermissions(req.params.id, req.body.permissions);
    sendSuccess(res, result, 200, 'Role permissions updated successfully');
  } catch (err) {
    next(err);
  }
};
