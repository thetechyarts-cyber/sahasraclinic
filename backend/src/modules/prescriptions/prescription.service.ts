import { supabase } from '../../config/supabase';
import { AppError } from '../../utils/app-error';
import { logger } from '../../utils/logger';
import { CreatePrescriptionPayload, RequestPrescriptionCopyPayload } from './prescription.schema';
import { resolvePatientId } from '../../utils/helpers';

const createPrescription = async (payload: CreatePrescriptionPayload, doctorId: string) => {
  const { data: prescription, error } = await supabase
    .from('prescriptions')
    .insert({
      consultation_id: payload.consultation_id,
      patient_id: payload.patient_id,
      doctor_id: doctorId,
      medicines: payload.medicines,
      notes: payload.notes,
      status: 'created',
    })
    .select('*, patient_profiles(users(name))')
    .single();

  if (error || !prescription) {
    logger.error('Failed to create prescription:', error);
    throw new AppError('Failed to create prescription', 500);
  }

  // Also update consultation status to completed
  await supabase
    .from('consultations')
    .update({ status: 'completed' })
    .eq('id', payload.consultation_id);

  return prescription;
};

const getPrescriptionById = async (id: string) => {
  const { data: prescription, error } = await supabase
    .from('prescriptions')
    .select(`
      *,
      patient_profiles(users(name, email)),
      users!prescriptions_doctor_id_fkey(name)
    `)
    .eq('id', id)
    .single();

  if (error || !prescription) {
    throw new AppError('Prescription not found', 404);
  }

  return prescription;
};

const approvePrescription = async (id: string, adminId: string) => {
  const { data: prescription, error } = await supabase
    .from('prescriptions')
    .update({
      status: 'approved',
      approved_by: adminId,
      approved_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    })
    .eq('id', id)
    .select()
    .single();

  if (error || !prescription) {
    throw new AppError('Failed to approve prescription', 500);
  }

  return prescription;
};

const getDoctorPrescriptions = async (doctorId: string) => {
  const { data: prescriptions, error } = await supabase
    .from('prescriptions')
    .select('*, patient_profiles(users(name))')
    .eq('doctor_id', doctorId)
    .order('created_at', { ascending: false });

  if (error) {
    throw new AppError('Failed to fetch prescriptions', 500);
  }

  return prescriptions || [];
};

const getAdminPrescriptions = async () => {
  const { data: prescriptions, error } = await supabase
    .from('prescriptions')
    .select('*, patient_profiles(users(name)), users!prescriptions_doctor_id_fkey(name)')
    .order('created_at', { ascending: false });

  if (error) {
    throw new AppError('Failed to fetch prescriptions', 500);
  }

  return prescriptions || [];
};

const getPatientPrescriptions = async (userId: string) => {
  const { data: patientProfile } = await supabase
    .from('patient_profiles')
    .select('id')
    .eq('user_id', userId)
    .single();

  if (!patientProfile) {
    return [];
  }

  const { data: prescriptions, error } = await supabase
    .from('prescriptions')
    .select('*, patient_profiles(users(name)), users!prescriptions_doctor_id_fkey(name)')
    .eq('patient_id', patientProfile.id)
    .order('created_at', { ascending: false });

  if (error) {
    throw new AppError('Failed to fetch prescriptions', 500);
  }

  return prescriptions || [];
};

const getPharmacistTodayPrescriptions = async () => {
  // Use today's date in local time or UTC. Simple approach: fetch all approved and filter in memory, or use gte/lte.
  // Actually, 'approved' prescriptions waiting to be dispensed.
  const startOfDay = new Date();
  startOfDay.setHours(0, 0, 0, 0);

  const { data: prescriptions, error } = await supabase
    .from('prescriptions')
    .select('*, patient_profiles(users(name)), users!prescriptions_doctor_id_fkey(name), consultations!inner(case_sheets!inner(type))')
    .eq('status', 'approved')
    .gte('approved_at', startOfDay.toISOString())
    .neq('consultations.case_sheets.type', 'online')
    .order('approved_at', { ascending: false });

  if (error) {
    logger.error('Pharmacist prescriptions fetch error:', error);
    throw new AppError('Failed to fetch prescriptions', 500);
  }

  return prescriptions || [];
};

const getPharmacistHistory = async (pharmacistId: string) => {
  const { data: prescriptions, error } = await supabase
    .from('prescriptions')
    .select('*, patient_profiles(users(name)), users!prescriptions_doctor_id_fkey(name)')
    .eq('status', 'dispensed')
    .eq('dispensed_by', pharmacistId)
    .order('dispensed_at', { ascending: false });

  if (error) {
    throw new AppError('Failed to fetch prescription history', 500);
  }

  return prescriptions || [];
};

const dispensePrescription = async (id: string, pharmacistId: string) => {
  const { data: prescription, error } = await supabase
    .from('prescriptions')
    .update({
      status: 'dispensed',
      dispensed_by: pharmacistId,
      dispensed_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    })
    .eq('id', id)
    .eq('status', 'approved') // Ensure it is approved before dispensing
    .select()
    .single();

  if (error || !prescription) {
    throw new AppError('Failed to dispense prescription or it is not approved yet', 400);
  }

  return prescription;
};

const requestPrescriptionCopy = async (payload: RequestPrescriptionCopyPayload, userId: string) => {
  const actualPatientId = await resolvePatientId(payload.patient_id);

  const { data: request, error } = await supabase
    .from('prescription_requests')
    .insert({
      patient_id: actualPatientId,
      prescription_id: payload.prescription_id,
      requested_by: userId,
      request_type: payload.request_type,
      status: 'pending',
    })
    .select()
    .single();

  if (error || !request) {
    logger.error('Failed to request prescription:', error);
    throw new AppError('Failed to create request', 500);
  }

  return request;
};

const approvePrescriptionRequest = async (requestId: string, doctorId: string) => {
  const { data: request, error } = await supabase
    .from('prescription_requests')
    .update({
      status: 'approved',
      reviewed_by: doctorId,
      reviewed_at: new Date().toISOString(),
    })
    .eq('id', requestId)
    .select()
    .single();

  if (error || !request) {
    throw new AppError('Failed to approve request', 500);
  }

  return request;
};

const getDoctorPrescriptionRequests = async (doctorId: string) => {
  const { data: requests, error } = await supabase
    .from('prescription_requests')
    .select('*, patient_profiles(users(name)), prescriptions!inner(doctor_id, created_at, medicines)')
    .eq('prescriptions.doctor_id', doctorId)
    .eq('status', 'pending')
    .order('created_at', { ascending: false });

  if (error) {
    throw new AppError('Failed to fetch requests', 500);
  }

  return requests || [];
};

export const prescriptionService = {
  createPrescription,
  getPrescriptionById,
  approvePrescription,
  getDoctorPrescriptions,
  getAdminPrescriptions,
  getPatientPrescriptions,
  getPharmacistTodayPrescriptions,
  getPharmacistHistory,
  dispensePrescription,
  requestPrescriptionCopy,
  approvePrescriptionRequest,
  getDoctorPrescriptionRequests,
};
