'use client';

import { useState, useEffect } from 'react';
import { api } from '@/lib/api-client';

interface AuditLog {
  id: string;
  action: string;
  module: string;
  entity_id: string;
  metadata: any;
  created_at: string;
  users: {
    name: string;
    email: string;
  };
}

export default function AuditLogsPage() {
  const [logs, setLogs] = useState<AuditLog[]>([]);
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(1);
  const [hasMore, setHasMore] = useState(false);

  const fetchLogs = async (pageNum: number) => {
    try {
      setLoading(true);
      const { data } = await api.get(`/audit?page=${pageNum}&limit=50`);
      if (pageNum === 1) {
        setLogs(data.data.items || []);
      } else {
        setLogs(prev => [...prev, ...(data.data.items || [])]);
      }
      setHasMore(data.data.hasMore);
    } catch (err) {
      console.error('Failed to fetch audit logs', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchLogs(1);
  }, []);

  const loadMore = () => {
    const nextPage = page + 1;
    setPage(nextPage);
    fetchLogs(nextPage);
  };

  return (
    <div className="p-8">
      <div className="mb-8">
        <h1 className="text-3xl font-bold bg-gradient-to-r from-emerald-400 to-cyan-400 bg-clip-text text-transparent">
          System Audit Logs
        </h1>
        <p className="mt-2 text-slate-400">View all system activities and record changes</p>
      </div>

      <div className="rounded-xl border border-slate-800 bg-slate-900/50 backdrop-blur-sm overflow-hidden">
        <table className="w-full text-left text-sm text-slate-400">
          <thead className="bg-slate-800/50 text-xs uppercase text-slate-300">
            <tr>
              <th className="px-6 py-4 font-medium">Timestamp</th>
              <th className="px-6 py-4 font-medium">User</th>
              <th className="px-6 py-4 font-medium">Action</th>
              <th className="px-6 py-4 font-medium">Module</th>
              <th className="px-6 py-4 font-medium">Entity ID</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-800/50">
            {logs.length === 0 && !loading ? (
              <tr>
                <td colSpan={5} className="px-6 py-8 text-center text-slate-500">
                  No audit logs found.
                </td>
              </tr>
            ) : (
              logs.map((log) => (
                <tr key={log.id} className="hover:bg-slate-800/25 transition-colors">
                  <td className="px-6 py-4 whitespace-nowrap">
                    {new Date(log.created_at).toLocaleString()}
                  </td>
                  <td className="px-6 py-4">
                    <div className="font-medium text-white">{log.users?.name || 'System'}</div>
                    <div className="text-xs text-slate-500">{log.users?.email || ''}</div>
                  </td>
                  <td className="px-6 py-4">
                    <span className="inline-flex items-center rounded-md bg-slate-800 px-2.5 py-1 text-xs font-medium text-emerald-400 font-mono">
                      {log.action}
                    </span>
                  </td>
                  <td className="px-6 py-4 uppercase text-xs tracking-wider">{log.module}</td>
                  <td className="px-6 py-4 font-mono text-xs">{log.entity_id || '-'}</td>
                </tr>
              ))
            )}
          </tbody>
        </table>
        
        {loading && (
          <div className="p-8 text-center text-slate-500 animate-pulse">
            Loading logs...
          </div>
        )}
      </div>

      {hasMore && !loading && (
        <div className="mt-6 flex justify-center">
          <button 
            onClick={loadMore}
            className="rounded-lg border border-slate-700 bg-slate-800 px-6 py-2 text-sm font-medium text-slate-300 hover:text-white transition-colors"
          >
            Load More
          </button>
        </div>
      )}
    </div>
  );
}
