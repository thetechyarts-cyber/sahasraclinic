'use client';

import { useState, useEffect } from 'react';
import { api } from '@/lib/api-client';
import { useAuth } from '@/providers/auth-provider';

export default function PatientHistoryPage() {
  const { user } = useAuth();
  const [profile, setProfile] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchHistory = async () => {
      if (!user) return;
      try {
        const { data } = await api.get('/patients/me');
        setProfile(data.data);
      } catch (err) {
        console.error('Failed to fetch patient history', err);
      } finally {
        setLoading(false);
      }
    };
    fetchHistory();
  }, [user]);

  if (loading) return <div className="p-8 text-slate-400">Loading history...</div>;

  return (
    <div className="max-w-6xl mx-auto p-8 space-y-8">
      <div className="mb-8">
        <h1 className="text-3xl font-bold bg-gradient-to-r from-emerald-400 to-cyan-400 bg-clip-text text-transparent">
          Medical History
        </h1>
        <p className="mt-2 text-slate-400">View your uploaded reports and doctor's prognosis</p>
      </div>

      <div className="grid gap-8 lg:grid-cols-2">
        {/* Prognosis Section */}
        <div className="rounded-xl border border-slate-800 bg-slate-900/50 p-6 backdrop-blur-sm h-fit">
          <h2 className="text-lg font-semibold text-white mb-6 border-b border-slate-800 pb-2 flex items-center gap-2">
            <svg className="w-5 h-5 text-emerald-400" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-3 7h3m-3 4h3m-6-4h.01M9 16h.01" /></svg>
            Doctor's Prognosis
          </h2>
          
          <div className="space-y-4">
            {profile?.prognosis_logs && profile.prognosis_logs.length > 0 ? (
              profile.prognosis_logs.map((log: any) => (
                <div key={log.id} className="p-4 rounded-lg bg-slate-800/50 border border-slate-700/50">
                  <div className="flex justify-between items-start mb-2">
                    <span className="text-xs font-medium text-slate-400">
                      {new Date(log.created_at).toLocaleDateString()}
                    </span>
                    <span className="rounded bg-emerald-500/20 text-emerald-400 px-2 py-0.5 text-xs font-medium">
                      Well-being: {log.well_being_score}/10
                    </span>
                  </div>
                  <p className="text-sm text-slate-300 font-medium mb-1">Status: <span className="text-white capitalize">{log.recovery_status.replace('_', ' ')}</span></p>
                  <p className="text-sm text-slate-400 mb-2">{log.progress_notes}</p>
                  
                  {log.followup_date && (
                    <div className="mt-3 pt-3 border-t border-slate-700/50 text-xs text-amber-400 font-medium">
                      Next Follow-up: {new Date(log.followup_date).toLocaleDateString()}
                    </div>
                  )}
                </div>
              ))
            ) : (
              <div className="text-center py-8 text-slate-500">
                No prognosis records found.
              </div>
            )}
          </div>
        </div>

        {/* Uploaded Reports Section */}
        <div className="rounded-xl border border-slate-800 bg-slate-900/50 p-6 backdrop-blur-sm h-fit">
          <h2 className="text-lg font-semibold text-white mb-6 border-b border-slate-800 pb-2 flex items-center gap-2">
            <svg className="w-5 h-5 text-cyan-400" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15.172 7l-6.586 6.586a2 2 0 102.828 2.828l6.414-6.586a4 4 0 00-5.656-5.656l-6.415 6.585a6 6 0 108.486 8.486L20.5 13" /></svg>
            Your Reports
          </h2>
          
          <div className="space-y-4">
            {profile?.patient_documents && profile.patient_documents.length > 0 ? (
              <div className="grid gap-4">
                {profile.patient_documents.map((doc: any) => (
                  <a 
                    key={doc.id}
                    href={doc.file_url}
                    target="_blank"
                    rel="noreferrer"
                    className="flex items-center justify-between p-4 rounded-lg bg-slate-800/50 border border-slate-700/50 hover:border-emerald-500/50 hover:bg-slate-800 transition-all group"
                  >
                    <div className="flex items-center gap-3 overflow-hidden">
                      <div className="p-2 rounded bg-slate-700 text-slate-300 group-hover:text-emerald-400 transition-colors">
                        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M7 21h10a2 2 0 002-2V9.414a1 1 0 00-.293-.707l-5.414-5.414A1 1 0 0012.586 3H7a2 2 0 00-2 2v14a2 2 0 002 2z" /></svg>
                      </div>
                      <div className="truncate">
                        <p className="text-sm font-medium text-white truncate">{doc.file_name || 'Document'}</p>
                        <p className="text-xs text-slate-400 capitalize">{doc.file_type} • {new Date(doc.created_at).toLocaleDateString()}</p>
                      </div>
                    </div>
                    <svg className="w-5 h-5 text-slate-500 group-hover:text-emerald-400 transition-colors" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" /></svg>
                  </a>
                ))}
              </div>
            ) : (
              <div className="text-center py-8 text-slate-500">
                You haven't uploaded any reports yet.
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
