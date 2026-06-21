'use client';

import { useState, useEffect } from 'react';
import { api } from '@/lib/api-client';
import { PrescriptionPdf } from '@/components/shared/prescription-pdf';

export default function AdminPrescriptionsPage() {
  const [prescriptions, setPrescriptions] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchPrescriptions = async () => {
    try {
      const { data } = await api.get('/prescriptions/admin');
      setPrescriptions(data.data);
    } catch (err) {
      console.error('Failed to fetch prescriptions', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchPrescriptions();
  }, []);

  const handleApprove = async (id: string) => {
    try {
      await api.put(`/prescriptions/${id}/approve`, {});
      fetchPrescriptions(); // Refresh list
    } catch (err) {
      alert('Failed to approve prescription');
    }
  };

  if (loading) return <div className="p-8 text-white">Loading prescriptions...</div>;

  return (
    <div className="p-8">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-white">Prescription Approvals</h1>
        <p className="mt-2 text-slate-400">Review and approve doctor prescriptions</p>
      </div>

      <div className="overflow-hidden rounded-xl border border-slate-800 bg-slate-900/50 backdrop-blur-sm">
        <table className="w-full text-left text-sm text-slate-300">
          <thead className="bg-slate-800/50 text-xs uppercase text-slate-400 border-b border-slate-800">
            <tr>
              <th className="px-6 py-4 font-semibold">Date</th>
              <th className="px-6 py-4 font-semibold">Doctor</th>
              <th className="px-6 py-4 font-semibold">Patient</th>
              <th className="px-6 py-4 font-semibold">Status</th>
              <th className="px-6 py-4 font-semibold text-right">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-800">
            {prescriptions.map((p) => (
              <tr key={p.id} className="transition-colors hover:bg-slate-800/25">
                <td className="px-6 py-4 whitespace-nowrap">{new Date(p.created_at).toLocaleDateString()}</td>
                <td className="px-6 py-4 font-medium text-white">Dr. {p.users?.name}</td>
                <td className="px-6 py-4">{p.patient_profiles?.users?.name}</td>
                <td className="px-6 py-4">
                  <span className={`inline-flex items-center rounded-full border px-2.5 py-0.5 text-xs font-semibold uppercase tracking-wider ${
                    p.status === 'approved' ? 'border-emerald-500/20 bg-emerald-500/10 text-emerald-400' : 'border-amber-500/20 bg-amber-500/10 text-amber-400'
                  }`}>
                    {p.status}
                  </span>
                </td>
                <td className="px-6 py-4 text-right space-x-3">
                  {p.status === 'created' && (
                    <button 
                      onClick={() => handleApprove(p.id)}
                      className="text-emerald-400 hover:text-emerald-300 font-medium">
                      Approve
                    </button>
                  )}
                  {p.status === 'approved' && (
                    <PrescriptionPdf data={{
                      id: p.id,
                      patientName: p.patient_profiles?.users?.name,
                      doctorName: p.users?.name,
                      date: p.created_at,
                      medicines: p.medicines,
                      notes: p.notes,
                    }} />
                  )}
                </td>
              </tr>
            ))}
            {prescriptions.length === 0 && (
              <tr>
                <td colSpan={5} className="px-6 py-8 text-center text-slate-500">
                  No prescriptions found.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
