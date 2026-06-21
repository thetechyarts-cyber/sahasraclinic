import bcrypt from 'bcryptjs';
import { supabase } from '../../config/supabase';
import { AppError } from '../../utils/app-error';
import { logger } from '../../utils/logger';
import { CreateUserPayload, UpdateUserPayload } from './user.schema';

const SALT_ROUNDS = 12;

const getUsers = async () => {
  const { data, error } = await supabase
    .from('users')
    .select('id, name, email, status, created_at, roles(id, name)');

  if (error) throw new AppError('Failed to fetch users', 500);
  return data;
};

const createUser = async (payload: CreateUserPayload) => {
  // Check email
  const { data: existing } = await supabase
    .from('users')
    .select('id')
    .eq('email', payload.email)
    .single();

  if (existing) throw new AppError('Email already exists', 409);

  const passwordHash = await bcrypt.hash(payload.password, SALT_ROUNDS);

  const { data, error } = await supabase
    .from('users')
    .insert({
      name: payload.name,
      email: payload.email,
      password_hash: passwordHash,
      role_id: payload.role_id,
      status: payload.status,
    })
    .select('id, name, email, status, roles(name)')
    .single();

  if (error || !data) {
    logger.error('Create user error', error);
    throw new AppError('Failed to create user', 500);
  }

  return data;
};

const updateUser = async (id: string, payload: UpdateUserPayload) => {
  const { data, error } = await supabase
    .from('users')
    .update(payload)
    .eq('id', id)
    .select('id, name, email, status')
    .single();

  if (error || !data) throw new AppError('Failed to update user', 500);
  return data;
};

const assignRole = async (id: string, roleId: string) => {
  const { data, error } = await supabase
    .from('users')
    .update({ role_id: roleId })
    .eq('id', id)
    .select('id, roles(name)')
    .single();

  if (error || !data) throw new AppError('Failed to assign role', 500);
  return data;
};

const getRoles = async () => {
  const { data, error } = await supabase.from('roles').select('id, name, description');
  if (error) throw new AppError('Failed to fetch roles', 500);
  return data;
};

const getPermissions = async () => {
  const { data, error } = await supabase.from('permissions').select('id, name, module');
  if (error) throw new AppError('Failed to fetch permissions', 500);
  return data;
};

const getRolePermissions = async (roleId: string) => {
  const { data, error } = await supabase
    .from('role_permissions')
    .select('permission_id')
    .eq('role_id', roleId);
  if (error) throw new AppError('Failed to fetch role permissions', 500);
  return data.map(rp => rp.permission_id);
};

const updateRolePermissions = async (roleId: string, permissionIds: string[]) => {
  // First delete all existing permissions for this role
  const { error: deleteError } = await supabase
    .from('role_permissions')
    .delete()
    .eq('role_id', roleId);
    
  if (deleteError) throw new AppError('Failed to clear old permissions', 500);
  
  // Then insert the new ones
  if (permissionIds.length > 0) {
    const inserts = permissionIds.map(pid => ({ role_id: roleId, permission_id: pid }));
    const { error: insertError } = await supabase
      .from('role_permissions')
      .insert(inserts);
      
    if (insertError) throw new AppError('Failed to save new permissions', 500);
  }
  
  return true;
};

const deleteUser = async (id: string) => {
  const { error } = await supabase.from('users').delete().eq('id', id);
  if (error) throw new AppError('Failed to delete user', 500);
  return true;
};

export const userService = {
  getUsers,
  createUser,
  updateUser,
  assignRole,
  getRoles,
  getPermissions,
  getRolePermissions,
  updateRolePermissions,
  deleteUser,
};
