'use client';

import { useAuth } from '@/providers/auth-provider';
import { RoleName, ROLES } from '@/constants';

interface UseRoleReturn {
  role: RoleName | null;
  isSuper: boolean;
  isAdmin: boolean;
  isDoctor: boolean;
  isPharmacist: boolean;
  isPatient: boolean;
  hasRole: (...roles: RoleName[]) => boolean;
  hasPermission: (permission: string) => boolean;
}

/**
 * Hook to check the current user's role.
 * Per CODING-RULES.md: Never trust role from localStorage —
 * always derive from auth context (JWT / Supabase session).
 */
export function useRole(): UseRoleReturn {
  const { user } = useAuth();
  const role = user?.role ?? null;

  const isSuper = role === ROLES.SUPER_ADMIN;
  const isAdmin = role === ROLES.ADMIN;
  const isDoctor = role === ROLES.DOCTOR;
  const isPharmacist = role === ROLES.PHARMACIST;
  const isPatient = role === ROLES.PATIENT;

  const hasRole = (...roles: RoleName[]): boolean => {
    if (!role) return false;
    return roles.includes(role);
  };

  // Simplified permission check based on role
  // Full permission check would use the permissions table
  const hasPermission = (permission: string): boolean => {
    if (!role) return false;

    const rolePermissions: Record<RoleName, string[]> = {
      [ROLES.SUPER_ADMIN]: ['*'], // All permissions
      [ROLES.ADMIN]: [
        'manage_users', 'create_patient', 'view_patients', 'update_patient',
        'reactivate_patient', 'create_case_sheet', 'view_case_sheet',
        'update_case_sheet', 'view_consultation', 'view_prescriptions',
        'approve_prescription', 'manage_queue', 'view_queue',
        'mark_payment_paid', 'view_payments', 'manage_cms',
        'manage_billing', 'view_billing', 'view_audit_logs', 'view_reports',
      ],
      [ROLES.DOCTOR]: [
        'view_patients', 'reactivate_patient', 'view_case_sheet',
        'create_consultation', 'view_consultation', 'update_consultation',
        'create_prescription', 'view_prescriptions', 'approve_prescription',
        'approve_prescription_request', 'view_queue',
        'create_prognosis', 'view_prognosis',
      ],
      [ROLES.PHARMACIST]: ['view_today_prescriptions', 'dispense_medicine'],
      [ROLES.PATIENT]: [
        'create_case_sheet', 'view_case_sheet', 'request_prescription_copy',
        'view_prescriptions', 'create_payment', 'view_billing',
        'upload_documents', 'view_documents',
      ],
    };

    const perms = rolePermissions[role];
    if (!perms) return false;
    if (perms.includes('*')) return true;
    return perms.includes(permission);
  };

  return {
    role,
    isSuper,
    isAdmin,
    isDoctor,
    isPharmacist,
    isPatient,
    hasRole,
    hasPermission,
  };
}
