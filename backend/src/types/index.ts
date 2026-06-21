// ─── Role & Permission Constants ────────────────────────────────

export const ROLES = {
  SUPER_ADMIN: 'super_admin',
  ADMIN: 'admin',
  DOCTOR: 'doctor',
  PHARMACIST: 'pharmacist',
  PATIENT: 'patient',
} as const;

export type RoleName = (typeof ROLES)[keyof typeof ROLES];

// ─── Status Constants ───────────────────────────────────────────

export const USER_STATUS = {
  ACTIVE: 'active',
  INACTIVE: 'inactive',
  SUSPENDED: 'suspended',
} as const;

export const PATIENT_STATUS = {
  ACTIVE: 'active',
  ARCHIVED: 'archived',
} as const;

export const CASE_SHEET_TYPE = {
  ONLINE: 'online',
  OFFLINE: 'offline',
  FEMALE: 'female',
} as const;

export const CASE_SHEET_STATUS = {
  DRAFT: 'draft',
  COMPLETE: 'complete',
} as const;

export const PRESCRIPTION_STATUS = {
  CREATED: 'created',
  APPROVED: 'approved',
  DISPENSED: 'dispensed',
} as const;

export const PRESCRIPTION_REQUEST_TYPE = {
  COPY: 'copy',
  REFILL: 'refill',
} as const;

export const PRESCRIPTION_REQUEST_STATUS = {
  PENDING: 'pending',
  APPROVED: 'approved',
  REJECTED: 'rejected',
} as const;

export const BILLING_STATUS = {
  PENDING: 'pending',
  PAID: 'paid',
  FAILED: 'failed',
  REFUNDED: 'refunded',
} as const;

export const PAYMENT_STATUS = {
  PENDING: 'pending',
  SUCCESS: 'success',
  FAILED: 'failed',
} as const;

export const QUEUE_STATUS = {
  WAITING: 'waiting',
  IN_CONSULTATION: 'in_consultation',
  COMPLETED: 'completed',
  CANCELLED: 'cancelled',
} as const;

export const CONSULTATION_STATUS = {
  ACTIVE: 'active',
  COMPLETED: 'completed',
} as const;

export const RECOVERY_STATUS = {
  IMPROVING: 'improving',
  STABLE: 'stable',
  DETERIORATING: 'deteriorating',
  RECOVERED: 'recovered',
} as const;

export const MOOD = {
  GOOD: 'good',
  NEUTRAL: 'neutral',
  POOR: 'poor',
} as const;

export const FILE_TYPE = {
  PDF: 'pdf',
  IMAGE: 'image',
  AUDIO: 'audio',
  VIDEO: 'video',
} as const;

export const CMS_STATUS = {
  DRAFT: 'draft',
  PUBLISHED: 'published',
  ARCHIVED: 'archived',
} as const;

// ─── Database Row Types ─────────────────────────────────────────

export interface UserRow {
  id: string;
  email: string;
  password_hash: string;
  name: string;
  role_id: string;
  status: string;
  created_at: string;
  updated_at: string;
}

export interface RoleRow {
  id: string;
  name: RoleName;
  description: string | null;
  created_at: string;
}

export interface PermissionRow {
  id: string;
  name: string;
  module: string;
  created_at: string;
}

export interface PatientProfileRow {
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
  archived_at: string | null;
  created_at: string;
  updated_at: string;
}

export interface CaseSheetRow {
  id: string;
  patient_id: string;
  type: string;
  chief_complaint: string | null;
  history: Record<string, unknown> | null;
  vitals: Record<string, unknown> | null;
  status: string;
  created_by: string;
  created_at: string;
  updated_at: string;
}

export interface PrescriptionRow {
  id: string;
  consultation_id: string;
  patient_id: string;
  doctor_id: string;
  medicines: MedicineEntry[];
  notes: string | null;
  status: string;
  approved_by: string | null;
  approved_at: string | null;
  dispensed_by: string | null;
  dispensed_at: string | null;
  pdf_url: string | null;
  created_at: string;
  updated_at: string;
}

export interface MedicineEntry {
  name: string;
  dosage: string;
  frequency: string;
  duration: string;
  instructions: string;
}

export interface BillingRow {
  id: string;
  patient_id: string;
  case_sheet_id: string | null;
  amount: number;
  mode: string;
  status: string;
  tan_ref: string | null;
  marked_paid_by: string | null;
  marked_paid_at: string | null;
  created_at: string;
  updated_at: string;
}

export interface QueueTokenRow {
  id: string;
  patient_id: string;
  billing_id: string | null;
  token_number: number;
  date: string;
  status: string;
  called_at: string | null;
  completed_at: string | null;
  created_at: string;
  updated_at: string;
}

export interface AuditLogRow {
  id: string;
  user_id: string;
  action: string;
  module: string;
  entity_id: string | null;
  metadata: Record<string, unknown> | null;
  ip: string | null;
  created_at: string;
}

// ─── API Response Types ─────────────────────────────────────────

export interface ApiSuccessResponse<T> {
  success: true;
  data: T;
  message?: string;
}

export interface ApiErrorResponse {
  success: false;
  error: string;
  details?: unknown[];
}

export interface PaginatedResponse<T> {
  items: T[];
  total: number;
  page: number;
  limit: number;
  hasMore: boolean;
}

// ─── Auth Types ─────────────────────────────────────────────────

export interface AuthUser {
  id: string;
  email: string;
  name: string;
  role: RoleName;
  role_id: string;
}

export interface LoginResponse {
  token: string;
  user: Omit<AuthUser, 'role_id'>;
}

export interface RegisterPayload {
  name: string;
  email: string;
  password: string;
  phone: string;
  gender: string;
  dob?: string;
  address?: string;
}
