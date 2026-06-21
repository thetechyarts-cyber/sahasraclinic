'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { api } from '@/lib/api-client';
import { useAuth } from '@/providers/auth-provider';
import { formatDistanceToNow } from 'date-fns';

interface QueueToken {
  id: string;
  patient_id: string; // added patient_id
  token_number: number;
  status: 'waiting' | 'in_consultation' | 'completed' | 'cancelled';
  patient_profiles: {
    id: string; // added id
    registration_id: string;
    users: {
      name: string;
    };
  };
  billing?: {
    case_sheets?: {
      type: string;
    };
  };
  created_at: string;
}

export default function QueueManagementPage() {
  const router = useRouter();
  const { user } = useAuth();
  const [liveQueue, setLiveQueue] = useState<{
    currently_serving: QueueToken | null;
    waiting_list: QueueToken[];
    total_waiting: number;
  } | null>(null);
  const [loading, setLoading] = useState(true);

  const fetchLiveQueue = async () => {
    if (!user) return;
    try {
      const { data } = await api.get(`/queue/live?doctor_id=${user.id}`);
      setLiveQueue(data.data);
    } catch (err) {
      console.error('Failed to fetch live queue', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (user) {
      fetchLiveQueue();
      const interval = setInterval(fetchLiveQueue, 10000);
      return () => clearInterval(interval);
    }
  }, [user]);

  const updateStatus = async (id: string, newStatus: string) => {
    try {
      await api.put(`/queue/tokens/${id}/status`, { status: newStatus });
      if (newStatus !== 'in_consultation') {
        fetchLiveQueue();
      }
    } catch (err) {
      console.error('Failed to update status', err);
      alert('Failed to update token status');
      throw err;
    }
  };

  const startConsultation = async (token: QueueToken) => {
    try {
      await updateStatus(token.id, 'in_consultation');
      // Create or get existing consultation
      const { data } = await api.post('/consultations', {
        patient_id: token.patient_id || token.patient_profiles?.id,
        queue_token_id: token.id,
      });
      router.push(`/doctor/consultations/${data.data.id}`);
    } catch (err) {
      console.error('Failed to start consultation', err);
      alert('Failed to start consultation. Please try again.');
    }
  };

  const handleCallNext = async () => {
    if (liveQueue?.currently_serving) {
      await updateStatus(liveQueue.currently_serving.id, 'completed');
    }
    
    if (liveQueue?.waiting_list && liveQueue.waiting_list.length > 0) {
      const nextToken = liveQueue.waiting_list[0];
      await startConsultation(nextToken);
    }
  };

  if (loading) return <div className="p-8 text-white">Loading queue...</div>;

  return (
    <div className="p-8">
      <div className="mb-8 flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-white">Queue Management</h1>
          <p className="mt-2 text-slate-400">Manage today&apos;s active tokens</p>
        </div>
        <div className="flex gap-4">
          <button 
            onClick={fetchLiveQueue}
            className="rounded-lg border border-slate-700 bg-slate-800 px-4 py-2 text-sm font-semibold text-white transition-colors hover:bg-slate-700">
            Refresh
          </button>
          <button 
            onClick={handleCallNext}
            disabled={!liveQueue?.waiting_list.length && !liveQueue?.currently_serving}
            className="rounded-lg bg-emerald-500 px-6 py-2 text-sm font-semibold text-white shadow-lg shadow-emerald-500/25 transition-all hover:bg-emerald-400 disabled:opacity-50">
            Call Next Patient
          </button>
        </div>
      </div>

      <div className="grid gap-8 lg:grid-cols-3">
        {/* Currently Serving */}
        <div className="lg:col-span-1 space-y-6">
          <div className="rounded-xl border border-emerald-500/30 bg-emerald-500/5 p-6 backdrop-blur-sm text-center">
            <h2 className="text-sm font-bold uppercase tracking-widest text-emerald-400 mb-2">Currently Serving</h2>
            {liveQueue?.currently_serving ? (
              <>
                <div className="text-7xl font-mono font-bold text-white my-6">
                  {String(liveQueue.currently_serving.token_number).padStart(3, '0')}
                </div>
                <div className="text-lg font-medium text-slate-200">
                  {liveQueue.currently_serving.patient_profiles?.users?.name}
                </div>
                <div className="text-sm text-slate-400 mt-1">
                  Reg ID: {liveQueue.currently_serving.patient_profiles?.registration_id}
                </div>
                <div className="mt-6 flex justify-center gap-3">
                  <button 
                    onClick={() => updateStatus(liveQueue.currently_serving!.id, 'completed')}
                    className="px-4 py-2 bg-emerald-500/20 text-emerald-400 hover:bg-emerald-500/30 rounded-lg text-sm font-medium transition-colors">
                    Mark Completed
                  </button>
                </div>
              </>
            ) : (
              <div className="py-12 text-slate-500">
                No patient currently in consultation.
              </div>
            )}
          </div>

          <div className="rounded-xl border border-slate-800 bg-slate-900/50 p-6 backdrop-blur-sm">
            <h2 className="text-sm font-bold uppercase tracking-widest text-slate-400 mb-2">Queue Stats</h2>
            <div className="flex justify-between items-center py-3 border-b border-slate-800">
              <span className="text-slate-300">Total Waiting</span>
              <span className="font-mono text-xl text-white">{liveQueue?.total_waiting || 0}</span>
            </div>
            {/* Can add more stats here in the future */}
          </div>
        </div>

        {/* Waiting List */}
        <div className="lg:col-span-2 rounded-xl border border-slate-800 bg-slate-900/50 backdrop-blur-sm overflow-hidden">
          <div className="bg-slate-800/50 px-6 py-4 border-b border-slate-800">
            <h2 className="font-semibold text-white">Waiting List</h2>
          </div>
          <div className="divide-y divide-slate-800">
            {liveQueue?.waiting_list && liveQueue.waiting_list.length > 0 ? (
              liveQueue.waiting_list.map((token, index) => (
                <div key={token.id} className="flex items-center justify-between px-6 py-4 transition-colors hover:bg-slate-800/25">
                  <div className="flex items-center gap-6">
                    <div className="flex h-12 w-12 items-center justify-center rounded-lg bg-slate-800 font-mono text-lg font-bold text-white">
                      {String(token.token_number).padStart(3, '0')}
                    </div>
                    <div>
                      <div className="font-medium text-white flex items-center gap-2">
                        {token.patient_profiles?.users?.name}
                        <span className="text-[10px] uppercase tracking-wider bg-slate-800 px-2 py-0.5 rounded-full text-slate-300">
                          {token.billing?.case_sheets?.type || 'Standard'}
                        </span>
                      </div>
                      <div className="text-sm text-slate-400 flex items-center gap-4 mt-1">
                        <span>Reg: {token.patient_profiles?.registration_id}</span>
                        <span className="flex items-center gap-1">
                          <span className="h-1.5 w-1.5 rounded-full bg-emerald-500"></span>
                          Waiting for {formatDistanceToNow(new Date(token.created_at))}
                        </span>
                      </div>
                    </div>
                  </div>
                  <div className="flex items-center gap-3">
                    {index === 0 && !liveQueue.currently_serving && (
                      <button 
                        onClick={() => startConsultation(token)}
                        className="text-sm font-medium text-emerald-400 hover:text-emerald-300">
                        Call Now
                      </button>
                    )}
                    <button 
                      onClick={() => updateStatus(token.id, 'cancelled')}
                      className="text-sm font-medium text-red-400 hover:text-red-300">
                      Cancel
                    </button>
                  </div>
                </div>
              ))
            ) : (
              <div className="p-8 text-center text-slate-500">
                The waiting list is empty.
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
