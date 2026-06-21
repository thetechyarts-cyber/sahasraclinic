'use client';

import { useState } from 'react';
import { useRouter, useParams } from 'next/navigation';
import { api } from '@/lib/api-client';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';

export default function PaymentUploadPage() {
  const params = useParams();
  const router = useRouter();
  const billingId = params.id as string;

  const [file, setFile] = useState<File | null>(null);
  const [upiRef, setUpiRef] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState(false);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      setFile(e.target.files[0]);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!file || !upiRef) {
      setError('Please provide both the screenshot and UPI reference number.');
      return;
    }

    setLoading(true);
    setError('');

    try {
      const formData = new FormData();
      formData.append('screenshot', file);
      formData.append('upiRef', upiRef);

      await api.post(`/api/payments/${billingId}/screenshot`, formData, {
        headers: { 'Content-Type': 'multipart/form-data' },
      });

      setSuccess(true);
    } catch (err: any) {
      setError(err.response?.data?.error || 'Failed to upload screenshot. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  if (success) {
    return (
      <div className="min-h-screen bg-slate-950 flex items-center justify-center p-4">
        <Card className="w-full max-w-md border-slate-800 bg-slate-900 shadow-2xl overflow-hidden rounded-2xl transition-all duration-500 hover:shadow-emerald-900/20">
          <CardHeader className="text-center space-y-4">
            <div className="mx-auto w-20 h-20 bg-emerald-500/10 rounded-full flex items-center justify-center border border-emerald-500/20">
              <svg className="w-10 h-10 text-emerald-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
              </svg>
            </div>
            <CardTitle className="text-2xl font-bold text-white tracking-tight">Upload Successful</CardTitle>
            <CardDescription className="text-slate-400">
              Your payment screenshot has been sent for verification. You will be assigned a queue token once the admin confirms it.
            </CardDescription>
          </CardHeader>
          <CardContent className="flex justify-center pb-8">
            <Button 
              className="bg-emerald-600 hover:bg-emerald-500 text-white shadow-lg shadow-emerald-900/20 rounded-xl px-8"
              onClick={() => router.push('/patient/dashboard')}
            >
              Return to Dashboard
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-950 flex items-center justify-center p-4">
      <Card className="w-full max-w-md border-slate-800 bg-slate-900/50 backdrop-blur-xl shadow-2xl rounded-2xl overflow-hidden">
        <div className="h-1 w-full bg-gradient-to-r from-emerald-500 to-teal-400" />
        <CardHeader className="space-y-2 pb-6">
          <CardTitle className="text-2xl font-bold text-white tracking-tight">Complete Payment</CardTitle>
          <CardDescription className="text-slate-400">
            Please transfer the consultation fee via UPI and upload the screenshot of your successful transaction.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="p-4 bg-slate-800/50 border border-slate-700/50 rounded-xl space-y-3">
              <h3 className="text-sm font-medium text-slate-300">Hospital UPI Details</h3>
              <div className="flex justify-between items-center bg-slate-900 p-3 rounded-lg border border-slate-800">
                <span className="text-slate-400 text-sm">UPI ID</span>
                <span className="text-emerald-400 font-mono text-sm tracking-wide">hospital@upi</span>
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="upiRef" className="text-slate-300 text-sm font-medium">12-Digit UPI Reference Number</Label>
              <Input
                id="upiRef"
                type="text"
                placeholder="e.g. 301234567890"
                value={upiRef}
                onChange={(e) => setUpiRef(e.target.value)}
                className="bg-slate-900 border-slate-700 focus:ring-emerald-500 focus:border-emerald-500 text-white rounded-lg transition-all"
                required
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="screenshot" className="text-slate-300 text-sm font-medium">Payment Screenshot</Label>
              <Input
                id="screenshot"
                type="file"
                accept="image/*"
                onChange={handleFileChange}
                className="bg-slate-900 border-slate-700 text-slate-300 file:bg-slate-800 file:text-slate-300 file:border-0 file:rounded-md file:mr-4 file:px-4 file:py-1 cursor-pointer rounded-lg hover:file:bg-slate-700 transition-all"
                required
              />
            </div>

            {error && (
              <div className="p-3 bg-red-900/20 border border-red-500/20 rounded-lg text-red-400 text-sm flex items-center gap-2">
                <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                </svg>
                {error}
              </div>
            )}

            <Button 
              type="submit" 
              className="w-full bg-emerald-600 hover:bg-emerald-500 text-white font-medium py-6 rounded-xl shadow-lg shadow-emerald-900/20 transition-all duration-300 group disabled:opacity-50 disabled:cursor-not-allowed"
              disabled={loading || !file || !upiRef}
            >
              {loading ? 'Uploading...' : 'Submit Payment Proof'}
              {!loading && (
                <svg className="w-4 h-4 ml-2 group-hover:translate-x-1 transition-transform" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14 5l7 7m0 0l-7 7m7-7H3" />
                </svg>
              )}
            </Button>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}
