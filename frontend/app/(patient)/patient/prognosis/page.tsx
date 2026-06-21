'use client';

import { useEffect, useState } from 'react';
import { api } from '@/lib/api-client';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';

export default function PatientPrognosisPage() {
  const [logs, setLogs] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Assuming patient profile ID is stored in local storage or fetched from a /me endpoint
    // We will call the general /me endpoint to get patientId, then fetch logs.
    api.get('/api/patients/me')
      .then(res => {
        const patientId = res.data.data.id;
        return api.get(`/api/prognosis/patient/${patientId}`);
      })
      .then(res => setLogs(res.data.data))
      .catch(console.error)
      .finally(() => setLoading(false));
  }, []);

  if (loading) return <div className="p-8 text-white">Loading your recovery timeline...</div>;

  return (
    <div className="p-8 max-w-3xl mx-auto space-y-8 text-white">
      <div>
        <h1 className="text-3xl font-bold">Recovery Timeline</h1>
        <p className="text-slate-400">Track your progress notes and scheduled follow-ups.</p>
      </div>

      {logs.length === 0 ? (
        <Card className="bg-slate-900 border-slate-800">
          <CardContent className="p-8 text-center text-slate-500">
            No recovery logs found yet. Your doctor will add updates after your consultations.
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-6 relative before:absolute before:inset-0 before:ml-5 before:-translate-x-px md:before:mx-auto md:before:translate-x-0 before:h-full before:w-0.5 before:bg-gradient-to-b before:from-transparent before:via-slate-800 before:to-transparent">
          {logs.map((log) => (
            <div key={log.id} className="relative flex items-center justify-between md:justify-normal md:odd:flex-row-reverse group is-active">
              <div className="flex items-center justify-center w-10 h-10 rounded-full border border-white bg-slate-900 text-slate-500 shadow shrink-0 md:order-1 md:group-odd:-translate-x-1/2 md:group-even:translate-x-1/2">
                <div className={`w-3 h-3 rounded-full ${
                  log.recovery_status === 'recovered' ? 'bg-emerald-500' :
                  log.recovery_status === 'improving' ? 'bg-teal-500' :
                  log.recovery_status === 'deteriorating' ? 'bg-red-500' : 'bg-amber-500'
                }`} />
              </div>
              <Card className="w-[calc(100%-4rem)] md:w-[calc(50%-2.5rem)] bg-slate-900 border-slate-800 p-4">
                <div className="flex items-center justify-between space-x-2 mb-1">
                  <div className="font-bold text-slate-200">Doctor {log.users?.name}</div>
                  <time className="text-xs font-medium text-emerald-500">
                    {new Date(log.created_at).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}
                  </time>
                </div>
                <div className="text-slate-400 text-sm mb-3">
                  Status: <span className="text-white capitalize">{log.recovery_status}</span>
                </div>
                <div className="bg-slate-950 p-3 rounded border border-slate-800 text-sm text-slate-300">
                  "{log.progress_notes}"
                </div>
                {log.followup_date && (
                  <div className="mt-4 inline-flex items-center px-3 py-1 rounded-full border border-teal-500/30 bg-teal-500/10 text-teal-400 text-xs">
                    Next Follow-up: {new Date(log.followup_date).toLocaleString('en-US', { month: 'short', day: 'numeric', hour: 'numeric', minute: 'numeric' })}
                  </div>
                )}
              </Card>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
