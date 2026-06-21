'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { api } from '@/lib/api-client';

export default function DoctorPatientsSearchPage() {
  const [searchQuery, setSearchQuery] = useState('');
  const [patients, setPatients] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);

  const searchPatients = async () => {
    if (!searchQuery.trim()) return;
    setLoading(true);
    try {
      const { data } = await api.get(`/patients?firstName=${encodeURIComponent(searchQuery)}&limit=10`);
      setPatients(data.data.items || []);
    } catch (err) {
      console.error('Search failed', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    const delayDebounceFn = setTimeout(() => {
      searchPatients();
    }, 500);
    return () => clearTimeout(delayDebounceFn);
  }, [searchQuery]);

  return (
    <div className="p-8 max-w-5xl mx-auto">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-white">Patient Directory</h1>
        <p className="mt-2 text-slate-400">Search for patients to view their medical history</p>
      </div>

      <div className="mb-8">
        <input 
          type="text" 
          placeholder="Search by patient name..." 
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          className="w-full rounded-xl border border-slate-700 bg-slate-900/50 px-6 py-4 text-white focus:border-emerald-500 outline-none backdrop-blur-sm text-lg shadow-inner"
        />
      </div>

      {loading ? (
        <div className="text-slate-400">Searching...</div>
      ) : patients.length > 0 ? (
        <div className="grid gap-4">
          {patients.map(patient => (
            <Link href={`/doctor/patients/${patient.id}`} key={patient.id} className="block rounded-xl border border-slate-800 bg-slate-900/50 p-6 transition-all hover:bg-slate-800 hover:border-slate-700">
              <div className="flex justify-between items-center">
                <div>
                  <h3 className="text-lg font-bold text-white">{patient.users?.name}</h3>
                  <div className="mt-1 flex gap-4 text-sm text-slate-400">
                    <span>Reg: {patient.registration_id}</span>
                    <span>Phone: {patient.phone || 'N/A'}</span>
                    <span className="capitalize">Gender: {patient.gender}</span>
                  </div>
                </div>
                <div className="text-emerald-400 font-medium">View History &rarr;</div>
              </div>
            </Link>
          ))}
        </div>
      ) : searchQuery ? (
        <div className="text-slate-400">No patients found.</div>
      ) : (
        <div className="text-slate-500 text-sm">Type a name to begin searching...</div>
      )}
    </div>
  );
}
