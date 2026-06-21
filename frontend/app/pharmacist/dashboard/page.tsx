'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { api } from '@/lib/api-client';

export default function PharmacistDashboard() {
  const [stats, setStats] = useState({
    totalApproved: 0,
    dispensedToday: 0,
    pendingDispense: 0,
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchStats = async () => {
      try {
        const { data } = await api.get('/reports/pharmacist/dashboard');
        setStats(data.data);
      } catch (err) {
        console.error('Failed to fetch dashboard stats', err);
      } finally {
        setLoading(false);
      }
    };
    fetchStats();
    
    // Refresh stats every minute
    const interval = setInterval(fetchStats, 60000);
    return () => clearInterval(interval);
  }, []);

  if (loading) return <div className="p-8 text-white">Loading dashboard...</div>;

  return (
    <div className="p-8 max-w-6xl mx-auto">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-white">Pharmacist Dashboard</h1>
        <p className="mt-2 text-slate-400">Overview of today's pharmacy operations</p>
      </div>

      <div className="grid gap-6 md:grid-cols-3 mb-8">
        <div className="rounded-xl border border-emerald-500/20 bg-emerald-500/10 p-6">
          <p className="text-sm font-medium text-emerald-400 uppercase tracking-wider">Pending Dispense</p>
          <p className="mt-2 text-4xl font-bold text-white">{stats.pendingDispense}</p>
        </div>
        <div className="rounded-xl border border-indigo-500/20 bg-indigo-500/10 p-6">
          <p className="text-sm font-medium text-indigo-400 uppercase tracking-wider">Dispensed Today</p>
          <p className="mt-2 text-4xl font-bold text-white">{stats.dispensedToday}</p>
        </div>
        <div className="rounded-xl border border-slate-700 bg-slate-800/50 p-6">
          <p className="text-sm font-medium text-slate-400 uppercase tracking-wider">Total Approved Today</p>
          <p className="mt-2 text-4xl font-bold text-white">{stats.totalApproved}</p>
        </div>
      </div>

      <div className="grid gap-6 md:grid-cols-2">
        <Link 
          href="/pharmacist/prescriptions"
          className="flex flex-col items-center justify-center rounded-xl border border-slate-700 bg-slate-800/50 p-8 transition-all hover:bg-slate-800 hover:border-emerald-500/50 group"
        >
          <div className="rounded-full bg-emerald-500/20 p-4 text-emerald-400 mb-4 group-hover:bg-emerald-500/30 group-hover:scale-110 transition-all">
            <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 002-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" />
            </svg>
          </div>
          <h3 className="text-xl font-bold text-white mb-2">Today's Prescriptions</h3>
          <p className="text-sm text-slate-400 text-center">View and dispense approved medicines for waiting patients.</p>
        </Link>

        <Link 
          href="/pharmacist/history"
          className="flex flex-col items-center justify-center rounded-xl border border-slate-700 bg-slate-800/50 p-8 transition-all hover:bg-slate-800 hover:border-indigo-500/50 group"
        >
          <div className="rounded-full bg-indigo-500/20 p-4 text-indigo-400 mb-4 group-hover:bg-indigo-500/30 group-hover:scale-110 transition-all">
            <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
          </div>
          <h3 className="text-xl font-bold text-white mb-2">Dispense History</h3>
          <p className="text-sm text-slate-400 text-center">View records of all prescriptions you have dispensed today and previously.</p>
        </Link>
      </div>
    </div>
  );
}
