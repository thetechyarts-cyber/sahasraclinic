'use client';

import { useEffect, useState } from 'react';
import { api } from '@/lib/api-client';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';

export default function AdminFollowUpsPage() {
  const [followups, setFollowups] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    api.get('/api/prognosis/follow-ups')
      .then(res => setFollowups(res.data.data))
      .catch(console.error)
      .finally(() => setLoading(false));
  }, []);

  if (loading) return <div className="p-8 text-white">Loading follow-ups...</div>;

  return (
    <div className="p-8 space-y-6 text-white">
      <h1 className="text-3xl font-bold">Upcoming Follow-ups</h1>
      <p className="text-slate-400">Manage and call patients scheduled for follow-up visits.</p>

      {followups.length === 0 ? (
        <Card className="bg-slate-900 border-slate-800">
          <CardContent className="p-8 text-center text-slate-500">
            No upcoming follow-ups scheduled.
          </CardContent>
        </Card>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {followups.map((f) => (
            <Card key={f.id} className="bg-slate-900 border-slate-800 flex flex-col justify-between">
              <CardHeader>
                <CardTitle className="text-emerald-400 flex justify-between items-center text-lg">
                  {new Date(f.followup_date).toLocaleDateString('en-IN', { weekday: 'short', month: 'short', day: 'numeric' })}
                  <span className="text-sm font-normal text-slate-400 bg-slate-950 px-3 py-1 rounded-full border border-slate-800">
                    {new Date(f.followup_date).toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit' })}
                  </span>
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <p className="text-sm text-slate-500 uppercase tracking-wider mb-1">Patient</p>
                  <p className="font-medium text-slate-200">{f.patient_profiles?.users?.name || 'Unknown Patient'}</p>
                </div>
                <div>
                  <p className="text-sm text-slate-500 uppercase tracking-wider mb-1">Assigned Doctor</p>
                  <p className="font-medium text-slate-300">{f.users?.name || 'Unknown Doctor'}</p>
                </div>
                <div className="bg-slate-950 p-3 rounded-lg border border-slate-800 mt-2">
                  <p className="text-xs text-slate-500 uppercase tracking-wider mb-1">Latest Progress</p>
                  <p className="text-sm text-slate-400 line-clamp-2">{f.progress_notes}</p>
                </div>
                
                <a href={`tel:${f.patient_profiles?.phone || ''}`} className="block w-full text-center mt-4 bg-emerald-600 hover:bg-emerald-500 text-white py-2 rounded-md transition-colors">
                  Call Patient
                </a>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}
