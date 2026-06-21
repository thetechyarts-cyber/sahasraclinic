'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/providers/auth-provider';
import { useRole } from '@/hooks/use-role';
import { RoleName, ROLE_DASHBOARDS, ROUTES } from '@/constants';

interface ProtectedRouteProps {
  children: React.ReactNode;
  allowedRoles: RoleName[];
}

/**
 * Protected route wrapper — redirects unauthorized users.
 * Per CODING-RULES.md: If role check fails → redirect to /unauthorized, not 404.
 */
export function ProtectedRoute({ children, allowedRoles }: ProtectedRouteProps): JSX.Element | null {
  const { user, isLoading } = useAuth();
  const { hasRole } = useRole();
  const router = useRouter();

  useEffect(() => {
    if (isLoading) return;

    if (!user) {
      router.replace(ROUTES.LOGIN);
      return;
    }

    if (!hasRole(...allowedRoles)) {
      router.replace(ROUTES.UNAUTHORIZED);
    }
  }, [user, isLoading, hasRole, allowedRoles, router]);

  if (isLoading) {
    return (
      <div className="flex h-screen items-center justify-center bg-slate-950">
        <div className="flex flex-col items-center gap-4">
          <div className="h-10 w-10 animate-spin rounded-full border-4 border-emerald-500 border-t-transparent" />
          <p className="text-sm text-slate-400">Loading...</p>
        </div>
      </div>
    );
  }

  if (!user || !hasRole(...allowedRoles)) {
    return null;
  }

  return <>{children}</>;
}
