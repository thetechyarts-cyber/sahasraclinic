'use client';

import { useState, useEffect } from 'react';
import { api } from '@/lib/api-client';

export default function PharmacistHistoryPage() {
  const [prescriptions, setPrescriptions] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchHistory = async () => {
      try {
        const { data } = await api.get('/prescriptions/pharmacist/history');
        setPrescriptions(data.data);
      } catch (err) {
        console.error('Failed to fetch history', err);
      } finally {
        setLoading(false);
      }
    };
    fetchHistory();
  }, []);

  if (loading) return <div className="p-8 text-white">Loading history...</div>;

  return (
    <div className="p-8">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-white">Dispense History</h1>
        <p className="mt-2 text-slate-400">Records of medicines you have dispensed</p>
      </div>

      <div className="overflow-hidden rounded-xl border border-slate-800 bg-slate-900/50 backdrop-blur-sm">
        <table className="w-full text-left text-sm text-slate-300">
          <thead className="bg-slate-800/50 text-xs uppercase text-slate-400 border-b border-slate-800">
            <tr>
              <th className="px-6 py-4 font-semibold">Dispensed At</th>
              <th className="px-6 py-4 font-semibold">Patient Name</th>
              <th className="px-6 py-4 font-semibold">Prescribed By</th>
              <th className="px-6 py-4 font-semibold">Total Medicines</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-800">
            {prescriptions.map((p) => (
              <tr key={p.id} className="transition-colors hover:bg-slate-800/25">
                <td className="px-6 py-4 whitespace-nowrap">
                  {new Date(p.dispensed_at).toLocaleString()}
                </td>
                <td className="px-6 py-4 font-medium text-white">{p.patient_profiles?.users?.name}</td>
                <td className="px-6 py-4">Dr. {p.users?.name}</td>
                <td className="px-6 py-4 font-medium text-emerald-400">
                  {p.medicines?.length || 0} items
                </td>
              </tr>
            ))}
            {prescriptions.length === 0 && (
              <tr>
                <td colSpan={4} className="px-6 py-8 text-center text-slate-500">
                  No dispense history found.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
