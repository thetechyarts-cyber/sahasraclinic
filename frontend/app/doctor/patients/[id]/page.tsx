'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { api } from '@/lib/api-client';

export default function PatientHistoryPage({ params }: { params: { id: string } }) {
  const [patient, setPatient] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchPatient = async () => {
      try {
        const { data } = await api.get(`/patients/${params.id}`);
        setPatient(data.data);
      } catch (err) {
        console.error('Failed to fetch patient history', err);
      } finally {
        setLoading(false);
      }
    };
    fetchPatient();
  }, [params.id]);

  if (loading) return <div className="p-8 text-white">Loading patient history...</div>;
  if (!patient) return <div className="p-8 text-white">Patient not found</div>;

  const calculateAge = (dob: string) => {
    if (!dob) return '-';
    const diffMs = Date.now() - new Date(dob).getTime();
    return Math.abs(new Date(diffMs).getUTCFullYear() - 1970);
  };

  return (
    <div className="p-8 max-w-6xl mx-auto">
      <div className="mb-8 flex items-center justify-between">
        <div>
          <div className="flex items-center gap-3 mb-2">
            <Link href="/doctor/patients" className="text-emerald-400 hover:text-emerald-300 text-sm font-medium">
              &larr; Back to Directory
            </Link>
          </div>
          <h1 className="text-3xl font-bold text-white">{patient.users?.name}</h1>
          <div className="mt-2 flex gap-6 text-sm text-slate-400">
            <span>Reg ID: <span className="text-white font-medium">{patient.registration_id}</span></span>
            <span>Age: <span className="text-white font-medium">{calculateAge(patient.dob)} yrs</span></span>
            <span className="capitalize">Gender: <span className="text-white font-medium">{patient.gender}</span></span>
            <span>Phone: <span className="text-white font-medium">{patient.phone || '-'}</span></span>
          </div>
        </div>
      </div>

      <div className="grid gap-8 lg:grid-cols-2">
        {/* Consultations History */}
        <div className="rounded-xl border border-slate-800 bg-slate-900/50 p-6">
          <h3 className="mb-6 text-sm font-semibold text-emerald-400 uppercase tracking-wider border-b border-slate-800 pb-2">
            Past Consultations
          </h3>
          <div className="space-y-4">
            {patient.consultations?.length > 0 ? (
              patient.consultations.map((c: any) => (
                <div key={c.id} className="rounded-lg bg-slate-800/50 p-4 border border-slate-700/50">
                  <div className="flex justify-between items-start mb-2">
                    <span className="text-sm font-semibold text-white">{new Date(c.created_at).toLocaleDateString()}</span>
                    <span className="text-xs bg-slate-700 px-2 py-0.5 rounded text-slate-300 capitalize">{c.status}</span>
                  </div>
                  <p className="text-sm text-slate-300"><span className="text-slate-500">Diagnosis:</span> {c.diagnosis || 'None recorded'}</p>
                  {c.notes && <p className="text-sm text-slate-400 mt-2 italic">"{c.notes}"</p>}
                </div>
              ))
            ) : (
              <p className="text-sm text-slate-500">No past consultations found.</p>
            )}
          </div>
        </div>

        {/* Prescriptions History */}
        <div className="rounded-xl border border-slate-800 bg-slate-900/50 p-6">
          <h3 className="mb-6 text-sm font-semibold text-cyan-400 uppercase tracking-wider border-b border-slate-800 pb-2">
            Prescriptions
          </h3>
          <div className="space-y-4">
            {patient.prescriptions?.length > 0 ? (
              patient.prescriptions.map((p: any) => (
                <div key={p.id} className="rounded-lg bg-slate-800/50 p-4 border border-slate-700/50">
                  <div className="flex justify-between items-start mb-2">
                    <span className="text-sm font-semibold text-white">{new Date(p.created_at).toLocaleDateString()}</span>
                    <span className="text-xs bg-slate-700 px-2 py-0.5 rounded text-slate-300 capitalize">{p.status}</span>
                  </div>
                  <ul className="list-disc pl-4 text-sm text-slate-300 space-y-1">
                    {p.medicines?.map((m: any, i: number) => (
                      <li key={i}>{m.name} - {m.dosage} ({m.frequency})</li>
                    ))}
                  </ul>
                </div>
              ))
            ) : (
              <p className="text-sm text-slate-500">No prescriptions found.</p>
            )}
          </div>
        </div>

        {/* Prognosis Logs */}
        <div className="rounded-xl border border-slate-800 bg-slate-900/50 p-6">
          <h3 className="mb-6 text-sm font-semibold text-indigo-400 uppercase tracking-wider border-b border-slate-800 pb-2">
            Prognosis & Follow-ups
          </h3>
          <div className="space-y-4">
            {patient.prognosis_logs?.length > 0 ? (
              patient.prognosis_logs.map((log: any) => (
                <div key={log.id} className="rounded-lg bg-slate-800/50 p-4 border border-slate-700/50">
                  <div className="flex justify-between items-start mb-2">
                    <span className="text-sm font-semibold text-white">{new Date(log.created_at).toLocaleDateString()}</span>
                    <span className="text-xs bg-slate-700 px-2 py-0.5 rounded text-slate-300 capitalize">{log.recovery_status}</span>
                  </div>
                  <p className="text-sm text-slate-300"><span className="text-slate-500">Notes:</span> {log.progress_notes || '-'}</p>
                </div>
              ))
            ) : (
              <p className="text-sm text-slate-500">No prognosis logs found.</p>
            )}
          </div>
        </div>

        {/* Uploaded Reports */}
        <div className="rounded-xl border border-slate-800 bg-slate-900/50 p-6">
          <h3 className="mb-6 text-sm font-semibold text-pink-400 uppercase tracking-wider border-b border-slate-800 pb-2">
            Reports & Documents
          </h3>
          <div className="space-y-4">
            {patient.patient_documents?.length > 0 ? (
              patient.patient_documents.map((doc: any) => (
                <div key={doc.id} className="flex items-center justify-between rounded-lg bg-slate-800/50 p-4 border border-slate-700/50">
                  <div>
                    <p className="text-sm font-medium text-white">{doc.title || 'Untitled Document'}</p>
                    <p className="text-xs text-slate-400 capitalize">{doc.document_type || 'Unknown Type'}</p>
                  </div>
                  <a href={doc.file_url} target="_blank" rel="noreferrer" className="text-sm font-semibold text-emerald-400 hover:text-emerald-300">
                    View &rarr;
                  </a>
                </div>
              ))
            ) : (
              <p className="text-sm text-slate-500">No reports uploaded.</p>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
