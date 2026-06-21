'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { api } from '@/lib/api-client';

interface PatientProfile {
  id: string;
  registration_id: string;
  gender: string;
  dob: string | null;
  phone: string;
  address: string;
  village: string;
  birth_place: string;
  status: string;
  created_at: string;
  users: {
    name: string;
    email: string;
  };
  patient_documents?: any[];
  consultations?: any[];
}

export default function PatientProfilePage({ params }: { params: { id: string } }) {
  const [patient, setPatient] = useState<PatientProfile | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchPatient = async () => {
      try {
        const { data } = await api.get(`/patients/${params.id}`);
        setPatient(data.data);
      } catch (err) {
        console.error('Failed to fetch patient', err);
      } finally {
        setLoading(false);
      }
    };
    fetchPatient();
  }, [params.id]);

  if (loading) return <div className="p-8 text-white">Loading profile...</div>;
  if (!patient) return <div className="p-8 text-white">Patient not found</div>;

  return (
    <div className="p-8">
      <div className="mb-8 flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-white">{patient.users?.name}</h1>
          <p className="mt-2 font-mono text-emerald-400">{patient.registration_id}</p>
        </div>
        <Link href={`/admin/case-sheets/new?patient_id=${patient.id}`} className="rounded-lg bg-emerald-500 px-4 py-2 text-sm font-semibold text-white shadow-lg shadow-emerald-500/25 transition-all hover:bg-emerald-400">
          + Create Case Sheet
        </Link>
      </div>

      <div className="grid gap-6 md:grid-cols-3">
        <div className="col-span-1 rounded-xl border border-slate-800 bg-slate-900/50 p-6 backdrop-blur-sm h-fit">
          <h3 className="mb-4 text-sm font-semibold text-white uppercase tracking-wider border-b border-slate-800 pb-2">
            Demographics
          </h3>
          <dl className="space-y-4 text-sm">
            <div>
              <dt className="text-slate-400">Email</dt>
              <dd className="font-medium text-white">{patient.users?.email}</dd>
            </div>
            <div>
              <dt className="text-slate-400">Phone</dt>
              <dd className="font-medium text-white">{patient.phone || '-'}</dd>
            </div>
            <div>
              <dt className="text-slate-400">Gender</dt>
              <dd className="font-medium text-white capitalize">{patient.gender || '-'}</dd>
            </div>
            <div>
              <dt className="text-slate-400">Date of Birth</dt>
              <dd className="font-medium text-white">{patient.dob ? new Date(patient.dob).toLocaleDateString() : '-'}</dd>
            </div>
            <div>
              <dt className="text-slate-400">Village/Town</dt>
              <dd className="font-medium text-white">{patient.village || '-'}</dd>
            </div>
            <div>
              <dt className="text-slate-400">Birth Place</dt>
              <dd className="font-medium text-white">{patient.birth_place || '-'}</dd>
            </div>
            <div>
              <dt className="text-slate-400">Full Address</dt>
              <dd className="font-medium text-white">{patient.address || '-'}</dd>
            </div>
          </dl>
        </div>

        <div className="col-span-2 space-y-6">
          <div className="rounded-xl border border-slate-800 bg-slate-900/50 p-6 backdrop-blur-sm">
            <h3 className="mb-4 text-sm font-semibold text-white uppercase tracking-wider border-b border-slate-800 pb-2 flex justify-between items-center">
              <span>Patient Documents</span>
            </h3>
            <div className="space-y-4">
              {patient.patient_documents && patient.patient_documents.length > 0 ? (
                <div className="grid gap-4 sm:grid-cols-2">
                  {patient.patient_documents.map((doc: any) => (
                    <div key={doc.id} className="flex items-center justify-between p-4 rounded-lg bg-slate-800/50 border border-slate-700/50">
                      <div className="flex items-center gap-3 overflow-hidden">
                        <div className="p-2 rounded bg-slate-700 text-slate-300">
                          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M7 21h10a2 2 0 002-2V9.414a1 1 0 00-.293-.707l-5.414-5.414A1 1 0 0012.586 3H7a2 2 0 00-2 2v14a2 2 0 002 2z" /></svg>
                        </div>
                        <div className="truncate">
                          <p className="text-sm font-medium text-white truncate">{doc.title || 'Untitled Document'}</p>
                          <p className="text-xs text-slate-400 capitalize">{doc.document_type || 'Unknown Type'}</p>
                        </div>
                      </div>
                      <div className="flex items-center gap-2">
                        <a 
                          href={doc.file_url} 
                          target="_blank" 
                          rel="noreferrer"
                          className="p-2 text-emerald-400 hover:text-emerald-300 hover:bg-emerald-400/10 rounded transition-colors"
                          title="View Document"
                        >
                          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" /><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" /></svg>
                        </a>
                        <button 
                          onClick={async () => {
                            if (confirm('Are you sure you want to delete this document?')) {
                              try {
                                await api.delete(`/case-sheets/documents/${doc.id}`);
                                setPatient({...patient, patient_documents: patient.patient_documents?.filter((d: any) => d.id !== doc.id) || []});
                              } catch (err) {
                                alert('Failed to delete document');
                              }
                            }
                          }}
                          className="p-2 text-red-400 hover:text-red-300 hover:bg-red-400/10 rounded transition-colors"
                          title="Delete Document"
                        >
                          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" /></svg>
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="py-8 text-center text-sm text-slate-500 bg-slate-800/20 rounded-lg border border-dashed border-slate-700">
                  <svg className="mx-auto h-8 w-8 text-slate-600 mb-2" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 13h6m-3-3v6m5 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" /></svg>
                  No documents found for this patient.
                </div>
              )}
            </div>
          </div>
          
          <div className="rounded-xl border border-slate-800 bg-slate-900/50 p-6 backdrop-blur-sm">
            <h3 className="mb-4 text-sm font-semibold text-white uppercase tracking-wider border-b border-slate-800 pb-2">
              Case Sheets
            </h3>
            <div className="space-y-4">
              {patient.consultations && patient.consultations.length > 0 ? (
                patient.consultations.map((c: any) => (
                  <div key={c.id} className="p-4 rounded-lg bg-slate-800/50 border border-slate-700/50">
                    <p className="text-sm font-medium text-white mb-1">{new Date(c.date).toLocaleDateString()} - {c.status}</p>
                    <p className="text-sm text-slate-400">Dr. ID: {c.doctor_id}</p>
                  </div>
                ))
              ) : (
                <p className="text-sm text-slate-400">No consultations found.</p>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
