'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { api } from '@/lib/api-client';
import { useAuth } from '@/providers/auth-provider';

interface QueueToken {
  id: string;
  token_number: number;
  status: 'waiting' | 'in_consultation' | 'completed' | 'cancelled';
  date: string;
  patients_ahead?: number;
}

export default function PatientDashboard(): JSX.Element {
  const { user } = useAuth();
  const [tokens, setTokens] = useState<QueueToken[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchTokens = async () => {
    if (!user) return;
    try {
      const { data } = await api.get(`/queue/patients/${user.id}/tokens`);
      setTokens(data.data);
    } catch (err) {
      console.error('Failed to fetch tokens', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchTokens();
    const interval = setInterval(fetchTokens, 10000); // Poll every 10s
    return () => clearInterval(interval);
  }, [user]);

  const generateToken = async () => {
    if (!user) return;
    try {
      await api.post('/queue/tokens', { patient_id: user.id });
      fetchTokens();
    } catch (err: any) {
      alert(err.response?.data?.error || 'Failed to generate token');
    }
  };

  const activeToken = tokens.find(t => t.status === 'waiting' || t.status === 'in_consultation');

  return (
    <div>
      <div className="mb-8">
        <h1 className="text-3xl font-bold bg-gradient-to-r from-emerald-400 to-cyan-400 bg-clip-text text-transparent">
          Patient Dashboard
        </h1>
        <p className="mt-2 text-slate-400">Your health records and appointments</p>
      </div>

      <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
        {/* Queue Status Card */}
        <div className="rounded-xl border border-slate-800 bg-slate-900/50 p-6 backdrop-blur-sm relative overflow-hidden">
          <div className="absolute top-0 right-0 p-4">
            <span className="flex h-3 w-3">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
              <span className="relative inline-flex rounded-full h-3 w-3 bg-emerald-500"></span>
            </span>
          </div>
          
          <h2 className="text-lg font-semibold text-white mb-6 border-b border-slate-800 pb-2">Today's Token</h2>
          
          {loading ? (
            <div className="text-slate-500 animate-pulse">Checking status...</div>
          ) : activeToken ? (
            <div className="text-center py-4">
              <div className="text-sm text-slate-400 uppercase tracking-widest mb-2">Token Number</div>
              <div className="text-6xl font-mono font-bold text-white mb-4">
                {String(activeToken.token_number).padStart(3, '0')}
              </div>
              <span className={`inline-flex items-center rounded-full border px-3 py-1 text-xs font-semibold uppercase tracking-wider ${
                activeToken.status === 'in_consultation' 
                  ? 'border-emerald-500/20 bg-emerald-500/10 text-emerald-400 animate-pulse'
                  : 'border-amber-500/20 bg-amber-500/10 text-amber-400'
              }`}>
                {activeToken.status.replace('_', ' ')}
              </span>
              
              {activeToken.status === 'waiting' && activeToken.patients_ahead !== undefined && (
                <div className="mt-6 text-sm text-slate-300">
                  Patients ahead of you: <span className="font-bold text-amber-400 text-lg">{activeToken.patients_ahead}</span>
                </div>
              )}
            </div>
          ) : (
            <div className="text-center py-6">
              <p className="text-slate-400 mb-6">You don't have an active token for today.</p>
              <button 
                onClick={generateToken}
                className="rounded-lg bg-emerald-500 px-6 py-2.5 text-sm font-semibold text-white shadow-lg shadow-emerald-500/25 transition-all hover:bg-emerald-400">
                Generate Token Now
              </button>
            </div>
          )}
        </div>

        <div className="flex flex-col gap-6">
          <div className="rounded-xl border border-slate-800 bg-slate-900/50 p-6 backdrop-blur-sm">
            <h2 className="text-lg font-semibold text-white mb-2">Case Sheets</h2>
            <p className="text-sm text-slate-400 mb-4">Fill out your health complaints before the doctor calls you.</p>
            <Link href="/patient/case-sheets/new" className="text-sm font-medium text-emerald-400 hover:text-emerald-300">
              Submit New Case Sheet &rarr;
            </Link>
          </div>

          <div className="rounded-xl border border-slate-800 bg-slate-900/50 p-6 backdrop-blur-sm flex-1">
            <h2 className="text-lg font-semibold text-white">Your Prescriptions</h2>
            <p className="mt-4 text-sm text-slate-500">Prescriptions will appear here after Phase 5.</p>
          </div>
        </div>
      </div>
    </div>
  );
}
