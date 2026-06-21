'use client';

import { useState, useEffect } from 'react';
import { api } from '@/lib/api-client';

export default function PharmacistPrescriptionsPage() {
  const [prescriptions, setPrescriptions] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchPrescriptions = async () => {
    try {
      const { data } = await api.get('/prescriptions/pharmacist/today');
      setPrescriptions(data.data);
    } catch (err) {
      console.error('Failed to fetch today\'s prescriptions', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchPrescriptions();
    
    // Auto refresh every 30 seconds for the pharmacist
    const interval = setInterval(fetchPrescriptions, 30000);
    return () => clearInterval(interval);
  }, []);

  const handleDispense = async (id: string) => {
    if (!confirm('Are you sure you want to mark this prescription as fully dispensed?')) return;
    
    try {
      await api.put(`/prescriptions/${id}/dispense`, {});
      fetchPrescriptions(); // Refresh the list
    } catch (err) {
      alert('Failed to mark as dispensed');
    }
  };

  if (loading) return <div className="p-8 text-white">Loading today's queue...</div>;

  return (
    <div className="p-8">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-white">Today's Pharmacy Queue</h1>
        <p className="mt-2 text-slate-400">Approved prescriptions waiting to be dispensed</p>
      </div>

      <div className="space-y-6">
        {prescriptions.length === 0 ? (
          <div className="rounded-xl border border-slate-800 bg-slate-900/50 py-12 text-center text-slate-500 backdrop-blur-sm">
            No pending prescriptions for today.
          </div>
        ) : (
          prescriptions.map((p) => (
            <div key={p.id} className="rounded-xl border border-emerald-500/20 bg-emerald-500/5 p-6 shadow-lg shadow-emerald-500/5">
              <div className="mb-6 flex flex-col sm:flex-row sm:items-center justify-between border-b border-emerald-500/10 pb-4">
                <div>
                  <h3 className="text-lg font-bold text-white">{p.patient_profiles?.users?.name}</h3>
                  <p className="text-sm text-emerald-400/80">Prescribed by Dr. {p.users?.name}</p>
                </div>
                <div className="mt-4 sm:mt-0 text-left sm:text-right">
                  <p className="text-xs text-slate-400 uppercase tracking-wider mb-1">Status</p>
                  <span className="rounded-full border border-emerald-500/30 bg-emerald-500/20 px-3 py-1 text-xs font-semibold text-emerald-300">
                    APPROVED (WAITING)
                  </span>
                </div>
              </div>

              <div className="overflow-x-auto">
                <table className="w-full text-left text-sm text-slate-300">
                  <thead className="text-xs uppercase text-slate-500 border-b border-slate-800">
                    <tr>
                      <th className="py-3 font-semibold">Medicine</th>
                      <th className="py-3 font-semibold">Dosage</th>
                      <th className="py-3 font-semibold">Frequency</th>
                      <th className="py-3 font-semibold">Duration</th>
                      <th className="py-3 font-semibold">Instructions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-800">
                    {p.medicines?.map((med: any, idx: number) => (
                      <tr key={idx} className="transition-colors hover:bg-slate-800/20">
                        <td className="py-4 font-bold text-white">{med.name}</td>
                        <td className="py-4">{med.dosage}</td>
                        <td className="py-4">{med.frequency}</td>
                        <td className="py-4">{med.duration}</td>
                        <td className="py-4 italic">{med.instructions || '-'}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>

              <div className="mt-6 flex items-center justify-between pt-4 border-t border-emerald-500/10">
                <p className="text-sm text-slate-400">
                  <span className="font-semibold text-white">Notes:</span> {p.notes || 'None'}
                </p>
                <button 
                  onClick={() => handleDispense(p.id)}
                  className="rounded-lg bg-emerald-500 px-6 py-2.5 text-sm font-semibold text-white shadow-lg shadow-emerald-500/25 transition-all hover:bg-emerald-400 hover:scale-105 active:scale-95">
                  Mark as Dispensed
                </button>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
}
