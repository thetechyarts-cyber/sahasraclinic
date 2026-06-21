'use client';

import { ProtectedRoute } from '@/components/shared/protected-route';
import { DashboardShell } from '@/components/shared/dashboard-shell';
import { ROLES } from '@/constants';

const doctorLinks = [
  { href: '/doctor/dashboard', label: 'Dashboard', icon: '📊' },
  { href: '/doctor/queue', label: 'My Queue', icon: '📋', permission: 'view_queue' },
  { href: '/doctor/consultations', label: 'Consultation', icon: '🩺', permission: 'create_consultation' },
  { href: '/doctor/prescriptions', label: 'Prescriptions', icon: '💊', permission: 'create_prescription' },
];

export default function DoctorLayout({ children }: { children: React.ReactNode }): JSX.Element {
  return (
    <ProtectedRoute allowedRoles={[ROLES.DOCTOR]}>
      <DashboardShell title="Doctor Panel" links={doctorLinks}>
        {children}
      </DashboardShell>
    </ProtectedRoute>
  );
}
