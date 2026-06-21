'use client';

import { useState, useEffect } from 'react';
import { api } from '@/lib/api-client';

interface QueueToken {
  id: string;
  token_number: number;
  status: 'waiting' | 'in_consultation' | 'completed' | 'cancelled';
  patient_profiles: {
    registration_id: string;
    users: {
      name: string;
    };
  };
}

export default function LiveQueuePage() {
  const [liveQueue, setLiveQueue] = useState<{
    currently_serving: QueueToken | null;
    waiting_list: QueueToken[];
    total_waiting: number;
  } | null>(null);

  const fetchLiveQueue = async () => {
    try {
      const { data } = await api.get('/queue/live');
      setLiveQueue(data.data);
    } catch (err) {
      console.error('Failed to fetch live queue', err);
    }
  };

  useEffect(() => {
    fetchLiveQueue();
    // Poll every 5 seconds for live TV display
    const interval = setInterval(fetchLiveQueue, 5000);
    return () => clearInterval(interval);
  }, []);

  return (
    <div className="min-h-screen bg-slate-950 p-8 font-sans text-white">
      <div className="mb-12 text-center">
        <h1 className="bg-gradient-to-r from-emerald-400 to-cyan-400 bg-clip-text text-5xl font-extrabold text-transparent drop-shadow-sm">
          Live OPD Queue
        </h1>
        <p className="mt-2 text-xl text-slate-400">Please wait for your token to be called.</p>
      </div>

      <div className="mx-auto max-w-7xl grid gap-12 lg:grid-cols-2">
        {/* Currently Serving */}
        <div className="flex flex-col items-center justify-center rounded-3xl border-2 border-emerald-500/30 bg-emerald-500/10 p-12 shadow-[0_0_50px_rgba(16,185,129,0.1)]">
          <h2 className="mb-4 text-2xl font-bold uppercase tracking-widest text-emerald-400">
            Currently Serving
          </h2>
          
          {liveQueue?.currently_serving ? (
            <div className="text-center">
              <div className="my-8 text-[12rem] leading-none font-black font-mono text-white drop-shadow-[0_0_25px_rgba(255,255,255,0.3)]">
                {String(liveQueue.currently_serving.token_number).padStart(3, '0')}
              </div>
              <div className="text-4xl font-semibold text-slate-200">
                {liveQueue.currently_serving.patient_profiles?.users?.name}
              </div>
            </div>
          ) : (
            <div className="py-24 text-center text-3xl text-slate-500">
              Waiting for next patient...
            </div>
          )}
        </div>

        {/* Next in Line */}
        <div className="rounded-3xl border border-slate-800 bg-slate-900/80 p-10 shadow-2xl">
          <h2 className="mb-8 flex items-center justify-between border-b border-slate-800 pb-4 text-2xl font-bold uppercase tracking-widest text-slate-300">
            <span>Next In Line</span>
            <span className="rounded-full bg-slate-800 px-4 py-1 text-lg text-emerald-400">
              {liveQueue?.total_waiting || 0} Waiting
            </span>
          </h2>

          <div className="space-y-4">
            {liveQueue?.waiting_list && liveQueue.waiting_list.length > 0 ? (
              liveQueue.waiting_list.slice(0, 5).map((token, index) => (
                <div 
                  key={token.id} 
                  className={`flex items-center justify-between rounded-2xl border p-6 transition-all ${
                    index === 0 
                      ? 'border-emerald-500/30 bg-emerald-500/5 shadow-lg shadow-emerald-500/10 scale-105 my-6' 
                      : 'border-slate-800 bg-slate-900/50'
                  }`}
                >
                  <div className="flex items-center gap-8">
                    <div className={`flex items-center justify-center rounded-xl font-mono font-bold ${
                      index === 0 ? 'h-20 w-20 bg-emerald-500 text-4xl text-slate-900' : 'h-16 w-16 bg-slate-800 text-3xl text-white'
                    }`}>
                      {String(token.token_number).padStart(3, '0')}
                    </div>
                    <div className={`${index === 0 ? 'text-3xl text-white font-semibold' : 'text-2xl text-slate-300'}`}>
                      {token.patient_profiles?.users?.name}
                    </div>
                  </div>
                  {index === 0 && (
                    <div className="animate-pulse font-bold tracking-widest text-emerald-400 uppercase">
                      Up Next
                    </div>
                  )}
                </div>
              ))
            ) : (
              <div className="py-12 text-center text-xl text-slate-500">
                No patients waiting.
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
