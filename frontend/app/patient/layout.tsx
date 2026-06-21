'use client';

import { ProtectedRoute } from '@/components/shared/protected-route';
import { DashboardShell } from '@/components/shared/dashboard-shell';
import { ROLES } from '@/constants';

const patientLinks = [
  { href: '/patient/dashboard', label: 'Dashboard', icon: '📊' },
  { href: '/patient/case-sheets/new', label: 'New Case Sheet', icon: '📝', permission: 'create_case_sheet' },
  { href: '/patient/prescriptions', label: 'Prescriptions', icon: '💊', permission: 'view_prescriptions' },
  { href: '/patient/history', label: 'Medical History', icon: '📂' },
];

export default function PatientLayout({ children }: { children: React.ReactNode }): JSX.Element {
  return (
    <ProtectedRoute allowedRoles={[ROLES.PATIENT]}>
      <DashboardShell title="Patient Portal" links={patientLinks}>
        {children}
      </DashboardShell>
    </ProtectedRoute>
  );
}
