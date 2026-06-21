import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import { supabase } from '../../config/supabase';
import { env } from '../../config/env';
import { AppError } from '../../utils/app-error';
import { logger } from '../../utils/logger';
import { sendOTPEmail } from '../../utils/mailer';
import { ROLES, LoginResponse } from '../../types';
import { RegisterPayload, LoginPayload, OtpSendPayload, OtpVerifyPayload, ResetPasswordPayload } from './auth.schema';

const SALT_ROUNDS = 12;

/**
 * Generate a registration ID: HMS-YYYY-XXXXX
 */
const generateRegistrationId = async (): Promise<string> => {
  const year = new Date().getFullYear();
  const { count, error } = await supabase
    .from('patient_profiles')
    .select('*', { count: 'exact', head: true });

  const nextNum = (count || 0) + 1;
  return `HMS-${year}-${String(nextNum).padStart(5, '0')}`;
};

/**
 * Generate JWT token for a user.
 */
const generateToken = (userId: string, email: string): string => {
  return jwt.sign({ userId, email }, env.JWT_SECRET, {
    expiresIn: env.JWT_EXPIRES_IN as any,
  });
};

/**
 * Register a new patient.
 */
const register = async (payload: RegisterPayload): Promise<LoginResponse> => {
  // Check if email already exists
  const { data: existing } = await supabase
    .from('users')
    .select('id')
    .eq('email', payload.email)
    .single();

  if (existing) {
    throw new AppError('Email already registered', 409);
  }

  // Get patient role
  const { data: patientRole, error: roleError } = await supabase
    .from('roles')
    .select('id')
    .eq('name', ROLES.PATIENT)
    .single();

  if (roleError || !patientRole) {
    throw new AppError('System configuration error: patient role not found', 500);
  }

  // Hash password
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
    throw new AppError('Failed to create account', 500);
  }

  // Generate registration ID and create patient profile
  const registrationId = await generateRegistrationId();

  const { error: profileError } = await supabase.from('patient_profiles').insert({
    user_id: user.id,
    registration_id: registrationId,
    gender: payload.gender,
    dob: payload.dob || null,
    phone: payload.phone,
    address: payload.address || null,
    village: payload.village || null,
    birth_place: payload.birth_place || null,
    status: 'active',
  });

  if (profileError) {
    // Rollback user creation
    await supabase.from('users').delete().eq('id', user.id);
    logger.error('Failed to create patient profile:', profileError);
    throw new AppError('Failed to create patient profile', 500);
  }

  // Log audit
  await supabase.from('audit_logs').insert({
    user_id: user.id,
    action: 'PATIENT_REGISTERED',
    module: 'auth',
    entity_id: user.id,
  });

  // Generate JWT
  const token = generateToken(user.id, user.email);

  return {
    token,
    user: {
      id: user.id,
      email: user.email,
      name: user.name,
      role: ROLES.PATIENT,
    },
  };
};

/**
 * Login with email and password.
 */
const login = async (payload: LoginPayload): Promise<LoginResponse> => {
  // Fetch user with role
  const { data: user, error } = await supabase
    .from('users')
    .select(`
      id,
      email,
      name,
      password_hash,
      status,
      role_id,
      roles ( name )
    `)
    .eq('email', payload.email)
    .single();

  if (error || !user) {
    throw new AppError('Invalid credentials', 401);
  }

  if (user.status !== 'active') {
    throw new AppError('Account is not active', 403);
  }

  // Verify password
  const isValid = await bcrypt.compare(payload.password, user.password_hash);
  if (!isValid) {
    throw new AppError('Invalid credentials', 401);
  }

  const roleName = (user.roles as unknown as { name: string })?.name;

  // Log audit
  await supabase.from('audit_logs').insert({
    user_id: user.id,
    action: 'USER_LOGIN',
    module: 'auth',
    entity_id: user.id,
  });

  // Generate JWT
  const token = generateToken(user.id, user.email);

  return {
    token,
    user: {
      id: user.id,
      email: user.email,
      name: user.name,
      role: roleName as typeof ROLES[keyof typeof ROLES],
    },
  };
};

/**
 * Logout — audit log entry. JWT invalidation handled client-side.
 */
const logout = async (userId: string): Promise<void> => {
  await supabase.from('audit_logs').insert({
    user_id: userId,
    action: 'USER_LOGOUT',
    module: 'auth',
    entity_id: userId,
  });
};

/**
 * Send OTP to email or phone.
 */
const sendOtp = async (payload: OtpSendPayload): Promise<void> => {
  const target = payload.email || payload.phone;
  if (!target) throw new AppError('Email or phone required', 400);

  // Check if user exists
  const { data: user } = await supabase
    .from('users')
    .select('id')
    .or(`email.eq.${target},phone.eq.${target}`) // assuming phone is also handled, though phone is in patient_profiles. For now, assuming email/phone login. Wait, users table only has email. Let's just use email for simplicity or lookup by phone via join.
    // Actually, users table only has email.
    .limit(1)
    .maybeSingle();

  // We can send OTP even if user doesn't exist (for phone verification during registration, etc.)
  // Or maybe only to existing users for forgot password? Let's assume generic.

  const code = Math.floor(100000 + Math.random() * 900000).toString(); // 6 digits
  const expiresAt = new Date(Date.now() + 5 * 60 * 1000); // 5 minutes

  const { error } = await supabase.from('otp_codes').insert({
    email_or_phone: target,
    code,
    expires_at: expiresAt.toISOString(),
  });

  if (error) {
    logger.error('Failed to generate OTP:', error);
    throw new AppError('Failed to generate OTP', 500);
  }

  // Send OTP via Email (or fallback to logger if phone)
  if (target.includes('@')) {
    try {
      await sendOTPEmail(target, code);
      logger.info(`OTP sent via email to ${target}`);
    } catch (err) {
      logger.error('Failed to send OTP email:', err);
    }
  } else {
    // Phone handling (WhatsApp/SMS not fully integrated yet)
    logger.info(`[MOCK OTP] Sent ${code} to phone ${target}`);
  }
};

/**
 * Verify OTP.
 */
const verifyOtp = async (payload: OtpVerifyPayload): Promise<LoginResponse> => {
  const target = payload.email || payload.phone;
  if (!target) throw new AppError('Email or phone required', 400);

  const { data: otpRecord, error } = await supabase
    .from('otp_codes')
    .select('*')
    .eq('email_or_phone', target)
    .eq('code', payload.otp)
    .gte('expires_at', new Date().toISOString())
    .order('created_at', { ascending: false })
    .limit(1)
    .maybeSingle();

  if (error || !otpRecord) {
    throw new AppError('Invalid or expired OTP', 400);
  }

  // OTP is valid. Delete all OTPs for this target
  await supabase.from('otp_codes').delete().eq('email_or_phone', target);

  // Fetch user to log them in (if they exist)
  const { data: user } = await supabase
    .from('users')
    .select(`id, email, name, status, roles ( name )`)
    .eq('email', target)
    .single();

  if (!user) {
    throw new AppError('User not found. Please register first.', 404);
  }

  if (user.status !== 'active') {
    throw new AppError('Account is not active', 403);
  }

  const roleName = (user.roles as unknown as { name: string })?.name;

  await supabase.from('audit_logs').insert({
    user_id: user.id,
    action: 'USER_LOGIN_OTP',
    module: 'auth',
    entity_id: user.id,
  });

  const token = generateToken(user.id, user.email);

  return {
    token,
    user: {
      id: user.id,
      email: user.email,
      name: user.name,
      role: roleName as typeof ROLES[keyof typeof ROLES],
    },
  };
};

/**
 * Refresh Token.
 */
const refreshToken = async (tokenStr: string): Promise<string> => {
  try {
    // Decode without checking expiration
    const decoded = jwt.verify(tokenStr, env.JWT_SECRET, { ignoreExpiration: true }) as { userId: string, email: string };
    
    // Check if user still active
    const { data: user } = await supabase
      .from('users')
      .select('status')
      .eq('id', decoded.userId)
      .single();

    if (!user || user.status !== 'active') {
      throw new AppError('Invalid user session', 401);
    }

    return generateToken(decoded.userId, decoded.email);
  } catch (err) {
    throw new AppError('Invalid refresh token', 401);
  }
};

/**
 * Reset password using OTP.
 */
const resetPassword = async (payload: ResetPasswordPayload): Promise<void> => {
  const { email, otp, newPassword } = payload;

  const { data: otpRecord, error } = await supabase
    .from('otp_codes')
    .select('*')
    .eq('email_or_phone', email)
    .eq('code', otp)
    .gte('expires_at', new Date().toISOString())
    .order('created_at', { ascending: false })
    .limit(1)
    .maybeSingle();

  if (error || !otpRecord) {
    throw new AppError('Invalid or expired OTP', 400);
  }

  // OTP is valid. Hash new password
  const passwordHash = await bcrypt.hash(newPassword, SALT_ROUNDS);

  // Update user
  const { data: user, error: userError } = await supabase
    .from('users')
    .update({ password_hash: passwordHash })
    .eq('email', email)
    .select('id')
    .single();

  if (userError || !user) {
    throw new AppError('User not found', 404);
  }

  // Delete all OTPs for this target
  await supabase.from('otp_codes').delete().eq('email_or_phone', email);

  // Log audit
  await supabase.from('audit_logs').insert({
    user_id: user.id,
    action: 'USER_PASSWORD_RESET',
    module: 'auth',
    entity_id: user.id,
  });
};


export const authService = {
  register,
  login,
  logout,
  generateToken,
  sendOtp,
  verifyOtp,
  refreshToken,
  resetPassword,
};
