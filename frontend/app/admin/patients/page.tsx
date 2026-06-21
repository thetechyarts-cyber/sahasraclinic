'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { api } from '@/lib/api-client';

interface Patient {
  id: string;
  registration_id: string;
  phone: string;
  dob: string | null;
  status: string;
  users: {
    name: string;
    email: string;
  };
}

export default function PatientsPage() {
  const [patients, setPatients] = useState<Patient[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchParams, setSearchParams] = useState({
    firstName: '',
    mobile: '',
    registrationId: '',
  });

  useEffect(() => {
    fetchPatients();
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  const fetchPatients = async (params = searchParams) => {
    setLoading(true);
    try {
      // Build query string
      const query = new URLSearchParams();
      if (params.firstName) query.append('firstName', params.firstName);
      if (params.mobile) query.append('mobile', params.mobile);
      if (params.registrationId) query.append('registrationId', params.registrationId);
      query.append('page', '1');
      query.append('limit', '50');

      const { data } = await api.get(`/patients?${query.toString()}`);
      setPatients(data.data?.items || []);
    } catch (err) {
      console.error('Failed to fetch patients', err);
    } finally {
      setLoading(false);
    }
  };

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    fetchPatients();
  };

  return (
    <div className="p-8">
      <div className="mb-8 flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-white">Patients</h1>
          <p className="mt-2 text-slate-400">Search and manage patient records</p>
        </div>
        <Link href="/admin/patients/new" className="rounded-lg bg-emerald-500 px-4 py-2 text-sm font-semibold text-white shadow-lg shadow-emerald-500/25 transition-all hover:bg-emerald-400">
          + Register Patient
        </Link>
      </div>

      <div className="mb-8 rounded-xl border border-slate-800 bg-slate-900/50 p-6 backdrop-blur-sm">
        <form onSubmit={handleSearch} className="grid gap-4 md:grid-cols-4">
          <div>
            <label className="mb-1 block text-xs font-medium text-slate-400 uppercase">Registration ID</label>
            <input 
              type="text" 
              placeholder="HMS-2026-..." 
              value={searchParams.registrationId}
              onChange={(e) => setSearchParams({ ...searchParams, registrationId: e.target.value })}
              className="w-full rounded-lg border border-slate-700 bg-slate-800/50 px-3 py-2 text-sm text-white outline-none focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500" 
            />
          </div>
          <div>
            <label className="mb-1 block text-xs font-medium text-slate-400 uppercase">Name</label>
            <input 
              type="text" 
              placeholder="Patient Name" 
              value={searchParams.firstName}
              onChange={(e) => setSearchParams({ ...searchParams, firstName: e.target.value })}
              className="w-full rounded-lg border border-slate-700 bg-slate-800/50 px-3 py-2 text-sm text-white outline-none focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500" 
            />
          </div>
          <div>
            <label className="mb-1 block text-xs font-medium text-slate-400 uppercase">Mobile Number</label>
            <input 
              type="text" 
              placeholder="e.g. 9876543210" 
              value={searchParams.mobile}
              onChange={(e) => setSearchParams({ ...searchParams, mobile: e.target.value })}
              className="w-full rounded-lg border border-slate-700 bg-slate-800/50 px-3 py-2 text-sm text-white outline-none focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500" 
            />
          </div>
          <div className="flex items-end">
            <button type="submit" className="w-full rounded-lg bg-slate-700 px-4 py-2 text-sm font-medium text-white transition-colors hover:bg-slate-600">
              Search
            </button>
          </div>
        </form>
      </div>

      <div className="overflow-hidden rounded-xl border border-slate-800 bg-slate-900/50 backdrop-blur-sm">
        <table className="w-full text-left text-sm text-slate-300">
          <thead className="bg-slate-800/50 text-xs uppercase text-slate-400">
            <tr>
              <th className="px-6 py-4 font-medium">Reg ID</th>
              <th className="px-6 py-4 font-medium">Name</th>
              <th className="px-6 py-4 font-medium">Contact</th>
              <th className="px-6 py-4 font-medium">Status</th>
              <th className="px-6 py-4 font-medium text-right">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-800">
            {loading ? (
              <tr>
                <td colSpan={5} className="px-6 py-8 text-center text-slate-500">Loading...</td>
              </tr>
            ) : patients.map((patient) => (
              <tr key={patient.id} className="transition-colors hover:bg-slate-800/25">
                <td className="px-6 py-4 font-mono text-emerald-400">{patient.registration_id}</td>
                <td className="px-6 py-4 font-medium text-white">{patient.users?.name}</td>
                <td className="px-6 py-4">
                  <div className="text-white">{patient.phone}</div>
                  <div className="text-xs text-slate-500">{patient.users?.email}</div>
                </td>
                <td className="px-6 py-4">
                  <span className={`inline-flex items-center rounded-full border px-2.5 py-0.5 text-xs font-semibold ${
                    patient.status === 'active' 
                      ? 'border-emerald-500/20 bg-emerald-500/10 text-emerald-400'
                      : 'border-slate-500/20 bg-slate-500/10 text-slate-400'
                  }`}>
                    {patient.status}
                  </span>
                </td>
                <td className="px-6 py-4 text-right">
                  <Link href={`/admin/patients/${patient.id}`} className="text-emerald-400 hover:text-emerald-300 mr-4 transition-colors">
                    View Profile
                  </Link>
                </td>
              </tr>
            ))}
            {!loading && patients.length === 0 && (
              <tr>
                <td colSpan={5} className="px-6 py-8 text-center text-slate-500">
                  No patients found matching your search.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
