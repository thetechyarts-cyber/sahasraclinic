import { supabase } from '../../config/supabase';
import { AppError } from '../../utils/app-error';
import { logger } from '../../utils/logger';
import { resolvePatientId } from '../../utils/helpers';

export const createPrognosis = async (payload: any, doctorId: string) => {
  const actualPatientId = await resolvePatientId(payload.patient_id);
  const { data: prognosis, error } = await supabase
    .from('prognosis_logs')
    .insert({
      ...payload,
      patient_id: actualPatientId,
      doctor_id: doctorId,
    })
    .select()
    .single();

  if (error || !prognosis) {
    logger.error('Failed to create prognosis log:', error);
    throw new AppError('Failed to save prognosis log', 500);
  }

  await supabase.from('audit_logs').insert({
    user_id: doctorId,
    action: 'PROGNOSIS_LOG_CREATED',
    module: 'prognosis',
    entity_id: prognosis.id,
  });

  return prognosis;
};

export const getPatientPrognosisHistory = async (patientId: string) => {
  const actualPatientId = await resolvePatientId(patientId);
  const { data, error } = await supabase
    .from('prognosis_logs')
    .select('*, users!doctor_id(name)')
    .eq('patient_id', actualPatientId)
    .order('created_at', { ascending: false });

  if (error) {
    logger.error('Failed to fetch patient prognosis logs:', error);
    throw new AppError('Failed to fetch prognosis history', 500);
  }

  return data;
};

export const updatePrognosis = async (id: string, updates: any, userId: string) => {
  const { data: prognosis, error } = await supabase
    .from('prognosis_logs')
    .update({ ...updates, updated_at: new Date().toISOString() })
    .eq('id', id)
    .select()
    .single();

  if (error || !prognosis) {
    throw new AppError('Failed to update prognosis log', 500);
  }

  await supabase.from('audit_logs').insert({
    user_id: userId,
    action: 'PROGNOSIS_LOG_UPDATED',
    module: 'prognosis',
    entity_id: id,
  });

  return prognosis;
};

export const getScheduledFollowUps = async (doctorId?: string) => {
  let query = supabase
    .from('prognosis_logs')
    .select('*, patient_profiles(users!inner(name)), users!doctor_id(name)')
    .not('followup_date', 'is', null)
    .gte('followup_date', new Date().toISOString()) // Only future or today's followups
    .order('followup_date', { ascending: true });

  if (doctorId) {
    query = query.eq('doctor_id', doctorId);
  }

  const { data, error } = await query;

  if (error) {
    logger.error('Failed to fetch scheduled followups:', error);
    throw new AppError('Failed to fetch follow-ups', 500);
  }

  return data;
};

export const prognosisService = {
  createPrognosis,
  getPatientPrognosisHistory,
  updatePrognosis,
  getScheduledFollowUps,
};
