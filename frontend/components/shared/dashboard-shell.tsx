'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useAuth } from '@/providers/auth-provider';
import { useRole } from '@/hooks/use-role';
import { cn } from '@/lib/utils';

interface SidebarLink {
  href: string;
  label: string;
  icon: string;
  permission?: string;
}

interface DashboardShellProps {
  children: React.ReactNode;
  title: string;
  links: SidebarLink[];
}

/**
 * Shared dashboard shell with sidebar navigation.
 * Used by all role-based layouts.
 */
export function DashboardShell({ children, title, links }: DashboardShellProps): JSX.Element {
  const { user, logout } = useAuth();
  const { hasPermission } = useRole();
  const pathname = usePathname();

  const filteredLinks = links.filter(
    (link) => !link.permission || hasPermission(link.permission),
  );

  return (
    <div className="flex h-screen bg-slate-950 text-slate-100">
      {/* Sidebar */}
      <aside className="flex w-64 flex-col border-r border-slate-800 bg-slate-900/50 backdrop-blur-xl">
        {/* Logo */}
        <div className="flex h-16 items-center gap-3 border-b border-slate-800 px-6">
          <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-gradient-to-br from-emerald-400 to-cyan-400">
            <span className="text-sm font-bold text-slate-900">H</span>
          </div>
          <span className="text-lg font-semibold bg-gradient-to-r from-emerald-400 to-cyan-400 bg-clip-text text-transparent">
            HMS
          </span>
        </div>

        {/* Role badge */}
        <div className="border-b border-slate-800 px-6 py-3">
          <p className="text-xs text-slate-500 uppercase tracking-wider">{title}</p>
        </div>

        {/* Nav links */}
        <nav className="flex-1 overflow-y-auto px-3 py-4">
          <ul className="space-y-1">
            {filteredLinks.map((link) => {
              const isActive = pathname === link.href;
              return (
                <li key={link.href}>
                  <Link
                    href={link.href}
                    className={cn(
                      'flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium transition-all duration-200',
                      isActive
                        ? 'bg-emerald-500/10 text-emerald-400 shadow-sm shadow-emerald-500/5'
                        : 'text-slate-400 hover:bg-slate-800/50 hover:text-slate-200',
                    )}
                  >
                    <span className="text-lg">{link.icon}</span>
                    {link.label}
                  </Link>
                </li>
              );
            })}
          </ul>
        </nav>

        {/* User section */}
        <div className="border-t border-slate-800 p-4">
          <div className="flex items-center gap-3">
            <div className="flex h-9 w-9 items-center justify-center rounded-full bg-gradient-to-br from-emerald-400 to-cyan-400 text-sm font-bold text-slate-900">
              {user?.name?.charAt(0)?.toUpperCase() || '?'}
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-sm font-medium text-slate-200 truncate">{user?.name}</p>
              <p className="text-xs text-slate-500 truncate">{user?.email}</p>
            </div>
          </div>
          <button
            onClick={logout}
            className="mt-3 w-full rounded-lg border border-slate-700 px-3 py-2 text-xs font-medium text-slate-400 transition-colors hover:border-red-500/50 hover:text-red-400"
          >
            Sign Out
          </button>
        </div>
      </aside>

      {/* Main content */}
      <main className="flex-1 overflow-y-auto">
        <div className="p-8">{children}</div>
      </main>
    </div>
  );
}
