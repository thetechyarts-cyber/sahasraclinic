'use client';

import { useState, useEffect } from 'react';
import { api } from '@/lib/api-client';

interface Role {
  id: string;
  name: string;
  description: string;
}

export default function RolesPage() {
  const [roles, setRoles] = useState<Role[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchRoles();
  }, []);

  const fetchRoles = async () => {
    try {
      const { data } = await api.get('/roles');
      setRoles(data.data);
    } catch (err) {
      console.error('Failed to fetch roles', err);
    } finally {
      setLoading(false);
    }
  };

  if (loading) return <div className="p-8 text-white">Loading roles...</div>;

  return (
    <div className="p-8">
      <div className="mb-8 flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-white">Role Management</h1>
          <p className="mt-2 text-slate-400">View system roles and permissions</p>
        </div>
      </div>

      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
        {roles.map((role) => (
          <div key={role.id} className="rounded-xl border border-slate-800 bg-slate-900/50 p-6 backdrop-blur-sm transition-all hover:border-emerald-500/30">
            <h3 className="text-xl font-semibold text-white uppercase">{role.name.replace('_', ' ')}</h3>
            <p className="mt-2 text-sm text-slate-400">
              {role.description || 'System role for managing specific operations.'}
            </p>
            <div className="mt-6">
              <button className="text-sm font-medium text-emerald-400 hover:text-emerald-300 transition-colors">
                View Permissions →
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
