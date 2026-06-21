'use client';

import { useState, useEffect } from 'react';
import { api } from '@/lib/api-client';

interface CmsContent {
  id: string;
  type: string;
  title: string;
  content: any;
  status: string;
  updated_at: string;
}

export default function CMSPage() {
  const [contents, setContents] = useState<CmsContent[]>([]);
  const [loading, setLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  
  const [formData, setFormData] = useState({
    type: 'testimonial',
    title: '',
    content: '{}',
    status: 'draft'
  });

  const fetchContents = async () => {
    try {
      const { data } = await api.get('/cms');
      setContents(data.data);
    } catch (err) {
      console.error('Failed to fetch CMS content', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchContents();
  }, []);

  const handleOpenModal = (content?: CmsContent) => {
    if (content) {
      setEditingId(content.id);
      setFormData({
        type: content.type,
        title: content.title,
        content: JSON.stringify(content.content, null, 2),
        status: content.status
      });
    } else {
      setEditingId(null);
      setFormData({
        type: 'testimonial',
        title: '',
        content: '{\n  "body": "Great hospital!",\n  "author": "John Doe"\n}',
        status: 'draft'
      });
    }
    setIsModalOpen(true);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const payload = {
        ...formData,
        content: JSON.parse(formData.content)
      };

      if (editingId) {
        await api.put(`/cms/${editingId}`, payload);
      } else {
        await api.post('/cms', payload);
      }
      
      setIsModalOpen(false);
      fetchContents();
    } catch (err: any) {
      alert(err.response?.data?.error || 'Failed to save content. Ensure JSON is valid.');
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Are you sure you want to delete this content?')) return;
    try {
      await api.delete(`/cms/${id}`);
      fetchContents();
    } catch (err: any) {
      alert(err.response?.data?.error || 'Failed to delete content');
    }
  };

  if (loading) return <div className="p-8 text-slate-400">Loading CMS...</div>;

  return (
    <div className="p-8">
      <div className="mb-8 flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold bg-gradient-to-r from-emerald-400 to-cyan-400 bg-clip-text text-transparent">
            Content Management
          </h1>
          <p className="mt-2 text-slate-400">Manage landing page content and testimonials</p>
        </div>
        <button 
          onClick={() => handleOpenModal()}
          className="rounded-lg bg-emerald-500 px-4 py-2 text-sm font-semibold text-white shadow-lg shadow-emerald-500/25 transition-all hover:bg-emerald-400"
        >
          + Add Content
        </button>
      </div>

      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
        {contents.length === 0 ? (
          <div className="col-span-full py-12 text-center text-slate-500 bg-slate-900/50 rounded-xl border border-slate-800">
            No content found. Start by adding some!
          </div>
        ) : (
          contents.map((item) => (
            <div key={item.id} className="rounded-xl border border-slate-800 bg-slate-900/50 p-6 backdrop-blur-sm flex flex-col">
              <div className="flex justify-between items-start mb-4 border-b border-slate-800 pb-4">
                <div>
                  <span className="inline-block px-2 py-1 bg-slate-800 text-xs font-medium text-slate-300 rounded uppercase tracking-wider mb-2">
                    {item.type}
                  </span>
                  <h3 className="font-semibold text-white text-lg truncate">{item.title}</h3>
                </div>
                <span className={`px-2 py-1 rounded text-xs font-medium ${
                  item.status === 'published' ? 'bg-emerald-500/10 text-emerald-400' : 'bg-amber-500/10 text-amber-400'
                }`}>
                  {item.status}
                </span>
              </div>
              
              <div className="flex-1 mb-6">
                <pre className="text-xs text-slate-400 bg-slate-950 p-3 rounded-lg overflow-x-auto h-32">
                  {JSON.stringify(item.content, null, 2)}
                </pre>
              </div>

              <div className="flex justify-between items-center pt-4 border-t border-slate-800">
                <span className="text-xs text-slate-500">
                  {new Date(item.updated_at).toLocaleDateString()}
                </span>
                <div className="flex gap-3">
                  <button onClick={() => handleOpenModal(item)} className="text-emerald-400 hover:text-emerald-300 text-sm font-medium transition-colors">Edit</button>
                  <button onClick={() => handleDelete(item.id)} className="text-red-400 hover:text-red-300 text-sm font-medium transition-colors">Delete</button>
                </div>
              </div>
            </div>
          ))
        )}
      </div>

      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4">
          <div className="w-full max-w-2xl rounded-xl border border-slate-800 bg-slate-900 p-6 shadow-2xl overflow-y-auto max-h-[90vh]">
            <h2 className="text-xl font-bold text-white mb-6 border-b border-slate-800 pb-4">
              {editingId ? 'Edit Content' : 'Add New Content'}
            </h2>
            
            <form onSubmit={handleSubmit} className="space-y-5">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-slate-300 mb-1">Content Type</label>
                  <select 
                    required 
                    value={formData.type}
                    onChange={e => setFormData({...formData, type: e.target.value})}
                    className="w-full rounded-lg border border-slate-700 bg-slate-800 p-2.5 text-white focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500"
                  >
                    <option value="testimonial">Testimonial</option>
                    <option value="announcement">Announcement</option>
                    <option value="hero_section">Hero Section</option>
                    <option value="footer_info">Footer Info</option>
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-slate-300 mb-1">Status</label>
                  <select 
                    required 
                    value={formData.status}
                    onChange={e => setFormData({...formData, status: e.target.value})}
                    className="w-full rounded-lg border border-slate-700 bg-slate-800 p-2.5 text-white focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500"
                  >
                    <option value="draft">Draft</option>
                    <option value="published">Published</option>
                    <option value="archived">Archived</option>
                  </select>
                </div>
              </div>
              
              <div>
                <label className="block text-sm font-medium text-slate-300 mb-1">Title (Internal or Displayed)</label>
                <input 
                  required 
                  type="text" 
                  value={formData.title}
                  onChange={e => setFormData({...formData, title: e.target.value})}
                  className="w-full rounded-lg border border-slate-700 bg-slate-800 p-2.5 text-white focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500" 
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-slate-300 mb-1 flex justify-between">
                  <span>JSON Content Data</span>
                  <span className="text-xs text-slate-500">Must be valid JSON</span>
                </label>
                <textarea 
                  required 
                  rows={8}
                  value={formData.content}
                  onChange={e => setFormData({...formData, content: e.target.value})}
                  className="w-full rounded-lg border border-slate-700 bg-slate-950 p-4 text-emerald-400 font-mono text-sm focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500" 
                />
              </div>

              <div className="mt-8 flex justify-end gap-3 pt-6 border-t border-slate-800">
                <button 
                  type="button" 
                  onClick={() => setIsModalOpen(false)}
                  className="px-4 py-2 rounded-lg text-slate-300 hover:text-white transition-colors"
                >
                  Cancel
                </button>
                <button 
                  type="submit" 
                  className="px-6 py-2 rounded-lg bg-emerald-500 text-white font-medium hover:bg-emerald-400 transition-colors shadow-lg shadow-emerald-500/25"
                >
                  {editingId ? 'Update Content' : 'Save Content'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
