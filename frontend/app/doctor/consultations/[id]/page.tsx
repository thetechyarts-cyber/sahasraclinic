'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { api } from '@/lib/api-client';

const calculateAge = (dob: string) => {
  if (!dob) return '-';
  const diffMs = Date.now() - new Date(dob).getTime();
  const ageDt = new Date(diffMs);
  return Math.abs(ageDt.getUTCFullYear() - 1970);
};

export default function ConsultationPage({ params }: { params: { id: string } }) {
  const router = useRouter();
  const [consultation, setConsultation] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  
  const [formData, setFormData] = useState({
    notes: '',
    diagnosis: '',
    followup_date: '',
  });

  const [prognosisData, setPrognosisData] = useState({
    recovery_status: 'stable',
    mood: 'neutral',
    wellbeing_score: 5,
    progress_notes: '',
    followup_date: '',
  });
  const [savingPrognosis, setSavingPrognosis] = useState(false);

  useEffect(() => {
    const fetchConsultation = async () => {
      try {
        const { data } = await api.get(`/consultations/${params.id}`);
        setConsultation(data.data);
        setFormData({
          notes: data.data.notes || '',
          diagnosis: data.data.diagnosis || '',
          followup_date: data.data.followup_date || '',
        });
      } catch (err) {
        console.error('Failed to fetch consultation', err);
      } finally {
        setLoading(false);
      }
    };
    fetchConsultation();
  }, [params.id]);

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    try {
      await api.put(`/consultations/${params.id}`, formData);
      alert('Consultation notes saved.');
    } catch (err) {
      console.error('Failed to save', err);
      alert('Failed to save notes.');
    } finally {
      setSaving(false);
    }
  };

  const handleSavePrognosis = async (e: React.FormEvent) => {
    e.preventDefault();
    setSavingPrognosis(true);
    try {
      await api.post('/prognosis', {
        patient_id: consultation.patient_id,
        recovery_status: prognosisData.recovery_status,
        mood: prognosisData.mood,
        wellbeing_score: Number(prognosisData.wellbeing_score),
        progress_notes: prognosisData.progress_notes,
        followup_date: prognosisData.followup_date || undefined,
      });
      alert('Prognosis logged successfully.');
      setPrognosisData({ recovery_status: 'stable', mood: 'neutral', wellbeing_score: 5, progress_notes: '', followup_date: '' });
    } catch (err) {
      console.error('Failed to save prognosis', err);
      alert('Failed to log prognosis.');
    } finally {
      setSavingPrognosis(false);
    }
  };

  const handleComplete = async () => {
    if (!confirm('Are you sure you want to complete this consultation?')) return;
    setSaving(true);
    try {
      await api.put(`/consultations/${params.id}`, { status: 'completed' });
      if (consultation.queue_token_id) {
        await api.put(`/queue/tokens/${consultation.queue_token_id}/status`, { status: 'completed' });
      }
      alert('Consultation completed successfully.');
      router.push('/doctor/dashboard');
    } catch (err) {
      console.error('Failed to complete consultation', err);
      alert('Failed to complete consultation.');
      setSaving(false);
    }
  };

  if (loading) return <div className="p-8 text-white">Loading consultation...</div>;
  if (!consultation) return <div className="p-8 text-white">Consultation not found</div>;

  const caseSheet = consultation.case_sheets;
  const femaleData = caseSheet?.female_case_sheets?.[0];

  return (
    <div className="p-8">
      <div className="mb-8 flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-white">Consultation: {consultation.patient_profiles?.users?.name}</h1>
          <p className="mt-2 text-slate-400">Record notes, diagnosis, and issue prescriptions</p>
        </div>
        <div className="flex gap-4">
          <Link 
            href={`/doctor/consultations/${params.id}/prescription/new`}
            className="rounded-lg bg-emerald-500 px-6 py-2.5 text-sm font-semibold text-white shadow-lg shadow-emerald-500/25 transition-all hover:bg-emerald-400">
            + Create Prescription
          </Link>
          <button 
            onClick={handleComplete}
            disabled={saving}
            className="rounded-lg bg-indigo-500 px-6 py-2.5 text-sm font-semibold text-white shadow-lg shadow-indigo-500/25 transition-all hover:bg-indigo-400 disabled:opacity-50">
            Complete Consultation
          </button>
        </div>
      </div>

      <div className="mb-6 rounded-xl border border-slate-800 bg-slate-900/50 p-6 flex flex-wrap gap-6 items-center text-sm">
        <div className="flex flex-col">
          <span className="text-slate-400">Reg ID</span>
          <span className="font-semibold text-white">{consultation.patient_profiles?.registration_id || '-'}</span>
        </div>
        <div className="flex flex-col">
          <span className="text-slate-400">Age</span>
          <span className="font-semibold text-white">{calculateAge(consultation.patient_profiles?.dob)} yrs</span>
        </div>
        <div className="flex flex-col">
          <span className="text-slate-400">Gender</span>
          <span className="font-semibold text-white capitalize">{consultation.patient_profiles?.gender || '-'}</span>
        </div>
        <div className="flex flex-col">
          <span className="text-slate-400">Phone</span>
          <span className="font-semibold text-white">{consultation.patient_profiles?.phone || '-'}</span>
        </div>
      </div>

      <div className="grid gap-8 lg:grid-cols-2">
        {/* Left Column: Case Sheet Data */}
        <div className="space-y-6">
          <div className="rounded-xl border border-slate-800 bg-slate-900/50 p-6 backdrop-blur-sm">
            <h3 className="mb-4 text-sm font-semibold text-emerald-400 uppercase tracking-wider border-b border-slate-800 pb-2">
              Patient Chief Complaint
            </h3>
            <p className="text-slate-300 whitespace-pre-wrap">{caseSheet?.chief_complaint || 'No complaint provided.'}</p>
          </div>

          {caseSheet?.type === 'female' && femaleData && (
            <div className="rounded-xl border border-pink-500/20 bg-pink-500/5 p-6">
              <h3 className="mb-4 text-sm font-semibold text-pink-400 uppercase tracking-wider border-b border-pink-500/20 pb-2">
                Female Health History
              </h3>
              <dl className="grid gap-4 md:grid-cols-2 text-sm">
                <div>
                  <dt className="text-slate-400">LMP Date</dt>
                  <dd className="font-medium text-white">{femaleData.lmp_date || '-'}</dd>
                </div>
                <div>
                  <dt className="text-slate-400">LMP Details</dt>
                  <dd className="font-medium text-white">{femaleData.lmp_details || '-'}</dd>
                </div>
                <div className="md:col-span-2">
                  <dt className="text-slate-400">Contraceptive History</dt>
                  <dd className="font-medium text-white">{femaleData.contraceptive_history || '-'}</dd>
                </div>
                <div className="md:col-span-2">
                  <dt className="text-slate-400">Notes</dt>
                  <dd className="font-medium text-white">{femaleData.notes || '-'}</dd>
                </div>
              </dl>
            </div>
          )}

          <div className="rounded-xl border border-slate-800 bg-slate-900/50 p-6 backdrop-blur-sm">
            <h3 className="mb-4 text-sm font-semibold text-cyan-400 uppercase tracking-wider border-b border-slate-800 pb-2">
              Uploaded Reports
            </h3>
            {consultation.patient_profiles?.patient_documents?.length > 0 ? (
              <ul className="space-y-3">
                {consultation.patient_profiles.patient_documents.map((doc: any) => (
                  <li key={doc.id} className="flex items-center justify-between bg-slate-800/50 p-3 rounded-lg">
                    <div>
                      <p className="text-sm font-medium text-white">{doc.title || 'Untitled Document'}</p>
                      <p className="text-xs text-slate-400 capitalize">{doc.document_type || 'Unknown Type'}</p>
                    </div>
                    <a href={doc.file_url} target="_blank" rel="noreferrer" className="text-sm font-semibold text-emerald-400 hover:text-emerald-300">
                      View
                    </a>
                  </li>
                ))}
              </ul>
            ) : (
              <p className="text-sm text-slate-400">No reports uploaded.</p>
            )}
          </div>
        </div>

        {/* Right Column: Doctor Notes */}
        <div className="rounded-xl border border-slate-800 bg-slate-900/50 p-6 backdrop-blur-sm">
          <h3 className="mb-6 text-sm font-semibold text-white uppercase tracking-wider border-b border-slate-800 pb-2">
            Clinical Notes
          </h3>
          <form onSubmit={handleSave} className="space-y-6">
            <div>
              <label className="mb-2 block text-sm font-medium text-slate-300">Observation Notes</label>
              <textarea 
                rows={4}
                value={formData.notes}
                onChange={(e) => setFormData({...formData, notes: e.target.value})}
                className="w-full rounded-lg border border-slate-700 bg-slate-800/50 px-4 py-3 text-sm text-white focus:border-emerald-500 outline-none"
                placeholder="Enter clinical observations..."
              />
            </div>
            <div>
              <label className="mb-2 block text-sm font-medium text-slate-300">Diagnosis</label>
              <input 
                type="text"
                value={formData.diagnosis}
                onChange={(e) => setFormData({...formData, diagnosis: e.target.value})}
                className="w-full rounded-lg border border-slate-700 bg-slate-800/50 px-4 py-2.5 text-sm text-white focus:border-emerald-500 outline-none"
                placeholder="E.g., Viral Pharyngitis"
              />
            </div>
            <div>
              <label className="mb-2 block text-sm font-medium text-slate-300">Follow-up Date (Optional)</label>
              <input 
                type="date"
                value={formData.followup_date}
                onChange={(e) => setFormData({...formData, followup_date: e.target.value})}
                className="w-full rounded-lg border border-slate-700 bg-slate-800/50 px-4 py-2.5 text-sm text-white focus:border-emerald-500 outline-none"
              />
            </div>
            <div className="flex justify-end pt-4">
              <button 
                type="submit" 
                disabled={saving}
                className="rounded-lg bg-slate-700 px-6 py-2.5 text-sm font-semibold text-white transition-all hover:bg-slate-600 disabled:opacity-50">
                {saving ? 'Saving...' : 'Save Notes'}
              </button>
            </div>
          </form>
        </div>

        {/* Prognosis Log */}
        <div className="rounded-xl border border-slate-800 bg-slate-900/50 p-6 backdrop-blur-sm">
          <h3 className="mb-6 text-sm font-semibold text-indigo-400 uppercase tracking-wider border-b border-slate-800 pb-2">
            Log Prognosis & Follow-Up
          </h3>
          <form onSubmit={handleSavePrognosis} className="space-y-6">
            <div className="grid gap-6 md:grid-cols-2">
              <div>
                <label className="mb-2 block text-sm font-medium text-slate-300">Recovery Status</label>
                <select 
                  value={prognosisData.recovery_status}
                  onChange={(e) => setPrognosisData({...prognosisData, recovery_status: e.target.value})}
                  className="w-full rounded-lg border border-slate-700 bg-slate-800/50 px-4 py-2.5 text-sm text-white focus:border-emerald-500 outline-none"
                >
                  <option value="improving">Improving</option>
                  <option value="stable">Stable</option>
                  <option value="deteriorating">Deteriorating</option>
                  <option value="recovered">Recovered</option>
                </select>
              </div>
              <div>
                <label className="mb-2 block text-sm font-medium text-slate-300">Patient Mood</label>
                <select 
                  value={prognosisData.mood}
                  onChange={(e) => setPrognosisData({...prognosisData, mood: e.target.value})}
                  className="w-full rounded-lg border border-slate-700 bg-slate-800/50 px-4 py-2.5 text-sm text-white focus:border-emerald-500 outline-none"
                >
                  <option value="good">Good</option>
                  <option value="neutral">Neutral</option>
                  <option value="poor">Poor</option>
                </select>
              </div>
            </div>
            
            <div className="grid gap-6 md:grid-cols-2">
              <div>
                <label className="mb-2 block text-sm font-medium text-slate-300">Wellbeing Score (1-10)</label>
                <input 
                  type="number"
                  min="1" max="10"
                  value={prognosisData.wellbeing_score}
                  onChange={(e) => setPrognosisData({...prognosisData, wellbeing_score: parseInt(e.target.value) || 5})}
                  className="w-full rounded-lg border border-slate-700 bg-slate-800/50 px-4 py-2.5 text-sm text-white focus:border-emerald-500 outline-none"
                />
              </div>
              <div>
                <label className="mb-2 block text-sm font-medium text-slate-300">Next Follow-up Date</label>
                <input 
                  type="date"
                  value={prognosisData.followup_date}
                  onChange={(e) => setPrognosisData({...prognosisData, followup_date: e.target.value})}
                  className="w-full rounded-lg border border-slate-700 bg-slate-800/50 px-4 py-2.5 text-sm text-white focus:border-emerald-500 outline-none"
                />
              </div>
            </div>

            <div>
              <label className="mb-2 block text-sm font-medium text-slate-300">Progress Notes *</label>
              <textarea 
                required
                rows={3}
                value={prognosisData.progress_notes}
                onChange={(e) => setPrognosisData({...prognosisData, progress_notes: e.target.value})}
                className="w-full rounded-lg border border-slate-700 bg-slate-800/50 px-4 py-3 text-sm text-white focus:border-emerald-500 outline-none"
                placeholder="How is the patient progressing? Any side effects?"
              />
            </div>
            
            <div className="flex justify-end pt-4">
              <button 
                type="submit" 
                disabled={savingPrognosis}
                className="rounded-lg bg-indigo-500 px-6 py-2.5 text-sm font-semibold text-white transition-all hover:bg-indigo-400 disabled:opacity-50">
                {savingPrognosis ? 'Logging...' : 'Log Prognosis'}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}
