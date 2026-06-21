'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { api } from '@/lib/api-client';
import { useAuth } from '@/providers/auth-provider';
import { FileUploader } from '@/components/shared/file-uploader';

export default function NewCaseSheetPage() {
  const { user } = useAuth();
  const router = useRouter();
  
  const [formData, setFormData] = useState({
    chief_complaint: '',
    type: 'online', // default
  });
  
  const [femaleHistory, setFemaleHistory] = useState({
    lmp_date: '',
    lmp_details: '',
    contraceptive_history: '',
    notes: '',
  });

  const [files, setFiles] = useState<File[]>([]);
  const [error, setError] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [showFemaleHistory, setShowFemaleHistory] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) return;
    
    setError('');
    setIsSubmitting(true);

    try {
      // 1. Create the case sheet
      const payload = {
        patient_id: user.id, // Assuming user.id maps to patient_profiles.id in this context
        type: showFemaleHistory ? 'female' : 'online',
        chief_complaint: formData.chief_complaint,
        female_history: showFemaleHistory ? femaleHistory : undefined,
      };

      const { data } = await api.post('/case-sheets', payload);
      const caseSheetId = data.data.id;

      // 2. Upload documents if any
      if (files.length > 0) {
        const formData = new FormData();
        formData.append('patient_id', user.id);
        files.forEach(file => formData.append('files', file));

        await api.post(`/case-sheets/${caseSheetId}/documents`, formData, {
          headers: { 'Content-Type': 'multipart/form-data' }
        });
      }

      router.push('/patient/dashboard');
    } catch (err: any) {
      setError(err.response?.data?.error || 'Failed to submit case sheet');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="p-8">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-white">New Case Sheet</h1>
        <p className="mt-2 text-slate-400">Describe your issue and upload relevant reports</p>
      </div>

      <div className="max-w-3xl rounded-xl border border-slate-800 bg-slate-900/50 p-6 backdrop-blur-sm">
        {error && (
          <div className="mb-6 rounded-lg border border-red-500/20 bg-red-500/10 px-4 py-3 text-sm text-red-400">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-8">
          <div>
            <label className="mb-2 block text-sm font-medium text-slate-300">Chief Complaint (What are you experiencing?)</label>
            <textarea 
              required 
              rows={4}
              value={formData.chief_complaint} 
              onChange={e => setFormData({ ...formData, chief_complaint: e.target.value })}
              placeholder="E.g., Fever and headache since 3 days..."
              className="w-full rounded-lg border border-slate-700 bg-slate-800/50 px-4 py-3 text-sm text-white focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500 outline-none" 
            />
          </div>

          <div className="flex items-center space-x-2">
            <input 
              type="checkbox" 
              id="showFemaleHistory" 
              checked={showFemaleHistory} 
              onChange={(e) => setShowFemaleHistory(e.target.checked)}
              className="h-4 w-4 rounded border-slate-700 bg-slate-800 text-emerald-500 focus:ring-emerald-500 focus:ring-offset-slate-900"
            />
            <label htmlFor="showFemaleHistory" className="text-sm font-medium text-slate-300">
              Include Female Health History
            </label>
          </div>

          {showFemaleHistory && (
            <div className="rounded-xl border border-pink-500/20 bg-pink-500/5 p-6">
              <h3 className="mb-4 text-lg font-medium text-pink-400">Female Health History (Optional)</h3>
              <div className="grid gap-6 md:grid-cols-2">
                <div>
                  <label className="mb-1.5 block text-sm font-medium text-slate-300">Last Menstrual Period (LMP)</label>
                  <input type="date" value={femaleHistory.lmp_date} onChange={e => setFemaleHistory({...femaleHistory, lmp_date: e.target.value})}
                    className="w-full rounded-lg border border-slate-700 bg-slate-800/50 px-4 py-2.5 text-sm text-white focus:border-pink-500 outline-none" />
                </div>
                <div>
                  <label className="mb-1.5 block text-sm font-medium text-slate-300">LMP Details</label>
                  <input type="text" placeholder="Regular/Irregular, heavy flow, etc." value={femaleHistory.lmp_details} onChange={e => setFemaleHistory({...femaleHistory, lmp_details: e.target.value})}
                    className="w-full rounded-lg border border-slate-700 bg-slate-800/50 px-4 py-2.5 text-sm text-white focus:border-pink-500 outline-none" />
                </div>
                <div className="md:col-span-2">
                  <label className="mb-1.5 block text-sm font-medium text-slate-300">Contraceptive History</label>
                  <input type="text" value={femaleHistory.contraceptive_history} onChange={e => setFemaleHistory({...femaleHistory, contraceptive_history: e.target.value})}
                    className="w-full rounded-lg border border-slate-700 bg-slate-800/50 px-4 py-2.5 text-sm text-white focus:border-pink-500 outline-none" />
                </div>
                <div className="md:col-span-2">
                  <label className="mb-1.5 block text-sm font-medium text-slate-300">Additional Notes</label>
                  <textarea rows={2} value={femaleHistory.notes} onChange={e => setFemaleHistory({...femaleHistory, notes: e.target.value})}
                    className="w-full rounded-lg border border-slate-700 bg-slate-800/50 px-4 py-2.5 text-sm text-white focus:border-pink-500 outline-none" />
                </div>
              </div>
            </div>
          )}

          <div>
            <label className="mb-2 block text-sm font-medium text-slate-300">Upload Past Reports / Prescriptions</label>
            <FileUploader onFilesSelected={setFiles} maxFiles={5} />
          </div>

          <div className="flex justify-end border-t border-slate-800 pt-6">
            <button type="submit" disabled={isSubmitting}
              className="rounded-lg bg-emerald-500 px-8 py-3 text-sm font-semibold text-white shadow-lg shadow-emerald-500/25 transition-all hover:bg-emerald-400 disabled:opacity-50">
              {isSubmitting ? 'Submitting...' : 'Submit Case Sheet'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
