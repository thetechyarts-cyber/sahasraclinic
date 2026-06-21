'use client';

import { useState, useEffect } from 'react';
import { api } from '@/lib/api-client';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';

export default function DoctorPrognosisPage() {
  const [consultations, setConsultations] = useState<any[]>([]);
  const [selectedPatientId, setSelectedPatientId] = useState('');
  const [feedback, setFeedback] = useState('');
  const [status, setStatus] = useState('stable');
  const [mood, setMood] = useState('');
  const [notes, setNotes] = useState('');
  const [followupDate, setFollowupDate] = useState('');
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    // Fetch doctor's recent consultations to select a patient
    api.get('/api/consultations/doctor').then((res) => {
      // Filter unique patients
      const uniquePatients = res.data.data.reduce((acc: any[], current: any) => {
        const x = acc.find(item => item.patient_profiles?.id === current.patient_profiles?.id);
        if (!x && current.patient_profiles) {
          return acc.concat([current]);
        } else {
          return acc;
        }
      }, []);
      setConsultations(uniquePatients);
    }).catch(console.error);
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      await api.post('/api/prognosis', {
        patient_id: selectedPatientId,
        patient_feedback: feedback,
        recovery_status: status,
        mood,
        progress_notes: notes,
        followup_date: followupDate ? new Date(followupDate).toISOString() : undefined,
      });
      alert('Prognosis logged successfully!');
      setFeedback('');
      setMood('');
      setNotes('');
      setFollowupDate('');
      setSelectedPatientId('');
    } catch (err) {
      alert('Failed to log prognosis');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="p-8">
      <Card className="max-w-2xl mx-auto bg-slate-900 border-slate-800 text-white">
        <CardHeader>
          <CardTitle>Log Patient Prognosis & Follow-up</CardTitle>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="space-y-2">
              <Label>Select Patient (Recent Consultations)</Label>
              <Select value={selectedPatientId} onValueChange={setSelectedPatientId} required>
                <SelectTrigger className="bg-slate-950 border-slate-800 text-white">
                  <SelectValue placeholder="Select a patient..." />
                </SelectTrigger>
                <SelectContent className="bg-slate-900 border-slate-800 text-white">
                  {consultations.map((c: any) => (
                    <SelectItem key={c.patient_profiles.id} value={c.patient_profiles.id}>
                      {c.patient_profiles.users?.name} - {c.patient_profiles.phone}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label>Recovery Status</Label>
              <Select value={status} onValueChange={setStatus} required>
                <SelectTrigger className="bg-slate-950 border-slate-800 text-white">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent className="bg-slate-900 border-slate-800 text-white">
                  <SelectItem value="improving">Improving</SelectItem>
                  <SelectItem value="stable">Stable</SelectItem>
                  <SelectItem value="deteriorating">Deteriorating</SelectItem>
                  <SelectItem value="recovered">Recovered</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label>Progress Notes (Clinical)</Label>
              <textarea 
                required
                value={notes}
                onChange={e => setNotes(e.target.value)}
                className="w-full h-32 rounded-md bg-slate-950 border border-slate-800 p-3 text-white focus:ring-emerald-500 focus:border-emerald-500"
                placeholder="Details about recovery progress..."
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>Patient Feedback (Optional)</Label>
                <Input 
                  value={feedback}
                  onChange={e => setFeedback(e.target.value)}
                  className="bg-slate-950 border-slate-800 text-white"
                  placeholder="e.g. Pain has reduced"
                />
              </div>
              <div className="space-y-2">
                <Label>Patient Mood (Optional)</Label>
                <Input 
                  value={mood}
                  onChange={e => setMood(e.target.value)}
                  className="bg-slate-950 border-slate-800 text-white"
                  placeholder="e.g. Cheerful, Anxious"
                />
              </div>
            </div>

            <div className="space-y-2 border-t border-slate-800 pt-4 mt-4">
              <Label>Schedule Follow-up Date (Optional)</Label>
              <Input 
                type="datetime-local"
                value={followupDate}
                onChange={e => setFollowupDate(e.target.value)}
                className="bg-slate-950 border-slate-800 text-white w-full sm:w-1/2"
              />
              <p className="text-xs text-slate-500 mt-1">Leave blank if no follow-up is needed.</p>
            </div>

            <Button type="submit" disabled={loading} className="w-full bg-emerald-600 hover:bg-emerald-500">
              {loading ? 'Saving...' : 'Save Prognosis'}
            </Button>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}
