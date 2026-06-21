'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { api } from '@/lib/api-client';

interface CaseSheet {
  id: string;
  patient_id: string;
  type: string;
  chief_complaint: string;
  status: string;
  created_at: string;
  female_case_sheets?: any[];
  patient_documents?: any[];
}

export default function CaseSheetPage({ params }: { params: { id: string } }) {
  const [caseSheet, setCaseSheet] = useState<CaseSheet | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchCaseSheet = async () => {
      try {
        const { data } = await api.get(`/case-sheets/${params.id}`);
        setCaseSheet(data.data);
      } catch (err) {
        console.error('Failed to fetch case sheet', err);
      } finally {
        setLoading(false);
      }
    };
    fetchCaseSheet();
  }, [params.id]);

  if (loading) return <div className="p-8 text-white">Loading case sheet...</div>;
  if (!caseSheet) return <div className="p-8 text-white">Case sheet not found</div>;

  const femaleData = caseSheet.female_case_sheets?.[0];

  return (
    <div className="p-8">
      <div className="mb-8 flex items-center justify-between">
        <div>
          <div className="flex items-center gap-3 mb-2">
            <Link href={`/admin/patients/${caseSheet.patient_id}`} className="text-emerald-400 hover:text-emerald-300">
              &larr; Back to Patient
            </Link>
            <span className={`inline-flex items-center rounded-full border px-2.5 py-0.5 text-xs font-semibold ${
              caseSheet.status === 'complete' ? 'border-emerald-500/20 bg-emerald-500/10 text-emerald-400' : 'border-amber-500/20 bg-amber-500/10 text-amber-400'
            }`}>
              {caseSheet.status.toUpperCase()}
            </span>
          </div>
          <h1 className="text-3xl font-bold text-white">Case Sheet Details</h1>
          <p className="mt-1 text-slate-400">Created on {new Date(caseSheet.created_at).toLocaleString()}</p>
        </div>
      </div>

      <div className="space-y-6">
        <div className="rounded-xl border border-slate-800 bg-slate-900/50 p-6 backdrop-blur-sm">
          <h3 className="mb-4 text-sm font-semibold text-white uppercase tracking-wider border-b border-slate-800 pb-2">
            Chief Complaint
          </h3>
          <p className="text-slate-300 whitespace-pre-wrap">{caseSheet.chief_complaint}</p>
        </div>

        {caseSheet.type === 'female' && femaleData && (
          <div className="rounded-xl border border-pink-500/20 bg-pink-500/5 p-6">
            <h3 className="mb-4 text-sm font-semibold text-pink-400 uppercase tracking-wider border-b border-pink-500/20 pb-2">
              Female Health History
            </h3>
            <dl className="grid gap-4 md:grid-cols-2 text-sm">
              <div>
                <dt className="text-slate-400">LMP Date</dt>
                <dd className="font-medium text-white">{femaleData.lmp_date || '-'}</dd>
              </div>
              <div>
                <dt className="text-slate-400">LMP Details</dt>
                <dd className="font-medium text-white">{femaleData.lmp_details || '-'}</dd>
              </div>
              <div className="md:col-span-2">
                <dt className="text-slate-400">Contraceptive History</dt>
                <dd className="font-medium text-white">{femaleData.contraceptive_history || '-'}</dd>
              </div>
              <div className="md:col-span-2">
                <dt className="text-slate-400">Notes</dt>
                <dd className="font-medium text-white">{femaleData.notes || '-'}</dd>
              </div>
            </dl>
          </div>
        )}

        <div className="rounded-xl border border-slate-800 bg-slate-900/50 p-6 backdrop-blur-sm">
          <h3 className="mb-4 text-sm font-semibold text-white uppercase tracking-wider border-b border-slate-800 pb-2">
            Attached Documents
          </h3>
          {caseSheet.patient_documents && caseSheet.patient_documents.length > 0 ? (
            <ul className="space-y-2">
              {caseSheet.patient_documents.map((doc: any) => (
                <li key={doc.id} className="flex items-center justify-between rounded-lg border border-slate-700 bg-slate-800/50 p-3">
                  <div className="flex items-center space-x-3 truncate">
                    <span className="text-emerald-400">📎</span>
                    <a href={doc.file_url} target="_blank" rel="noreferrer" className="truncate text-sm text-emerald-400 hover:underline">
                      {doc.file_name}
                    </a>
                  </div>
                </li>
              ))}
            </ul>
          ) : (
            <p className="text-sm text-slate-400">No documents attached.</p>
          )}
        </div>
      </div>
    </div>
  );
}
