'use client';

import { useState, useEffect } from 'react';
import { api } from '@/lib/api-client';
import Link from 'next/link';

interface Consultation {
  id: string;
  patient_id: string;
  doctor_id: string;
  date: string;
  diagnosis: string;
  patient_profiles: {
    registration_id: string;
    users: {
      name: string;
    };
  };
}

export default function ConsultationsListPage() {
  const [consultations, setConsultations] = useState<Consultation[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchConsultations = async () => {
    try {
      // Backend route is /consultations/doctor
      const { data } = await api.get('/consultations/doctor');
      setConsultations(data.data || []);
    } catch (err) {
      console.error('Failed to fetch doctor consultations', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchConsultations();
  }, []);

  if (loading) return <div className="p-8 text-white">Loading consultations...</div>;

  return (
    <div className="p-8">
      <div className="mb-8 flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-white">My Consultations</h1>
          <p className="mt-2 text-slate-400">View your previous patient consultations</p>
        </div>
      </div>

      <div className="overflow-hidden rounded-xl border border-slate-800 bg-slate-900/50 backdrop-blur-sm">
        <table className="w-full text-left text-sm text-slate-300">
          <thead className="bg-slate-800/50 text-xs uppercase text-slate-400">
            <tr>
              <th className="px-6 py-4 font-medium">Date</th>
              <th className="px-6 py-4 font-medium">Patient Name</th>
              <th className="px-6 py-4 font-medium">Registration ID</th>
              <th className="px-6 py-4 font-medium">Diagnosis</th>
              <th className="px-6 py-4 font-medium text-right">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-800">
            {consultations.map((c) => (
              <tr key={c.id} className="transition-colors hover:bg-slate-800/25">
                <td className="px-6 py-4 font-medium text-white">
                  {new Date(c.date).toLocaleDateString()}
                </td>
                <td className="px-6 py-4">{c.patient_profiles?.users?.name || 'Unknown Patient'}</td>
                <td className="px-6 py-4 font-mono">{c.patient_profiles?.registration_id}</td>
                <td className="px-6 py-4 max-w-xs truncate">{c.diagnosis || 'No diagnosis yet'}</td>
                <td className="px-6 py-4 text-right">
                  <Link 
                    href={`/doctor/consultations/${c.id}`}
                    className="text-emerald-400 hover:text-emerald-300 transition-colors"
                  >
                    View / Edit
                  </Link>
                </td>
              </tr>
            ))}
            {consultations.length === 0 && (
              <tr>
                <td colSpan={5} className="px-6 py-8 text-center text-slate-500">
                  No previous consultations found.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
