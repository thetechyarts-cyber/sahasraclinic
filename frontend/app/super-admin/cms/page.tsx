'use client';

import { useEffect, useState } from 'react';
import { api } from '@/lib/api-client';
import { ApiResponse } from '@/types';
import { Layers, Plus, Pencil, Trash2, RefreshCw } from 'lucide-react';

interface CMSContent {
  id: string;
  type: string;
  title: string;
  content: Record<string, any>;
  status: 'draft' | 'published';
  created_at: string;
}

export default function CMSPage() {
  const [items, setItems] = useState<CMSContent[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  // Form state
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [formData, setFormData] = useState({
    type: 'faq',
    title: '',
    content: '{}',
    status: 'published' as 'draft' | 'published',
  });

  const fetchContent = async () => {
    try {
      setLoading(true);
      setError('');
      // Removing complex generic to prevent SWC parser bug
      const res: any = await api.get('/cms');
      const response = res.data;
      if (response.success) {
        setItems(response.data);
      } else {
        throw new Error(response.message || 'Failed to load CMS content');
      }
    } catch (err: any) {
      const message = err instanceof Error ? err.message : 'Unknown error';
      setError(message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchContent();
  }, []);

  const handleOpenModal = (item?: CMSContent) => {
    if (item) {
      setEditingId(item.id);
      setFormData({
        type: item.type,
        title: item.title,
        content: JSON.stringify(item.content, null, 2),
        status: item.status,
      });
    } else {
      setEditingId(null);
      setFormData({ type: 'faq', title: '', content: '{\n  "question": "",\n  "answer": ""\n}', status: 'published' });
    }
    setIsModalOpen(true);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      setIsSubmitting(true);
      const parsedContent = JSON.parse(formData.content);
      const payload = { ...formData, content: parsedContent };

      if (editingId) {
        await api.put(`/cms/${editingId}`, payload);
      } else {
        await api.post('/cms', payload);
      }
      await fetchContent();
      setIsModalOpen(false);
    } catch (err: any) {
      alert(err instanceof Error ? err.message : 'Invalid JSON or API error');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Are you sure you want to delete this content?')) return;
    try {
      await api.delete(`/cms/${id}`);
      await fetchContent();
    } catch (err: any) {
      alert(err instanceof Error ? err.message : 'Failed to delete');
    }
  };

  const placeholderText = "{\n  \"key\": \"value\"\n}";

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-white flex items-center gap-2">
            <Layers className="h-6 w-6 text-emerald-400" />
            Website Content (CMS)
          </h1>
          <p className="text-slate-400 mt-1">Manage public-facing website content</p>
        </div>
        <div className="flex items-center gap-2">
          <button
            onClick={fetchContent}
            className="rounded-lg bg-slate-800 p-2 text-slate-400 hover:text-white transition-colors"
          >
            <RefreshCw className={`h-5 w-5 ${loading ? 'animate-spin' : ''}`} />
          </button>
          <button
            onClick={() => handleOpenModal()}
            className="flex items-center gap-2 rounded-lg bg-emerald-600 px-4 py-2 text-sm font-medium text-white hover:bg-emerald-500 transition-colors"
          >
            <Plus className="h-4 w-4" />
            Add Content
          </button>
        </div>
      </div>

      {error && (
        <div className="rounded-lg border border-red-500/20 bg-red-500/10 px-4 py-3 text-sm text-red-400">
          {error}
        </div>
      )}

      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
        {loading ? (
          <div className="col-span-full py-12 text-center text-slate-500">
            <RefreshCw className="h-6 w-6 animate-spin mx-auto mb-2" />
            Loading content...
          </div>
        ) : items.length === 0 ? (
          <div className="col-span-full py-12 text-center text-slate-500 bg-slate-900/50 rounded-xl border border-slate-800">
            No content blocks found.
          </div>
        ) : (
          items.map((item) => (
            <div key={item.id} className="bg-slate-900/50 rounded-xl border border-slate-800 p-5 hover:border-slate-700 transition-colors flex flex-col">
              <div className="flex justify-between items-start mb-3">
                <span className="inline-flex items-center rounded-full bg-slate-800 px-2.5 py-0.5 text-xs font-medium text-slate-300 border border-slate-700 uppercase tracking-wider">
                  {item.type}
                </span>
                <span className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium ${item.status === 'published' ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20' : 'bg-amber-500/10 text-amber-400 border border-amber-500/20'}`}>
                  {item.status}
                </span>
              </div>
              <h3 className="text-lg font-semibold text-white mb-2">{item.title}</h3>
              <div className="text-sm text-slate-400 bg-slate-950/50 p-3 rounded-lg flex-1 overflow-auto font-mono max-h-32 mb-4">
                {JSON.stringify(item.content, null, 2)}
              </div>
              <div className="flex items-center justify-between mt-auto pt-4 border-t border-slate-800/50">
                <span className="text-xs text-slate-500">
                  {new Date(item.created_at).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}
                </span>
                <div className="flex items-center gap-2">
                  <button onClick={() => handleOpenModal(item)} className="p-1.5 text-slate-400 hover:text-emerald-400 transition-colors">
                    <Pencil className="h-4 w-4" />
                  </button>
                  <button onClick={() => handleDelete(item.id)} className="p-1.5 text-slate-400 hover:text-red-400 transition-colors">
                    <Trash2 className="h-4 w-4" />
                  </button>
                </div>
              </div>
            </div>
          ))
        )}
      </div>

      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4">
          <div className="bg-slate-900 border border-slate-800 rounded-xl shadow-2xl w-full max-w-2xl overflow-hidden flex flex-col max-h-[90vh]">
            <div className="px-6 py-4 border-b border-slate-800 flex justify-between items-center bg-slate-900/50">
              <h2 className="text-lg font-semibold text-white">{editingId ? 'Edit Content' : 'Add Content'}</h2>
              <button onClick={() => setIsModalOpen(false)} className="text-slate-400 hover:text-white">✕</button>
            </div>
            
            <form onSubmit={handleSubmit} className="flex flex-col overflow-hidden">
              <div className="p-6 space-y-4 overflow-y-auto">
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-1">
                    <label className="text-sm font-medium text-slate-300">Type</label>
                    <select
                      value={formData.type}
                      onChange={(e) => setFormData({ ...formData, type: e.target.value })}
                      disabled={!!editingId}
                      className="w-full rounded-lg bg-slate-950 border border-slate-800 px-3 py-2 text-white focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500 outline-none disabled:opacity-50"
                    >
                      <option value="treatments">Treatments</option>
                      <option value="departments">Departments</option>
                      <option value="doctors">Doctors</option>
                      <option value="testimonials">Testimonials</option>
                      <option value="home">Home Page</option>
                      <option value="faq">FAQ</option>
                      <option value="contact">Contact Info</option>
                      <option value="policies">Policies</option>
                      <option value="hospital_info">Hospital Info</option>
                    </select>
                  </div>
                  
                  <div className="space-y-1">
                    <label className="text-sm font-medium text-slate-300">Status</label>
                    <select
                      value={formData.status}
                      onChange={(e) => setFormData({ ...formData, status: e.target.value as 'draft'|'published' })}
                      className="w-full rounded-lg bg-slate-950 border border-slate-800 px-3 py-2 text-white focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500 outline-none"
                    >
                      <option value="published">Published</option>
                      <option value="draft">Draft</option>
                    </select>
                  </div>
                </div>

                <div className="space-y-1">
                  <label className="text-sm font-medium text-slate-300">Title / Identifier</label>
                  <input
                    required
                    value={formData.title}
                    onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                    className="w-full rounded-lg bg-slate-950 border border-slate-800 px-3 py-2 text-white placeholder-slate-500 focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500 outline-none"
                    placeholder="e.g. Opening Hours"
                  />
                </div>

                <div className="space-y-1">
                  <label className="text-sm font-medium text-slate-300">Content (JSON Data)</label>
                  <textarea
                    required
                    rows={8}
                    value={formData.content}
                    onChange={(e) => setFormData({ ...formData, content: e.target.value })}
                    className="w-full rounded-lg bg-slate-950 border border-slate-800 px-3 py-2 text-white font-mono text-sm placeholder-slate-500 focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500 outline-none"
                    placeholder={placeholderText}
                  />
                </div>
              </div>

              <div className="px-6 py-4 border-t border-slate-800 bg-slate-900/50 flex justify-end gap-3 mt-auto">
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="px-4 py-2 text-sm font-medium text-slate-300 hover:text-white transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="rounded-lg bg-emerald-600 px-6 py-2 text-sm font-medium text-white hover:bg-emerald-500 transition-colors disabled:opacity-50"
                >
                  {isSubmitting ? 'Saving...' : 'Save Content'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
