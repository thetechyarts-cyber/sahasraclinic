import { supabase } from '../../config/supabase';
import { AppError } from '../../utils/app-error';
import { logger } from '../../utils/logger';
import { GenerateTokenPayload, UpdateTokenStatusPayload } from './queue.schema';

/**
 * Generate a sequential token for today.
 */
const generateToken = async (payload: GenerateTokenPayload, userId: string) => {
  const today = new Date().toISOString().split('T')[0];

  let actualPatientId = payload.patient_id;
  const { data: profile } = await supabase
    .from('patient_profiles')
    .select('id')
    .eq('user_id', payload.patient_id)
    .maybeSingle();
    
  if (profile) {
    actualPatientId = profile.id;
  }

  // Get current max token for today
  const { data: maxTokenData, error: maxTokenError } = await supabase
    .from('queue_tokens')
    .select('token_number')
    .eq('date', today)
    .order('token_number', { ascending: false })
    .limit(1)
    .maybeSingle();

  if (maxTokenError) {
    logger.error('Failed to get max token:', maxTokenError);
    throw new AppError('Database error generating token', 500);
  }

  const nextTokenNumber = maxTokenData ? maxTokenData.token_number + 1 : 1;

  const { data: token, error: insertError } = await supabase
    .from('queue_tokens')
    .insert({
      patient_id: actualPatientId,
      billing_id: payload.billing_id || null,
      doctor_id: payload.doctor_id || null,
      token_number: nextTokenNumber,
      date: today,
      status: 'waiting',
    })
    .select('*, patient_profiles(*, users(name))')
    .single();

  if (insertError || !token) {
    logger.error('Failed to insert token:', insertError);
    throw new AppError('Failed to generate token', 500);
  }

  // Audit
  await supabase.from('audit_logs').insert({
    user_id: userId,
    action: 'QUEUE_TOKEN_GENERATED',
    module: 'queue',
    entity_id: token.id,
  });

  return token;
};

/**
 * Get live queue status.
 */
const getLiveQueue = async (doctorId?: string) => {
  const today = new Date().toISOString().split('T')[0];

  let query = supabase
    .from('queue_tokens')
    .select('*, patient_profiles(registration_id, users(name)), billing(*, case_sheets(type))')
    .eq('date', today)
    .in('status', ['waiting', 'in_consultation'])
    .order('token_number', { ascending: true });

  if (doctorId) {
    query = query.eq('doctor_id', doctorId);
  }

  const { data: tokens, error } = await query;

  if (error) {
    throw new AppError('Failed to fetch live queue', 500);
  }

  const inConsultation = tokens?.find((t) => t.status === 'in_consultation') || null;
  const waitingList = tokens?.filter((t) => t.status === 'waiting') || [];

  return {
    currently_serving: inConsultation,
    waiting_list: waitingList,
    total_waiting: waitingList.length,
  };
};

/**
 * Get all tokens for a patient today.
 */
const getPatientQueue = async (patientId: string) => {
  let actualPatientId = patientId;
  const { data: profile } = await supabase
    .from('patient_profiles')
    .select('id')
    .eq('user_id', patientId)
    .maybeSingle();
    
  if (profile) {
    actualPatientId = profile.id;
  }

  const today = new Date().toISOString().split('T')[0];

  const { data: tokens, error } = await supabase
    .from('queue_tokens')
    .select('*')
    .eq('patient_id', actualPatientId)
    .eq('date', today)
    .order('created_at', { ascending: false });

  if (error) {
    throw new AppError('Failed to fetch patient queue tokens', 500);
  }

  // Calculate patients ahead for the first waiting token
  let tokensWithPosition = tokens || [];
  for (let i = 0; i < tokensWithPosition.length; i++) {
    if (tokensWithPosition[i].status === 'waiting') {
      const { count } = await supabase
        .from('queue_tokens')
        .select('*', { count: 'exact', head: true })
        .eq('date', today)
        .eq('status', 'waiting')
        .lt('token_number', tokensWithPosition[i].token_number);
        
      tokensWithPosition[i].patients_ahead = count || 0;
    }
  }

  return tokensWithPosition;
};

/**
 * Update token status.
 */
const updateStatus = async (id: string, payload: UpdateTokenStatusPayload, userId: string) => {
  const updates: any = { status: payload.status, updated_at: new Date().toISOString() };

  if (payload.status === 'in_consultation') {
    updates.called_at = new Date().toISOString();
  } else if (payload.status === 'completed' || payload.status === 'cancelled') {
    updates.completed_at = new Date().toISOString();
  }

  const { data: token, error } = await supabase
    .from('queue_tokens')
    .update(updates)
    .eq('id', id)
    .select()
    .single();

  if (error || !token) {
    throw new AppError('Failed to update token status', 500);
  }

  await supabase.from('audit_logs').insert({
    user_id: userId,
    action: `QUEUE_TOKEN_${payload.status.toUpperCase()}`,
    module: 'queue',
    entity_id: id,
  });

  return token;
};

export const queueService = {
  generateToken,
  getLiveQueue,
  getPatientQueue,
  updateStatus,
};
