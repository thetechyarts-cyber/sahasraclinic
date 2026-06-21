'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { api } from '@/lib/api-client';
import { useAuth } from '@/providers/auth-provider';

interface MedicineEntry {
  name: string;
  dosage: string;
  frequency: string;
  duration: string;
  instructions: string;
}

export default function NewPrescriptionPage({ params }: { params: { id: string } }) {
  const router = useRouter();
  const { user } = useAuth();
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [previewMode, setPreviewMode] = useState(false);
  const [patientId, setPatientId] = useState('');
  const [patientName, setPatientName] = useState('');

  const [medicines, setMedicines] = useState<MedicineEntry[]>([
    { name: '', dosage: '', frequency: '', duration: '', instructions: '' }
  ]);
  const [notes, setNotes] = useState('');

  useEffect(() => {
    const fetchConsultation = async () => {
      try {
        const { data } = await api.get(`/consultations/${params.id}`);
        setPatientId(data.data.patient_id);
        setPatientName(data.data.patient_profiles?.users?.name);
      } catch (err) {
        console.error('Failed to fetch consultation', err);
      } finally {
        setLoading(false);
      }
    };
    fetchConsultation();
  }, [params.id]);

  const addMedicine = () => {
    setMedicines([...medicines, { name: '', dosage: '', frequency: '', duration: '', instructions: '' }]);
  };

  const removeMedicine = (index: number) => {
    const newMeds = [...medicines];
    newMeds.splice(index, 1);
    setMedicines(newMeds);
  };

  const updateMedicine = (index: number, field: keyof MedicineEntry, value: string) => {
    const newMeds = [...medicines];
    newMeds[index][field] = value;
    setMedicines(newMeds);
  };

  const handlePreview = (e: React.FormEvent) => {
    e.preventDefault();
    if (medicines.some(m => !m.name || !m.dosage || !m.frequency || !m.duration)) {
      alert('Please fill out all required fields for each medicine.');
      return;
    }
    setPreviewMode(true);
  };

  const handleSubmit = async () => {

    setSubmitting(true);
    try {
      await api.post('/prescriptions', {
        consultation_id: params.id,
        patient_id: patientId,
        medicines,
        notes,
      });
      alert('Prescription created successfully!');
      router.push('/doctor/dashboard'); // Or back to consultation list
    } catch (err) {
      console.error('Failed to submit prescription', err);
      alert('Failed to submit prescription');
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) return <div className="p-8 text-white">Loading...</div>;

  return (
    <div className="p-8 max-w-5xl mx-auto">
      <div className="mb-8 flex items-center justify-between">
        <div>
          <div className="flex items-center gap-3 mb-2">
            <Link href={`/doctor/consultations/${params.id}`} className="text-emerald-400 hover:text-emerald-300 text-sm font-medium">
              &larr; Back to Consultation
            </Link>
          </div>
          <h1 className="text-3xl font-bold text-white">New Prescription</h1>
          <p className="mt-1 text-slate-400">Patient: <span className="font-medium text-white">{patientName}</span></p>
        </div>
      </div>

      <div className="rounded-xl border border-slate-800 bg-slate-900/50 p-6 backdrop-blur-sm">
        {!previewMode ? (
          <form onSubmit={handlePreview} className="space-y-8">
          <div>
            <div className="flex items-center justify-between border-b border-slate-800 pb-4 mb-6">
              <h2 className="text-lg font-semibold text-white">Medicines</h2>
              <button 
                type="button" 
                onClick={addMedicine}
                className="rounded-lg bg-slate-800 px-4 py-2 text-sm font-medium text-emerald-400 hover:bg-slate-700">
                + Add Medicine
              </button>
            </div>

            <div className="space-y-6">
              {medicines.map((med, index) => (
                <div key={index} className="relative rounded-lg border border-slate-800 bg-slate-950/50 p-5">
                  {medicines.length > 1 && (
                    <button 
                      type="button" 
                      onClick={() => removeMedicine(index)}
                      className="absolute right-4 top-4 text-slate-500 hover:text-red-400">
                      &times; Remove
                    </button>
                  )}
                  
                  <div className="grid gap-4 md:grid-cols-4">
                    <div className="md:col-span-4">
                      <label className="mb-1.5 block text-sm font-medium text-slate-300">Medicine Name *</label>
                      <input 
                        required
                        type="text" 
                        value={med.name} 
                        onChange={(e) => updateMedicine(index, 'name', e.target.value)}
                        placeholder="e.g. Paracetamol 500mg"
                        className="w-full rounded-lg border border-slate-700 bg-slate-800/50 px-4 py-2.5 text-sm text-white focus:border-emerald-500 outline-none" 
                      />
                    </div>
                    <div>
                      <label className="mb-1.5 block text-sm font-medium text-slate-300">Dosage *</label>
                      <input 
                        required
                        type="text" 
                        value={med.dosage} 
                        onChange={(e) => updateMedicine(index, 'dosage', e.target.value)}
                        placeholder="e.g. 1 Tablet"
                        className="w-full rounded-lg border border-slate-700 bg-slate-800/50 px-4 py-2.5 text-sm text-white focus:border-emerald-500 outline-none" 
                      />
                    </div>
                    <div>
                      <label className="mb-1.5 block text-sm font-medium text-slate-300">Frequency *</label>
                      <input 
                        required
                        type="text" 
                        value={med.frequency} 
                        onChange={(e) => updateMedicine(index, 'frequency', e.target.value)}
                        placeholder="e.g. 1-0-1 (Morning & Night)"
                        className="w-full rounded-lg border border-slate-700 bg-slate-800/50 px-4 py-2.5 text-sm text-white focus:border-emerald-500 outline-none" 
                      />
                    </div>
                    <div>
                      <label className="mb-1.5 block text-sm font-medium text-slate-300">Duration *</label>
                      <input 
                        required
                        type="text" 
                        value={med.duration} 
                        onChange={(e) => updateMedicine(index, 'duration', e.target.value)}
                        placeholder="e.g. 5 Days"
                        className="w-full rounded-lg border border-slate-700 bg-slate-800/50 px-4 py-2.5 text-sm text-white focus:border-emerald-500 outline-none" 
                      />
                    </div>
                    <div>
                      <label className="mb-1.5 block text-sm font-medium text-slate-300">Instructions</label>
                      <input 
                        type="text" 
                        value={med.instructions} 
                        onChange={(e) => updateMedicine(index, 'instructions', e.target.value)}
                        placeholder="e.g. After food"
                        className="w-full rounded-lg border border-slate-700 bg-slate-800/50 px-4 py-2.5 text-sm text-white focus:border-emerald-500 outline-none" 
                      />
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          <div className="pt-6 border-t border-slate-800">
            <label className="mb-2 block text-sm font-medium text-slate-300">Additional Advice / Notes</label>
            <textarea 
              rows={3}
              value={notes} 
              onChange={(e) => setNotes(e.target.value)}
              placeholder="Drink plenty of water, avoid spicy food..."
              className="w-full rounded-lg border border-slate-700 bg-slate-800/50 px-4 py-3 text-sm text-white focus:border-emerald-500 outline-none" 
            />
          </div>

          <div className="flex justify-end pt-4">
            <button 
              type="submit" 
              className="rounded-lg bg-emerald-500 px-8 py-3 text-sm font-semibold text-white shadow-lg shadow-emerald-500/25 transition-all hover:bg-emerald-400">
              Preview Prescription
            </button>
          </div>
        </form>
        ) : (
          <div className="space-y-8">
            <div className="rounded-lg bg-white p-8 text-slate-900 mx-auto max-w-3xl">
              <div className="border-b-2 border-slate-200 pb-6 mb-6">
                <h2 className="text-2xl font-bold text-slate-800">Sahasra Clinic</h2>
                <p className="text-slate-500">Dr. {user?.name || 'Doctor'}</p>
                <div className="mt-4 flex justify-between text-sm">
                  <p><strong>Patient:</strong> {patientName}</p>
                  <p><strong>Date:</strong> {new Date().toLocaleDateString()}</p>
                </div>
              </div>
              <div className="mb-6">
                <h3 className="text-lg font-bold border-b border-slate-200 pb-2 mb-4">Rx</h3>
                <ul className="space-y-4">
                  {medicines.map((med, index) => (
                    <li key={index} className="flex flex-col">
                      <span className="font-semibold">{index + 1}. {med.name} - {med.dosage}</span>
                      <span className="text-sm text-slate-600 ml-4">Sig: {med.frequency} for {med.duration}</span>
                      {med.instructions && <span className="text-sm text-slate-500 ml-4 italic">{med.instructions}</span>}
                    </li>
                  ))}
                </ul>
              </div>
              {notes && (
                <div className="mb-6">
                  <h3 className="text-lg font-bold border-b border-slate-200 pb-2 mb-2">Advice</h3>
                  <p className="text-sm whitespace-pre-wrap">{notes}</p>
                </div>
              )}
            </div>
            
            <div className="flex justify-end gap-4 pt-4 border-t border-slate-800">
              <button 
                type="button" 
                disabled={submitting}
                onClick={() => setPreviewMode(false)}
                className="rounded-lg border border-slate-700 bg-slate-800 px-8 py-3 text-sm font-semibold text-white transition-all hover:bg-slate-700 disabled:opacity-50">
                Edit
              </button>
              <button 
                type="button" 
                onClick={handleSubmit}
                disabled={submitting}
                className="rounded-lg bg-emerald-500 px-8 py-3 text-sm font-semibold text-white shadow-lg shadow-emerald-500/25 transition-all hover:bg-emerald-400 disabled:opacity-50">
                {submitting ? 'Generating...' : 'Finalize & Sign Prescription'}
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
