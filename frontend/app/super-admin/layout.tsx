'use client';

import { ProtectedRoute } from '@/components/shared/protected-route';
import { DashboardShell } from '@/components/shared/dashboard-shell';
import { ROLES } from '@/constants';

const superAdminLinks = [
  { href: '/super-admin/dashboard', label: 'Dashboard', icon: '📊' },
  { href: '/super-admin/users', label: 'Users & Roles', icon: '👤', permission: 'manage_users' },
  { href: '/super-admin/cms', label: 'CMS', icon: '📄', permission: 'manage_cms' },
  { href: '/admin/patients', label: 'Patients', icon: '👥' },
];

export default function SuperAdminLayout({ children }: { children: React.ReactNode }): JSX.Element {
  return (
    <ProtectedRoute allowedRoles={[ROLES.SUPER_ADMIN]}>
      <DashboardShell title="Super Admin" links={superAdminLinks}>
        {children}
      </DashboardShell>
    </ProtectedRoute>
  );
}
