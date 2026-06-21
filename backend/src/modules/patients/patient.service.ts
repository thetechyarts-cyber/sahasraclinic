import bcrypt from 'bcryptjs';
import { supabase } from '../../config/supabase';
import { AppError } from '../../utils/app-error';
import { logger } from '../../utils/logger';
import { sendEmail } from '../../utils/mailer';
import { ROLES, PatientProfileRow, PaginatedResponse } from '../../types';
import { CreatePatientPayload, UpdatePatientPayload, SearchPatientsQuery } from './patient.schema';

const SALT_ROUNDS = 12;

/**
 * Generate a registration ID: HMS-YYYY-XXXXX
 */
const generateRegistrationId = async (): Promise<string> => {
  const year = new Date().getFullYear();
  const { count } = await supabase
    .from('patient_profiles')
    .select('*', { count: 'exact', head: true });

  const nextNum = (count || 0) + 1;
  return `HMS-${year}-${String(nextNum).padStart(5, '0')}`;
};

/**
 * Create a new patient (admin/super_admin creates for offline registration).
 */
const create = async (
  payload: CreatePatientPayload,
  createdBy: string,
): Promise<PatientProfileRow> => {
  // Check if email exists
  const { data: existing } = await supabase
    .from('users')
    .select('id')
    .eq('email', payload.email)
    .single();

  if (existing) {
    throw new AppError('Email already registered', 409);
  }

  // Get patient role
  const { data: patientRole } = await supabase
    .from('roles')
    .select('id')
    .eq('name', ROLES.PATIENT)
    .single();

  if (!patientRole) {
    throw new AppError('System configuration error: patient role not found', 500);
  }

  const passwordHash = await bcrypt.hash(payload.password, SALT_ROUNDS);

  // Create user
  const { data: user, error: userError } = await supabase
    .from('users')
    .insert({
      email: payload.email,
      password_hash: passwordHash,
      name: payload.name,
      role_id: patientRole.id,
      status: 'active',
    })
    .select('id, email, name')
    .single();

  if (userError || !user) {
    logger.error('Failed to create user:', userError);
    throw new AppError('Failed to create patient user', 500);
  }

  const registrationId = await generateRegistrationId();

  // Create patient profile
  const { data: profile, error: profileError } = await supabase
    .from('patient_profiles')
    .insert({
      user_id: user.id,
      registration_id: registrationId,
      gender: payload.gender,
      dob: payload.dob || null,
      phone: payload.phone,
      address: payload.address || null,
      village: payload.village || null,
      birth_place: payload.birth_place || null,
      status: 'active',
    })
    .select()
    .single();

  if (profileError || !profile) {
    await supabase.from('users').delete().eq('id', user.id);
    logger.error('Failed to create patient profile:', profileError);
    throw new AppError('Failed to create patient profile', 500);
  }

  // Audit log
  await supabase.from('audit_logs').insert({
    user_id: createdBy,
    action: 'PATIENT_CREATED',
    module: 'patients',
    entity_id: profile.id,
  });

  // Send Registration Email
  try {
    await sendEmail({
      to: payload.email,
      subject: 'Welcome to HMS - Registration Successful',
      html: `<p>Dear ${payload.name},</p><p>You have been successfully registered. Your Registration ID is <strong>${registrationId}</strong>.</p>`,
    });
  } catch (err) {
    logger.error('Failed to send registration email', err);
  }

  return profile as PatientProfileRow;
};

/**
 * Search patients with multiple filter parameters.
 */
const search = async (
  query: SearchPatientsQuery,
): Promise<PaginatedResponse<PatientProfileRow>> => {
  const page = parseInt(query.page, 10);
  const limit = parseInt(query.limit, 10);
  const offset = (page - 1) * limit;

  let dbQuery = supabase
    .from('patient_profiles')
    .select('*, users(name, email)', { count: 'exact' })
    .neq('status', 'archived');

  // Apply filters
  if (query.registrationId) {
    dbQuery = dbQuery.ilike('registration_id', `%${query.registrationId}%`);
  }
  if (query.firstName) {
    dbQuery = dbQuery.ilike('users.name', `%${query.firstName}%`);
  }
  if (query.dob) {
    dbQuery = dbQuery.eq('dob', query.dob);
  }
  if (query.mobile) {
    dbQuery = dbQuery.ilike('phone', `%${query.mobile}%`);
  }
  if (query.email) {
    dbQuery = dbQuery.ilike('users.email', `%${query.email}%`);
  }
  if (query.village) {
    dbQuery = dbQuery.ilike('village', `%${query.village}%`);
  }
  if (query.birthPlace) {
    dbQuery = dbQuery.ilike('birth_place', `%${query.birthPlace}%`);
  }

  const { data, count, error } = await dbQuery
    .order('created_at', { ascending: false })
    .range(offset, offset + limit - 1);

  if (error) {
    logger.error('Patient search error:', error);
    throw new AppError('Failed to search patients', 500);
  }

  const total = count || 0;

  return {
    items: (data || []) as PatientProfileRow[],
    total,
    page,
    limit,
    hasMore: offset + limit < total,
  };
};

/**
 * Get a single patient profile by ID.
 */
const getById = async (id: string): Promise<PatientProfileRow> => {
  const { data, error } = await supabase
    .from('patient_profiles')
    .select(`
      *, 
      users(name, email),
      consultations(*),
      prescriptions(*),
      patient_documents(*),
      prognosis_logs(*)
    `)
    .eq('id', id)
    .single();

  if (error || !data) {
    throw new AppError('Patient not found', 404);
  }

  return data as PatientProfileRow;
};

/**
 * Get a patient profile by User ID (for /me route).
 */
const getByUserId = async (userId: string): Promise<PatientProfileRow> => {
  const { data: profile } = await supabase
    .from('patient_profiles')
    .select('id')
    .eq('user_id', userId)
    .single();

  if (!profile) {
    throw new AppError('Patient profile not found', 404);
  }

  return getById(profile.id);
};

/**
 * Update a patient profile.
 */
const update = async (
  id: string,
  payload: UpdatePatientPayload,
  updatedBy: string,
): Promise<PatientProfileRow> => {
  const { data, error } = await supabase
    .from('patient_profiles')
    .update({
      ...payload,
    })
    .eq('id', id)
    .select()
    .single();

  if (error || !data) {
    throw new AppError('Failed to update patient', 500);
  }

  // Update user name if provided
  if (payload.name) {
    const profile = await getById(id);
    await supabase.from('users').update({ name: payload.name }).eq('id', profile.user_id);
  }

  // Audit log
  await supabase.from('audit_logs').insert({
    user_id: updatedBy,
    action: 'PATIENT_UPDATED',
    module: 'patients',
    entity_id: id,
  });

  return data as PatientProfileRow;
};

/**
 * Reactivate an archived patient.
 */
const reactivate = async (id: string, reactivatedBy: string): Promise<PatientProfileRow> => {
  const { data, error } = await supabase
    .from('patient_profiles')
    .update({ status: 'active', archived_at: null })
    .eq('id', id)
    .eq('status', 'archived')
    .select()
    .single();

  if (error || !data) {
    throw new AppError('Patient not found or not archived', 404);
  }

  await supabase.from('audit_logs').insert({
    user_id: reactivatedBy,
    action: 'PATIENT_REACTIVATED',
    module: 'patients',
    entity_id: id,
  });

  return data as PatientProfileRow;
};

export const patientService = {
  create,
  search,
  getById,
  getByUserId,
  update,
  reactivate,
};
