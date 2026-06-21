'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { api } from '@/lib/api-client';
import { format } from 'date-fns';
import { useAuth } from '@/providers/auth-provider';

export default function DoctorDashboard(): JSX.Element {
  const { user } = useAuth();
  const [stats, setStats] = useState({
    queueWaiting: 0,
    consultationsCompleted: 0,
    prescriptionRequestsPending: 0,
    followupsDue: 0,
  });

  useEffect(() => {
    const fetchStats = async () => {
      try {
        const { data } = await api.get('/reports/doctor/dashboard');
        setStats(data.data);
      } catch (err) {
        console.error('Failed to load dashboard stats', err);
      }
    };
    fetchStats();
  }, []);

  return (
    <div>
      <div className="mb-8 flex flex-col sm:flex-row sm:items-end justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold bg-gradient-to-r from-emerald-400 to-cyan-400 bg-clip-text text-transparent">
            Welcome, Dr. {user?.name?.split(' ')[0] || 'Doctor'}
          </h1>
          <p className="mt-2 text-slate-400">{format(new Date(), 'EEEE, MMMM do, yyyy')}</p>
        </div>
        <div className="flex gap-4">
          <Link href="/doctor/queue" className="rounded-lg bg-emerald-500 px-6 py-2.5 text-sm font-semibold text-white shadow-lg shadow-emerald-500/25 transition-all hover:bg-emerald-400">
            View Live Queue
          </Link>
          <Link href="/doctor/prescription-requests" className="rounded-lg border border-slate-700 bg-slate-800 px-6 py-2.5 text-sm font-semibold text-white transition-colors hover:bg-slate-700">
            Pending Requests
          </Link>
        </div>
      </div>
      
      <div className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-4">
        {[
          { label: 'Waiting in Queue', value: stats.queueWaiting, icon: '📋' },
          { label: 'Consultations Completed', value: stats.consultationsCompleted, icon: '🩺' },
          { label: 'Pending Requests', value: stats.prescriptionRequestsPending, icon: '📩' },
          { label: 'Follow-ups Due Today', value: stats.followupsDue, icon: '📅' },
        ].map((stat) => (
          <div key={stat.label} className="rounded-xl border border-slate-800 bg-slate-900/50 p-6">
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
