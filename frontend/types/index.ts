// ─── Auth Types ─────────────────────────────────────────────────

export type RoleName = 'super_admin' | 'admin' | 'doctor' | 'pharmacist' | 'patient';

export interface AuthUser {
  id: string;
  email: string;
  name: string;
  role: RoleName;
}

export interface LoginResponse {
  token: string;
  user: AuthUser;
}

export interface RegisterPayload {
  name: string;
  email: string;
  password: string;
  phone: string;
  gender: 'male' | 'female' | 'other';
  dob?: string;
  address?: string;
  village?: string;
  birth_place?: string;
}

// ─── Patient Types ──────────────────────────────────────────────

export interface PatientProfile {
  id: string;
  user_id: string;
  registration_id: string;
  gender: string;
  dob: string | null;
  phone: string;
  address: string | null;
  village: string | null;
  birth_place: string | null;
  status: string;
  created_at: string;
  updated_at: string;
  users?: {
    name: string;
    email: string;
  };
}

// ─── Case Sheet Types ───────────────────────────────────────────

export interface CaseSheet {
  id: string;
  patient_id: string;
  type: 'online' | 'offline' | 'female';
  chief_complaint: string | null;
  history: Record<string, unknown> | null;
  vitals: Record<string, unknown> | null;
  status: 'draft' | 'complete';
  created_at: string;
}

// ─── Prescription Types ─────────────────────────────────────────

export interface MedicineEntry {
  name: string;
  dosage: string;
  frequency: string;
  duration: string;
  instructions: string;
}

export interface Prescription {
  id: string;
  consultation_id: string;
  patient_id: string;
  doctor_id: string;
  medicines: MedicineEntry[];
  notes: string | null;
  status: 'created' | 'approved' | 'dispensed';
  created_at: string;
}

// ─── Queue Types ────────────────────────────────────────────────

export interface QueueToken {
  id: string;
  patient_id: string;
  token_number: number;
  date: string;
  status: 'waiting' | 'in_consultation' | 'completed' | 'cancelled';
  called_at: string | null;
}

// ─── API Response Types ─────────────────────────────────────────

export interface ApiResponse<T> {
  success: boolean;
  data: T;
  message?: string;
}

export interface ApiErrorResponse {
  success: false;
  error: string;
  details?: unknown[];
}

export interface PaginatedData<T> {
  items: T[];
  total: number;
  page: number;
  limit: number;
  hasMore: boolean;
}
