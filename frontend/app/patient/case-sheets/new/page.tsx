'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { api } from '@/lib/api-client';
import { useAuth } from '@/providers/auth-provider';

export default function NewCaseSheetPage() {
  const router = useRouter();
  const { user } = useAuth();
  
  const [step, setStep] = useState(1);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isFemale, setIsFemale] = useState(false); // Can be auto-detected from profile in real app
  
  const [formData, setFormData] = useState({
    chief_complaint: '',
    history: { past_illness: '', allergies: '' },
    vitals: { weight: '', height: '' },
    female_history: {
      lmp_date: '',
      notes: ''
    }
  });

  const handleNext = () => setStep(s => s + 1);
  const handlePrev = () => setStep(s => s - 1);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) return;
    setIsSubmitting(true);

    try {
      const payload = {
        patient_id: user.id,
        type: 'online', // Patients using this flow are creating online case sheets
        chief_complaint: formData.chief_complaint,
        history: formData.history,
        vitals: formData.vitals,
        ...(isFemale ? { female_history: formData.female_history } : {})
      };

      const { data } = await api.post('/case-sheets', payload);
      
      // If it's an online case sheet, we should get payment details back
      if (data.data?.payment?.id) {
        // Redirect to payment upload screen
        router.push(`/patient/payments/upload/${data.data.payment.id}`);
      } else {
        // Fallback
        router.push('/patient/dashboard');
      }
    } catch (err: any) {
      alert(err.response?.data?.error || 'Failed to submit case sheet');
      setIsSubmitting(false);
    }
  };

  return (
    <div className="max-w-3xl mx-auto p-8">
      <div className="mb-8">
        <h1 className="text-3xl font-bold bg-gradient-to-r from-emerald-400 to-cyan-400 bg-clip-text text-transparent">
          New Case Sheet
        </h1>
        <p className="mt-2 text-slate-400">Step {step} of {isFemale ? 3 : 2}</p>
        
        {/* Progress Bar */}
        <div className="w-full bg-slate-800 h-2 rounded-full mt-4">
          <div 
            className="bg-emerald-500 h-2 rounded-full transition-all duration-300"
            style={{ width: `${(step / (isFemale ? 3 : 2)) * 100}%` }}
          ></div>
        </div>
      </div>

      <div className="rounded-xl border border-slate-800 bg-slate-900/50 p-6 backdrop-blur-sm">
        <form onSubmit={step === (isFemale ? 3 : 2) ? handleSubmit : (e) => { e.preventDefault(); handleNext(); }}>
          
          {step === 1 && (
            <div className="space-y-6 animate-in fade-in slide-in-from-right-4 duration-300">
              <div>
                <label className="block text-sm font-medium text-slate-300 mb-2">Are you a female patient?</label>
                <div className="flex gap-4">
                  <button
                    type="button"
                    onClick={() => setIsFemale(true)}
                    className={`px-4 py-2 rounded-lg border text-sm font-medium transition-colors ${isFemale ? 'border-emerald-500 bg-emerald-500/20 text-emerald-400' : 'border-slate-700 hover:bg-slate-800 text-slate-400'}`}
                  >
                    Yes
                  </button>
                  <button
                    type="button"
                    onClick={() => setIsFemale(false)}
                    className={`px-4 py-2 rounded-lg border text-sm font-medium transition-colors ${!isFemale ? 'border-emerald-500 bg-emerald-500/20 text-emerald-400' : 'border-slate-700 hover:bg-slate-800 text-slate-400'}`}
                  >
                    No
                  </button>
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-slate-300 mb-2">Chief Complaint *</label>
                <textarea 
                  required
                  rows={4}
                  className="w-full rounded-lg border border-slate-700 bg-slate-900 p-3 text-white focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500"
                  placeholder="Describe your symptoms in detail..."
                  value={formData.chief_complaint}
                  onChange={e => setFormData({...formData, chief_complaint: e.target.value})}
                ></textarea>
              </div>
            </div>
          )}

          {step === 2 && !isFemale && (
            <div className="space-y-6 animate-in fade-in slide-in-from-right-4 duration-300">
              <div>
                <label className="block text-sm font-medium text-slate-300 mb-2">Past Illnesses</label>
                <textarea 
                  rows={3}
                  className="w-full rounded-lg border border-slate-700 bg-slate-900 p-3 text-white focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500"
                  value={formData.history.past_illness}
                  onChange={e => setFormData({...formData, history: {...formData.history, past_illness: e.target.value}})}
                ></textarea>
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-300 mb-2">Known Allergies</label>
                <input 
                  type="text"
                  className="w-full rounded-lg border border-slate-700 bg-slate-900 p-3 text-white focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500"
                  value={formData.history.allergies}
                  onChange={e => setFormData({...formData, history: {...formData.history, allergies: e.target.value}})}
                />
              </div>
            </div>
          )}

          {step === 2 && isFemale && (
            <div className="space-y-6 animate-in fade-in slide-in-from-right-4 duration-300">
              <h3 className="text-lg font-semibold text-emerald-400 border-b border-emerald-900/50 pb-2">Gynaecological History</h3>
              <div>
                <label className="block text-sm font-medium text-slate-300 mb-2">Last Menstrual Period (LMP) Date</label>
                <input 
                  type="date"
                  className="w-full rounded-lg border border-slate-700 bg-slate-900 p-3 text-white focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500"
                  value={formData.female_history.lmp_date}
                  onChange={e => setFormData({...formData, female_history: {...formData.female_history, lmp_date: e.target.value}})}
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-300 mb-2">Additional Notes</label>
                <textarea 
                  rows={3}
                  className="w-full rounded-lg border border-slate-700 bg-slate-900 p-3 text-white focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500"
                  value={formData.female_history.notes}
                  onChange={e => setFormData({...formData, female_history: {...formData.female_history, notes: e.target.value}})}
                ></textarea>
              </div>
            </div>
          )}

          {step === 3 && isFemale && (
            <div className="space-y-6 animate-in fade-in slide-in-from-right-4 duration-300">
              <div>
                <label className="block text-sm font-medium text-slate-300 mb-2">Past Illnesses</label>
                <textarea 
                  rows={3}
                  className="w-full rounded-lg border border-slate-700 bg-slate-900 p-3 text-white focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500"
                  value={formData.history.past_illness}
                  onChange={e => setFormData({...formData, history: {...formData.history, past_illness: e.target.value}})}
                ></textarea>
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-300 mb-2">Known Allergies</label>
                <input 
                  type="text"
                  className="w-full rounded-lg border border-slate-700 bg-slate-900 p-3 text-white focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500"
                  value={formData.history.allergies}
                  onChange={e => setFormData({...formData, history: {...formData.history, allergies: e.target.value}})}
                />
              </div>
            </div>
          )}

          <div className="mt-8 flex justify-between border-t border-slate-800 pt-6">
            <button
              type="button"
              onClick={handlePrev}
              disabled={step === 1}
              className="px-6 py-2 rounded-lg font-medium text-slate-400 hover:text-white disabled:opacity-50 transition-colors"
            >
              Back
            </button>
            <button
              type="submit"
              disabled={isSubmitting}
              className="px-6 py-2 bg-emerald-600 hover:bg-emerald-500 text-white font-medium rounded-lg shadow-lg shadow-emerald-900/20 transition-all disabled:opacity-50"
            >
              {step === (isFemale ? 3 : 2) ? (isSubmitting ? 'Submitting...' : 'Submit & Pay ₹500') : 'Next'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
