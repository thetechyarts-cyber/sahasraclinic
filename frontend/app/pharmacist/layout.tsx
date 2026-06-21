'use client';

import { ProtectedRoute } from '@/components/shared/protected-route';
import { DashboardShell } from '@/components/shared/dashboard-shell';
import { ROLES } from '@/constants';

const pharmacistLinks = [
  { href: '/pharmacist/dashboard', label: 'Dashboard', icon: '📊' },
];

export default function PharmacistLayout({ children }: { children: React.ReactNode }): JSX.Element {
  return (
    <ProtectedRoute allowedRoles={[ROLES.PHARMACIST]}>
      <DashboardShell title="Pharmacist Panel" links={pharmacistLinks}>
        {children}
      </DashboardShell>
    </ProtectedRoute>
  );
}
