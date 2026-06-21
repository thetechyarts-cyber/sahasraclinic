'use client';

import { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { api } from '@/lib/api-client';
import { useAuth } from '@/providers/auth-provider';
import { ROLE_DASHBOARDS } from '@/constants';
import { RoleName } from '@/types';

export default function OtpPage(): JSX.Element {
  const [otp, setOtp] = useState('');
  const [email, setEmail] = useState('');
  const [step, setStep] = useState<'send' | 'verify'>('send');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  
  const router = useRouter();

  const handleSend = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    try {
      await api.post('/auth/otp/send', { email });
      setStep('verify');
    } catch (err: any) {
      setError(err.response?.data?.error || 'Failed to send OTP');
    } finally {
      setLoading(false);
    }
  };

  const handleVerify = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    try {
      const { data } = await api.post('/auth/otp/verify', { email, otp });
      
      if (data.data?.token && data.data?.user) {
        // Manually set auth tokens since we aren't using the login hook here
        localStorage.setItem('hms_token', data.data.token);
        localStorage.setItem('hms_user', JSON.stringify(data.data.user));
        api.defaults.headers.common['Authorization'] = `Bearer ${data.data.token}`;
        
        // Redirect to dashboard
        const dashboard = ROLE_DASHBOARDS[data.data.user.role as RoleName];
        router.push(dashboard || '/');
        
        // Hard refresh to re-init provider state
        window.location.reload();
      }
    } catch (err: any) {
      setError(err.response?.data?.error || 'Invalid or expired OTP');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="rounded-2xl border border-slate-800 bg-slate-900/80 p-8 shadow-2xl shadow-emerald-500/5 backdrop-blur-xl">
      <div className="mb-8 text-center">
        <div className="mx-auto mb-4 flex h-14 w-14 items-center justify-center rounded-2xl bg-gradient-to-br from-emerald-400 to-cyan-400 shadow-lg shadow-emerald-500/25">
          <span className="text-xl font-bold text-slate-900">🔑</span>
        </div>
        <h1 className="text-2xl font-bold text-white">
          {step === 'send' ? 'Forgot Password' : 'Verify OTP'}
        </h1>
        <p className="mt-1 text-sm text-slate-400">
          {step === 'send' ? 'Enter your email to receive an OTP' : 'Enter the 6-digit code sent to your email'}
        </p>
      </div>

      {error && (
        <div className="mb-6 rounded-lg border border-red-500/20 bg-red-500/10 px-4 py-3 text-sm text-red-400">
          {error}
        </div>
      )}

      {step === 'send' ? (
        <form onSubmit={handleSend} className="space-y-5">
          <div>
            <label htmlFor="email" className="mb-1.5 block text-sm font-medium text-slate-300">Email</label>
            <input id="email" type="email" required value={email} onChange={(e) => setEmail(e.target.value)}
              className="w-full rounded-lg border border-slate-700 bg-slate-800/50 px-4 py-2.5 text-sm text-white placeholder-slate-500 outline-none focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500"
              placeholder="you@example.com" />
          </div>
          <button type="submit" disabled={loading}
            className="w-full rounded-lg bg-gradient-to-r from-emerald-500 to-cyan-500 px-4 py-2.5 text-sm font-semibold text-white shadow-lg shadow-emerald-500/25 disabled:opacity-50">
            {loading ? 'Sending...' : 'Send OTP'}
          </button>
        </form>
      ) : (
        <form onSubmit={handleVerify} className="space-y-5">
          <div>
            <label htmlFor="otp" className="mb-1.5 block text-sm font-medium text-slate-300">OTP Code</label>
            <input id="otp" name="otp" type="text" required value={otp} onChange={(e) => setOtp(e.target.value)}
              maxLength={6}
              className="w-full rounded-lg border border-slate-700 bg-slate-800/50 px-4 py-2.5 text-center text-2xl font-mono tracking-[0.5em] text-white placeholder-slate-500 outline-none focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500"
              placeholder="000000" />
          </div>
          <button type="submit" disabled={loading}
            className="w-full rounded-lg bg-gradient-to-r from-emerald-500 to-cyan-500 px-4 py-2.5 text-sm font-semibold text-white shadow-lg shadow-emerald-500/25 disabled:opacity-50">
            {loading ? 'Verifying...' : 'Verify'}
          </button>
          <button type="button" onClick={() => setStep('send')}
            className="w-full rounded-lg border border-slate-700 px-4 py-2.5 text-sm text-slate-400 hover:text-white transition-colors">
            Resend OTP
          </button>
        </form>
      )}

      <div className="mt-6 text-center text-sm">
        <Link href="/login" className="text-emerald-400 hover:text-emerald-300 transition-colors">Back to sign in</Link>
      </div>
    </div>
  );
}
