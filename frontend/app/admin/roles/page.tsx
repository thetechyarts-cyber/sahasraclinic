'use client';

import { useState, useEffect } from 'react';
import { api } from '@/lib/api-client';

export default function RolesPermissionsPage() {
  const [roles, setRoles] = useState<any[]>([]);
  const [permissions, setPermissions] = useState<any[]>([]);
  const [selectedRole, setSelectedRole] = useState<string | null>(null);
  const [rolePermissions, setRolePermissions] = useState<Set<string>>(new Set());
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [rolesRes, permsRes] = await Promise.all([
          api.get('/roles'),
          api.get('/roles/permissions')
        ]);
        setRoles(rolesRes.data.data);
        setPermissions(permsRes.data.data);
        if (rolesRes.data.data.length > 0) {
          handleSelectRole(rolesRes.data.data[0].id);
        }
      } catch (err) {
        console.error('Failed to fetch roles or permissions', err);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, []);

  const handleSelectRole = async (roleId: string) => {
    setSelectedRole(roleId);
    try {
      const { data } = await api.get(`/roles/${roleId}/permissions`);
      setRolePermissions(new Set(data.data));
    } catch (err) {
      console.error('Failed to fetch role permissions', err);
    }
  };

  const handleTogglePermission = (permissionId: string) => {
    setRolePermissions(prev => {
      const newSet = new Set(prev);
      if (newSet.has(permissionId)) {
        newSet.delete(permissionId);
      } else {
        newSet.add(permissionId);
      }
      return newSet;
    });
  };

  const handleSave = async () => {
    if (!selectedRole) return;
    setSaving(true);
    try {
      await api.put(`/roles/${selectedRole}/permissions`, {
        permissions: Array.from(rolePermissions)
      });
      alert('Permissions saved successfully!');
    } catch (err: any) {
      alert(err.response?.data?.error || 'Failed to save permissions');
    } finally {
      setSaving(false);
    }
  };

  if (loading) return <div className="p-8 text-slate-400">Loading roles...</div>;

  // Group permissions by module
  const permissionsByModule = permissions.reduce((acc, perm) => {
    if (!acc[perm.module]) acc[perm.module] = [];
    acc[perm.module].push(perm);
    return acc;
  }, {} as Record<string, any[]>);

  return (
    <div className="p-8">
      <div className="mb-8">
        <h1 className="text-3xl font-bold bg-gradient-to-r from-emerald-400 to-cyan-400 bg-clip-text text-transparent">
          Roles & Permissions
        </h1>
        <p className="mt-2 text-slate-400">Manage access controls and configure RBAC dynamically</p>
      </div>

      <div className="flex flex-col lg:flex-row gap-8">
        {/* Roles List */}
        <div className="lg:w-1/3">
          <div className="rounded-xl border border-slate-800 bg-slate-900/50 backdrop-blur-sm overflow-hidden">
            <div className="px-6 py-4 border-b border-slate-800 bg-slate-800/25">
              <h2 className="font-semibold text-white">System Roles</h2>
            </div>
            <div className="divide-y divide-slate-800/50">
              {roles.map(role => (
                <button
                  key={role.id}
                  onClick={() => handleSelectRole(role.id)}
                  className={`w-full text-left px-6 py-4 transition-colors hover:bg-slate-800/50 ${
                    selectedRole === role.id ? 'bg-emerald-500/10 border-l-2 border-emerald-500' : 'border-l-2 border-transparent'
                  }`}
                >
                  <div className={`font-medium ${selectedRole === role.id ? 'text-emerald-400' : 'text-white'}`}>
                    {role.name.replace('_', ' ').toUpperCase()}
                  </div>
                  <div className="text-xs text-slate-500 mt-1">{role.description}</div>
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Permissions Grid */}
        <div className="lg:w-2/3">
          <div className="rounded-xl border border-slate-800 bg-slate-900/50 backdrop-blur-sm p-6">
            <div className="flex items-center justify-between mb-8 border-b border-slate-800 pb-4">
              <h2 className="text-xl font-bold text-white">
                Configure Access
              </h2>
              <button
                onClick={handleSave}
                disabled={saving}
                className="rounded-lg bg-emerald-500 px-6 py-2 text-sm font-semibold text-white shadow-lg shadow-emerald-500/25 transition-all hover:bg-emerald-400 disabled:opacity-50"
              >
                {saving ? 'Saving...' : 'Save Permissions'}
              </button>
            </div>

            <div className="grid gap-8">
              {Object.entries(permissionsByModule).map(([module, perms]) => (
                <div key={module}>
                  <h3 className="text-sm font-semibold text-slate-300 uppercase tracking-wider mb-4">
                    {module} Module
                  </h3>
                  <div className="grid gap-4 sm:grid-cols-2">
                    {perms.map((perm) => (
                      <label 
                        key={perm.id}
                        className={`flex items-start gap-3 p-4 rounded-lg border cursor-pointer transition-colors ${
                          rolePermissions.has(perm.id)
                            ? 'bg-emerald-500/5 border-emerald-500/30'
                            : 'bg-slate-800/30 border-slate-700/50 hover:bg-slate-800'
                        }`}
                      >
                        <div className="flex h-5 items-center">
                          <input
                            type="checkbox"
                            checked={rolePermissions.has(perm.id)}
                            onChange={() => handleTogglePermission(perm.id)}
                            className="h-4 w-4 rounded border-slate-600 bg-slate-700 text-emerald-500 focus:ring-emerald-500 focus:ring-offset-slate-900"
                          />
                        </div>
                        <div className="flex flex-col">
                          <span className={`text-sm font-medium ${rolePermissions.has(perm.id) ? 'text-emerald-400' : 'text-slate-300'}`}>
                            {perm.name}
                          </span>
                          <span className="text-xs text-slate-500 mt-0.5">
                            Allows access to {perm.name.replace(/_/g, ' ')} features
                          </span>
                        </div>
                      </label>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
