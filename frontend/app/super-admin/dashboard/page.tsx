'use client';

import { useEffect, useState } from 'react';
import { api } from '@/lib/api-client';

export default function SuperAdminDashboard(): JSX.Element {
  const [stats, setStats] = useState({
    users: '—',
    roles: '—',
    audits: '—'
  });

  useEffect(() => {
    const fetchStats = async () => {
      try {
        const [usersRes, rolesRes, auditsRes] = await Promise.all([
          api.get('/users'),
          api.get('/roles'),
          api.get('/audit-logs?limit=500') // fetch a chunk to count today's
        ]);

        const usersCount = usersRes.data.data?.length || 0;
        const rolesCount = rolesRes.data.data?.length || 0;
        
        // Count audits from today
        const todayStr = new Date().toISOString().split('T')[0];
        const auditsToday = (auditsRes.data.data?.items || []).filter((log: any) => 
          log.created_at.startsWith(todayStr)
        ).length;

        setStats({
          users: usersCount.toString(),
          roles: rolesCount.toString(),
          audits: auditsToday.toString()
        });
      } catch (err) {
        console.error('Failed to load dashboard stats', err);
      }
    };

    fetchStats();
  }, []);

  return (
    <div>
      <div className="mb-8">
        <h1 className="text-3xl font-bold bg-gradient-to-r from-emerald-400 to-cyan-400 bg-clip-text text-transparent">
          Super Admin Dashboard
        </h1>
        <p className="mt-2 text-slate-400">System-wide management and configuration</p>
      </div>
      <div className="grid grid-cols-1 gap-6 md:grid-cols-3">
        {[
          { label: 'Total Users', value: stats.users, icon: '👤' },
          { label: 'Active Roles', value: stats.roles, icon: '🔐' },
          { label: 'Audit Events Today', value: stats.audits, icon: '📜' },
        ].map((stat) => (
          <div key={stat.label} className="rounded-xl border border-slate-800 bg-slate-900/50 p-6 shadow-sm hover:border-slate-700 transition-colors">
            <p className="text-sm text-slate-400">{stat.label}</p>
            <div className="mt-2 flex items-center gap-3">
              <span className="text-2xl">{stat.icon}</span>
              <span className="text-3xl font-bold text-white">{stat.value}</span>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
