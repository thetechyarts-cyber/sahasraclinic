'use client';

import { ProtectedRoute } from '@/components/shared/protected-route';
import { DashboardShell } from '@/components/shared/dashboard-shell';
import { ROLES } from '@/constants';
import { useAuth } from '@/providers/auth-provider';

const adminLinks = [
  { href: '/admin/dashboard', label: 'Dashboard', icon: '📊' },
  { href: '/admin/patients', label: 'Patients', icon: '👥', permission: 'view_patients' },
  { href: '/admin/queue', label: 'Queue', icon: '📋', permission: 'manage_queue' },
  { href: '/admin/payments', label: 'Payments', icon: '💳', permission: 'view_payments' },
  { href: '/admin/reports', label: 'Reports', icon: '📈', permission: 'view_reports' },
];

const superAdminLinks = [
  { href: '/admin/staff', label: 'Staff Management', icon: '🧑‍⚕️' },
  { href: '/admin/roles', label: 'Roles & Permissions', icon: '🛡️' },
  { href: '/admin/audit', label: 'Audit Logs', icon: '🔍' },
  { href: '/admin/cms', label: 'Website CMS', icon: '🌐' },
  { href: '/admin/settings', label: 'System Settings', icon: '⚙️' },
];

export default function AdminLayout({ children }: { children: React.ReactNode }): JSX.Element {
  const { user } = useAuth();
  const isSuperAdmin = user?.roles?.name === 'super_admin';
  
  const links = isSuperAdmin ? [...adminLinks, ...superAdminLinks] : adminLinks;

  return (
    <ProtectedRoute allowedRoles={[ROLES.ADMIN, ROLES.SUPER_ADMIN]}>
      <DashboardShell title={isSuperAdmin ? "Super Admin Panel" : "Admin Panel"} links={links}>
        {children}
      </DashboardShell>
    </ProtectedRoute>
  );
}
