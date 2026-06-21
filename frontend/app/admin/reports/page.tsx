'use client';

import { useEffect, useState } from 'react';
import { api } from '@/lib/api-client';
import { ApiResponse } from '@/types';
import { BarChart3, Users, IndianRupee, Clock, RefreshCw } from 'lucide-react';

interface DashboardStats {
  totalPatients: number;
  totalRevenue: number;
  totalConsultations: number;
  avgWaitTimeMins: number;
}

export default function ReportsPage() {
  const [stats, setStats] = useState<DashboardStats | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [period, setPeriod] = useState('30'); // days

  const fetchStats = async () => {
    try {
      setLoading(true);
      setError('');
      
      const endDate = new Date().toISOString();
      const startDate = new Date(Date.now() - parseInt(period) * 24 * 60 * 60 * 1000).toISOString();
      
      const { data: response } = await api.get<ApiResponse<DashboardStats>>('/reports/dashboard', {
        params: { startDate, endDate }
      });
      
      if (response.success) {
        setStats(response.data);
      } else {
        throw new Error(response.message || 'Failed to load reports');
      }
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : 'Unknown error';
      setError(message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchStats();
  }, [period]);

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-white flex items-center gap-2">
            <BarChart3 className="h-6 w-6 text-emerald-400" />
            Reports & Analytics
          </h1>
          <p className="text-slate-400 mt-1">Overview of hospital performance</p>
        </div>
        
        <div className="flex items-center gap-4">
          <select
            value={period}
            onChange={(e) => setPeriod(e.target.value)}
            className="rounded-lg bg-slate-900 border border-slate-800 px-3 py-2 text-sm text-slate-300 focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500 outline-none"
          >
            <option value="7">Last 7 Days</option>
            <option value="30">Last 30 Days</option>
            <option value="90">Last 90 Days</option>
          </select>
          <button
            onClick={fetchStats}
            className="rounded-lg bg-slate-800 p-2 text-slate-400 hover:text-white transition-colors"
          >
            <RefreshCw className={`h-5 w-5 ${loading ? 'animate-spin' : ''}`} />
          </button>
        </div>
      </div>

      {error && (
        <div className="rounded-lg border border-red-500/20 bg-red-500/10 px-4 py-3 text-sm text-red-400">
          {error}
        </div>
      )}

      {loading && !stats ? (
        <div className="py-12 text-center text-slate-500">
          <RefreshCw className="h-6 w-6 animate-spin mx-auto mb-2 text-emerald-500" />
          Loading reports...
        </div>
      ) : stats ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          <StatCard
            title="Total Patients"
            value={stats.totalPatients.toLocaleString()}
            icon={<Users className="h-5 w-5 text-blue-400" />}
            trend={`In last ${period} days`}
            color="bg-blue-500/10 border-blue-500/20"
          />
          <StatCard
            title="Revenue"
            value={`₹${stats.totalRevenue.toLocaleString()}`}
            icon={<IndianRupee className="h-5 w-5 text-emerald-400" />}
            trend={`In last ${period} days`}
            color="bg-emerald-500/10 border-emerald-500/20"
          />
          <StatCard
            title="Consultations"
            value={stats.totalConsultations.toLocaleString()}
            icon={<BarChart3 className="h-5 w-5 text-purple-400" />}
            trend={`In last ${period} days`}
            color="bg-purple-500/10 border-purple-500/20"
          />
          <StatCard
            title="Avg Wait Time"
            value={`${stats.avgWaitTimeMins} mins`}
            icon={<Clock className="h-5 w-5 text-amber-400" />}
            trend={`Queue efficiency`}
            color="bg-amber-500/10 border-amber-500/20"
          />
        </div>
      ) : null}
      
      {/* Additional charts could go here */}
      <div className="mt-8 rounded-xl border border-slate-800 bg-slate-900/50 p-6 flex items-center justify-center min-h-[300px]">
        <p className="text-slate-500 italic">Detailed graphical charts will be added in future updates.</p>
      </div>
    </div>
  );
}

function StatCard({ title, value, icon, trend, color }: { title: string, value: string | number, icon: React.ReactNode, trend: string, color: string }) {
  return (
    <div className={`rounded-xl border bg-slate-900/50 p-6 transition-all hover:bg-slate-900 ${color}`}>
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-sm font-medium text-slate-400">{title}</h3>
        <div className="p-2 bg-slate-950 rounded-lg">
          {icon}
        </div>
      </div>
      <div className="text-3xl font-bold text-white mb-1">{value}</div>
      <p className="text-xs text-slate-500">{trend}</p>
    </div>
  );
}
