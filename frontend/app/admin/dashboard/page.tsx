'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { api } from '@/lib/api-client';

export default function AdminDashboard(): JSX.Element {
  const [stats, setStats] = useState({
    totalPatients: 0,
    pendingPayments: 0,
    totalRevenue: 0,
    totalConsultations: 0,
    avgWaitTimeMins: 0,
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchStats = async () => {
      try {
        const today = new Date().toISOString().split('T')[0];
        const { data } = await api.get('/reports/dashboard', {
          params: { startDate: today, endDate: today + 'T23:59:59.999Z' }
        });
        setStats(data.data);
      } catch (err) {
        console.error('Failed to fetch dashboard stats', err);
      } finally {
        setLoading(false);
      }
    };
    fetchStats();
    
    // Auto refresh every minute
    const interval = setInterval(fetchStats, 60000);
    return () => clearInterval(interval);
  }, []);

  return (
    <div>
      <div className="mb-8">
        <h1 className="text-3xl font-bold bg-gradient-to-r from-emerald-400 to-cyan-400 bg-clip-text text-transparent">
          Admin Dashboard
        </h1>
        <p className="mt-2 text-slate-400">Today's Clinic Overview</p>
      </div>

      {loading ? (
        <div className="text-white">Loading stats...</div>
      ) : (
        <div className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-4">
          {[
            { label: 'Patients Registered Today', value: stats.totalPatients, icon: '👥', color: 'from-emerald-500 to-emerald-600' },
            { label: 'Pending Payments', value: stats.pendingPayments, icon: '💳', color: 'from-amber-500 to-amber-600' },
            { label: 'Revenue Today', value: `₹${stats.totalRevenue.toLocaleString()}`, icon: '💰', color: 'from-cyan-500 to-cyan-600' },
            { label: 'Consultations Today', value: stats.totalConsultations, icon: '🩺', color: 'from-violet-500 to-violet-600' },
          ].map((stat) => (
            <div key={stat.label} className="rounded-xl border border-slate-800 bg-slate-900/50 p-6 backdrop-blur-sm">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-slate-400">{stat.label}</p>
                  <p className="mt-2 text-3xl font-bold text-white">{stat.value}</p>
                </div>
                <div className={`flex h-12 w-12 items-center justify-center rounded-xl bg-gradient-to-br ${stat.color} text-xl shadow-lg`}>
                  {stat.icon}
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Quick Action Buttons */}
      <div className="mt-8 grid gap-6 md:grid-cols-3">
        <Link 
          href="/admin/case-sheets/new"
          className="flex flex-col items-center justify-center rounded-xl border border-slate-700 bg-slate-800/50 p-6 transition-all hover:bg-slate-800 hover:border-emerald-500/50 group"
        >
          <div className="rounded-full bg-emerald-500/20 p-3 text-emerald-400 mb-3 group-hover:bg-emerald-500/30 group-hover:scale-110 transition-all">
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M18 9v3m0 0v3m0-3h3m-3 0h-3m-2-5a4 4 0 11-8 0 4 4 0 018 0zM3 20a6 6 0 0112 0v1H3v-1z" /></svg>
          </div>
          <h3 className="font-bold text-white">Register Patient</h3>
        </Link>
        <Link 
          href="/admin/queue"
          className="flex flex-col items-center justify-center rounded-xl border border-slate-700 bg-slate-800/50 p-6 transition-all hover:bg-slate-800 hover:border-cyan-500/50 group"
        >
          <div className="rounded-full bg-cyan-500/20 p-3 text-cyan-400 mb-3 group-hover:bg-cyan-500/30 group-hover:scale-110 transition-all">
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 6h16M4 10h16M4 14h16M4 18h16" /></svg>
          </div>
          <h3 className="font-bold text-white">View Queue</h3>
        </Link>
        <Link 
          href="/admin/payments"
          className="flex flex-col items-center justify-center rounded-xl border border-slate-700 bg-slate-800/50 p-6 transition-all hover:bg-slate-800 hover:border-amber-500/50 group"
        >
          <div className="rounded-full bg-amber-500/20 p-3 text-amber-400 mb-3 group-hover:bg-amber-500/30 group-hover:scale-110 transition-all">
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M3 10h18M7 15h1m4 0h1m-7 4h12a3 3 0 003-3V8a3 3 0 00-3-3H6a3 3 0 00-3 3v8a3 3 0 003 3z" /></svg>
          </div>
          <h3 className="font-bold text-white">Pending Payments</h3>
        </Link>
      </div>
    </div>
  );
}
