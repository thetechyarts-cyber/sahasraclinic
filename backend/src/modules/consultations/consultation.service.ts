import { supabase } from '../../config/supabase';
import { AppError } from '../../utils/app-error';
import { logger } from '../../utils/logger';
import { resolvePatientId } from '../../utils/helpers';
import { CreateConsultationPayload, UpdateConsultationPayload } from './consultation.schema';

const createConsultation = async (payload: CreateConsultationPayload, doctorId: string) => {
  const actualPatientId = await resolvePatientId(payload.patient_id);

  if (payload.queue_token_id) {
    const { data: existing } = await supabase
      .from('consultations')
      .select('id')
      .eq('queue_token_id', payload.queue_token_id)
      .maybeSingle();
      
    if (existing) {
      return getConsultationById(existing.id);
    }
  }

  let caseSheetId = payload.case_sheet_id;
  if (!caseSheetId) {
    const { data: latestCaseSheet } = await supabase
      .from('case_sheets')
      .select('id')
      .eq('patient_id', actualPatientId)
      .order('created_at', { ascending: false })
      .limit(1)
      .maybeSingle();
    
    if (latestCaseSheet) {
      caseSheetId = latestCaseSheet.id;
    }
  }

  const { data: consultation, error } = await supabase
    .from('consultations')
    .insert({
      patient_id: actualPatientId,
      doctor_id: doctorId,
      case_sheet_id: caseSheetId || null,
      queue_token_id: payload.queue_token_id || null,
      status: 'active',
    })
    .select('*, patient_profiles(*, users(name))')
    .single();

  if (error || !consultation) {
    logger.error('Failed to create consultation:', error);
    throw new AppError('Failed to create consultation', 500);
  }

  return consultation;
};

const getConsultationById = async (id: string) => {
  const { data: consultation, error } = await supabase
    .from('consultations')
    .select(`
      *,
      patient_profiles(
        *,
        users(name, email),
        patient_documents(*)
      ),
      case_sheets(
        *,
        female_case_sheets(*)
      )
    `)
    .eq('id', id)
    .single();

  if (error || !consultation) {
    throw new AppError('Consultation not found', 404);
  }

  return consultation;
};

const updateConsultation = async (id: string, payload: UpdateConsultationPayload) => {
  const { data: consultation, error } = await supabase
    .from('consultations')
    .update({ ...payload, updated_at: new Date().toISOString() })
    .eq('id', id)
    .select()
    .single();

  if (error || !consultation) {
    logger.error('Failed to update consultation:', error);
    throw new AppError('Failed to update consultation', 500);
  }

  return consultation;
};

const getDoctorConsultations = async (doctorId: string) => {
  const { data: consultations, error } = await supabase
    .from('consultations')
    .select('*, patient_profiles(users(name))')
    .eq('doctor_id', doctorId)
    .order('created_at', { ascending: false });

  if (error) {
    throw new AppError('Failed to fetch consultations', 500);
  }

  return consultations || [];
};

export const consultationService = {
  createConsultation,
  getConsultationById,
  updateConsultation,
  getDoctorConsultations,
};
