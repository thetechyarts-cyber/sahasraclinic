'use client';

import { useState, useEffect } from 'react';
import { api } from '@/lib/api-client';
import { formatDistanceToNow } from 'date-fns';

interface PrescriptionRequest {
  id: string;
  patient_id: string;
  request_type: string;
  status: string;
  created_at: string;
  patient_profiles: {
    users: {
      name: string;
    };
  };
  prescriptions: {
    created_at: string;
    medicines: any[];
  };
}

export default function PrescriptionRequestsPage() {
  const [requests, setRequests] = useState<PrescriptionRequest[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchRequests = async () => {
    try {
      const { data } = await api.get('/prescriptions/requests');
      setRequests(data.data || []);
    } catch (err) {
      console.error('Failed to fetch prescription requests', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchRequests();
  }, []);

  const handleApprove = async (id: string) => {
    try {
      await api.put(`/prescriptions/requests/${id}/approve`);
      alert('Request approved successfully.');
      fetchRequests();
    } catch (err) {
      console.error('Failed to approve request', err);
      alert('Failed to approve request');
    }
  };

  if (loading) return <div className="p-8 text-white">Loading requests...</div>;

  return (
    <div className="p-8 max-w-6xl mx-auto">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-white">Pending Prescription Requests</h1>
        <p className="mt-2 text-slate-400">Review and approve requests for prescription copies</p>
      </div>

      {requests.length === 0 ? (
        <div className="rounded-xl border border-slate-800 bg-slate-900/50 p-12 text-center">
          <p className="text-slate-400">No pending requests at the moment.</p>
        </div>
      ) : (
        <div className="grid gap-6">
          {requests.map((req) => (
            <div key={req.id} className="flex flex-col sm:flex-row sm:items-center justify-between rounded-xl border border-slate-800 bg-slate-900/50 p-6">
              <div>
                <h3 className="text-lg font-semibold text-white flex items-center gap-2">
                  {req.patient_profiles?.users?.name}
                  <span className="text-[10px] uppercase tracking-wider bg-slate-800 px-2 py-0.5 rounded-full text-emerald-400">
                    {req.request_type}
                  </span>
                </h3>
                <div className="mt-2 flex items-center gap-4 text-sm text-slate-400">
                  <span>Requested {formatDistanceToNow(new Date(req.created_at))} ago</span>
                  <span>•</span>
                  <span>Prescription from {new Date(req.prescriptions.created_at).toLocaleDateString()}</span>
                  <span>•</span>
                  <span>{req.prescriptions.medicines?.length || 0} Medicines</span>
                </div>
              </div>
              <div className="mt-4 sm:mt-0 flex gap-3">
                <button 
                  onClick={() => handleApprove(req.id)}
                  className="rounded-lg bg-emerald-500 px-6 py-2.5 text-sm font-semibold text-white shadow-lg shadow-emerald-500/25 transition-all hover:bg-emerald-400">
                  Approve Request
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
