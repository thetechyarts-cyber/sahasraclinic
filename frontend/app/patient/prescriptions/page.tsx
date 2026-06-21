'use client';

import { useState, useEffect } from 'react';
import { api } from '@/lib/api-client';
import { useAuth } from '@/providers/auth-provider';
import { PrescriptionPdf } from '@/components/shared/prescription-pdf';

export default function PatientPrescriptionsPage() {
  const { user } = useAuth();
  const [prescriptions, setPrescriptions] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchPrescriptions = async () => {
      if (!user) return;
      try {
        // Patient uses the dynamic ID endpoint, but wait, the API router for patients is `/prescriptions/:id`?
        // Wait, I didn't create a GET /prescriptions/patient/:patientId route!
        // Oh, the router doesn't have a patient endpoint yet. Let me fetch via `/patients/:id`? 
        // No, we can just hit a future `GET /prescriptions` and the backend should filter by user ID.
        // Actually, the implementation plan mentioned `GET /prescriptions/patient/:id` but I forgot it in `routes.ts`.
        // Let's call `/prescriptions/me` for now and I will update the backend routes next.
        const { data } = await api.get('/prescriptions/me');
        setPrescriptions(data.data);
      } catch (err) {
        console.error('Failed to fetch prescriptions', err);
      } finally {
        setLoading(false);
      }
    };
    fetchPrescriptions();
  }, [user]);

  const requestCopy = async (id: string) => {
    try {
      await api.post('/prescriptions/requests', {
        prescription_id: id,
        patient_id: user?.id,
      });
      alert('Request sent successfully. You will be notified once approved.');
    } catch (err) {
      alert('Failed to request prescription copy.');
    }
  };

  if (loading) return <div className="p-8 text-white">Loading prescriptions...</div>;

  return (
    <div className="p-8">
      <div className="mb-8">
        <h1 className="text-3xl font-bold bg-gradient-to-r from-emerald-400 to-cyan-400 bg-clip-text text-transparent">
          Your Prescriptions
        </h1>
        <p className="mt-2 text-slate-400">View and request copies of your medical prescriptions</p>
      </div>

      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
        {prescriptions.length === 0 ? (
          <div className="col-span-full py-12 text-center text-slate-500">
            You don't have any prescriptions yet.
          </div>
        ) : (
          prescriptions.map((p) => (
            <div key={p.id} className="rounded-xl border border-slate-800 bg-slate-900/50 p-6 backdrop-blur-sm">
              <div className="mb-4 flex items-center justify-between border-b border-slate-800 pb-4">
                <div>
                  <h3 className="font-semibold text-white">Dr. {p.users?.name || 'Unknown'}</h3>
                  <p className="text-sm text-slate-400">{new Date(p.created_at).toLocaleDateString()}</p>
                </div>
                <span className="rounded-full border border-emerald-500/20 bg-emerald-500/10 px-2.5 py-0.5 text-xs font-medium text-emerald-400">
                  {p.status}
                </span>
              </div>
              
              {p.status === 'approved' ? (
                <div className="mt-6 flex items-center justify-between">
                  <p className="text-sm text-slate-400">Ready to download</p>
                  <PrescriptionPdf data={{
                    id: p.id,
                    patientName: p.patient_profiles?.users?.name,
                    doctorName: p.users?.name,
                    date: p.created_at,
                    medicines: p.medicines,
                    notes: p.notes,
                  }} />
                </div>
              ) : (
                <div className="mt-6 flex flex-col items-center justify-center space-y-3">
                  <p className="text-sm text-slate-400 text-center">
                    This prescription is locked. You can request a digital copy from your doctor.
                  </p>
                  <button 
                    onClick={() => requestCopy(p.id)}
                    className="w-full rounded-lg border border-emerald-500/50 px-4 py-2 text-sm font-semibold text-emerald-400 transition-colors hover:bg-emerald-500/10">
                    Request Copy
                  </button>
                </div>
              )}
            </div>
          ))
        )}
      </div>
    </div>
  );
}
