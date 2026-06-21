import { supabase } from '../../config/supabase';
import { AppError } from '../../utils/app-error';

const getAllSettings = async () => {
  const { data, error } = await supabase
    .from('system_settings')
    .select('*')
    .order('key', { ascending: true });

  if (error) {
    throw new AppError('Failed to fetch settings', 500);
  }
  return data;
};

const getSettingByKey = async (key: string) => {
  const { data, error } = await supabase
    .from('system_settings')
    .select('*')
    .eq('key', key)
    .single();

  if (error || !data) {
    throw new AppError(`Setting ${key} not found`, 404);
  }
  return data;
};

const updateSetting = async (key: string, value: any, userId: string) => {
  const { data, error } = await supabase
    .from('system_settings')
    .update({ value, updated_by: userId, updated_at: new Date().toISOString() })
    .eq('key', key)
    .select()
    .single();

  if (error || !data) {
    throw new AppError(`Failed to update setting ${key}`, 500);
  }

  // Audit Log
  await supabase.from('audit_logs').insert({
    user_id: userId,
    action: 'SETTINGS_UPDATED',
    module: 'settings',
    metadata: { key, value },
  });

  return data;
};

export const settingsService = {
  getAllSettings,
  getSettingByKey,
  updateSetting,
};
