// ─── Role Constants ─────────────────────────────────────────────

export const ROLES = {
  SUPER_ADMIN: 'super_admin',
  ADMIN: 'admin',
  DOCTOR: 'doctor',
  PHARMACIST: 'pharmacist',
  PATIENT: 'patient',
} as const;

export type RoleName = (typeof ROLES)[keyof typeof ROLES];

// ─── Status Constants ───────────────────────────────────────────

export const PATIENT_STATUS = {
  ACTIVE: 'active',
  ARCHIVED: 'archived',
} as const;

export const PRESCRIPTION_STATUS = {
  CREATED: 'created',
  APPROVED: 'approved',
  DISPENSED: 'dispensed',
} as const;

export const QUEUE_STATUS = {
  WAITING: 'waiting',
  IN_CONSULTATION: 'in_consultation',
  COMPLETED: 'completed',
  CANCELLED: 'cancelled',
} as const;

export const BILLING_STATUS = {
  PENDING: 'pending',
  PAID: 'paid',
  FAILED: 'failed',
  REFUNDED: 'refunded',
} as const;

// ─── Route Constants ────────────────────────────────────────────

export const ROUTES = {
  LOGIN: '/login',
  REGISTER: '/register',
  OTP: '/otp',
  UNAUTHORIZED: '/unauthorized',
  ADMIN_DASHBOARD: '/admin/dashboard',
  DOCTOR_DASHBOARD: '/doctor/dashboard',
  PHARMACIST_DASHBOARD: '/pharmacist/dashboard',
  PATIENT_DASHBOARD: '/patient/dashboard',
  SUPER_ADMIN_DASHBOARD: '/super-admin/dashboard',
} as const;

// ─── Role → Dashboard Mapping ───────────────────────────────────

export const ROLE_DASHBOARDS: Record<RoleName, string> = {
  [ROLES.SUPER_ADMIN]: ROUTES.SUPER_ADMIN_DASHBOARD,
  [ROLES.ADMIN]: ROUTES.ADMIN_DASHBOARD,
  [ROLES.DOCTOR]: ROUTES.DOCTOR_DASHBOARD,
  [ROLES.PHARMACIST]: ROUTES.PHARMACIST_DASHBOARD,
  [ROLES.PATIENT]: ROUTES.PATIENT_DASHBOARD,
};

// ─── App Constants ──────────────────────────────────────────────

export const MAX_FILE_SIZE_MB = 10;
export const MAX_FILE_SIZE_BYTES = MAX_FILE_SIZE_MB * 1024 * 1024;
export const OTP_EXPIRY_MINUTES = 5;
export const OTP_LENGTH = 6;
export const PAGINATION_DEFAULT_LIMIT = 20;
