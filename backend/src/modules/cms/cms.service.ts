import { supabase } from '../../config/supabase';
import { AppError } from '../../utils/app-error';
import { CreateCmsPayload, UpdateCmsPayload } from './cms.schema';
import { auditService } from '../audit/audit.service';

const create = async (payload: CreateCmsPayload, userId: string) => {
  const { data, error } = await supabase
    .from('website_content')
    .insert(payload)
    .select()
    .single();

  if (error) throw new AppError(error.message, 400);

  await auditService.log({
    userId,
    action: 'CMS_CREATE',
    module: 'cms',
    entityId: data.id,
  });

  return data;
};

const getAll = async (type?: string, status?: string) => {
  let query = supabase.from('website_content').select('*').order('created_at', { ascending: false });

  if (type) query = query.eq('type', type);
  if (status) query = query.eq('status', status);

  const { data, error } = await query;
  if (error) throw new AppError(error.message, 400);

  return data;
};

const getById = async (id: string) => {
  const { data, error } = await supabase.from('website_content').select('*').eq('id', id).single();
  if (error) throw new AppError('Content not found', 404);
  return data;
};

const update = async (id: string, payload: UpdateCmsPayload, userId: string) => {
  const { data, error } = await supabase
    .from('website_content')
    .update(payload)
    .eq('id', id)
    .select()
    .single();

  if (error) throw new AppError(error.message, 400);

  await auditService.log({
    userId,
    action: 'CMS_UPDATE',
    module: 'cms',
    entityId: id,
  });

  return data;
};

const remove = async (id: string, userId: string) => {
  const { error } = await supabase.from('website_content').delete().eq('id', id);
  if (error) throw new AppError(error.message, 400);

  await auditService.log({
    userId,
    action: 'CMS_DELETE',
    module: 'cms',
    entityId: id,
  });

  return { deleted: true };
};

export const cmsService = {
  create,
  getAll,
  getById,
  update,
  remove,
};
