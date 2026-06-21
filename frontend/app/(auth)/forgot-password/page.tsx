'use client';

import { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { api } from '@/lib/api-client';

export default function ForgotPasswordPage(): JSX.Element {
  const [email, setEmail] = useState('');
  const [otp, setOtp] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [step, setStep] = useState<'send' | 'reset'>('send');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  const router = useRouter();

  const handleSend = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    setSuccess('');
    try {
      await api.post('/auth/otp/send', { email });
      setStep('reset');
      setSuccess('OTP sent successfully to your email.');
    } catch (err: any) {
      setError(err.response?.data?.error || 'Failed to send OTP');
    } finally {
      setLoading(false);
    }
  };

  const handleReset = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    setSuccess('');
    try {
      await api.post('/auth/reset-password', { email, otp, newPassword });
      setSuccess('Password reset successfully. Redirecting to login...');
      setTimeout(() => {
        router.push('/login');
      }, 2000);
    } catch (err: any) {
      setError(err.response?.data?.error || 'Invalid OTP or password requirement not met.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="rounded-2xl border border-slate-800 bg-slate-900/80 p-8 shadow-2xl shadow-emerald-500/5 backdrop-blur-xl">
      <div className="mb-8 text-center">
        <div className="mx-auto mb-4 flex h-14 w-14 items-center justify-center rounded-2xl bg-gradient-to-br from-emerald-400 to-cyan-400 shadow-lg shadow-emerald-500/25">
          <span className="text-xl font-bold text-slate-900">🔒</span>
        </div>
        <h1 className="text-2xl font-bold text-white">
          Reset Password
        </h1>
        <p className="mt-1 text-sm text-slate-400">
          {step === 'send' ? 'Enter your email to receive a reset code' : 'Enter the OTP and your new password'}
        </p>
      </div>

      {error && (
        <div className="mb-6 rounded-lg border border-red-500/20 bg-red-500/10 px-4 py-3 text-sm text-red-400">
          {error}
        </div>
      )}

      {success && (
        <div className="mb-6 rounded-lg border border-emerald-500/20 bg-emerald-500/10 px-4 py-3 text-sm text-emerald-400">
          {success}
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
            {loading ? 'Sending...' : 'Send Reset Code'}
          </button>
        </form>
      ) : (
        <form onSubmit={handleReset} className="space-y-5">
          <div>
            <label htmlFor="otp" className="mb-1.5 block text-sm font-medium text-slate-300">OTP Code</label>
            <input id="otp" name="otp" type="text" required value={otp} onChange={(e) => setOtp(e.target.value)}
              maxLength={6}
              className="w-full rounded-lg border border-slate-700 bg-slate-800/50 px-4 py-2.5 text-center text-2xl font-mono tracking-[0.5em] text-white placeholder-slate-500 outline-none focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500"
              placeholder="000000" />
          </div>
          <div>
            <label htmlFor="newPassword" className="mb-1.5 block text-sm font-medium text-slate-300">New Password</label>
            <input id="newPassword" name="newPassword" type="password" required value={newPassword} onChange={(e) => setNewPassword(e.target.value)}
              className="w-full rounded-lg border border-slate-700 bg-slate-800/50 px-4 py-2.5 text-sm text-white placeholder-slate-500 outline-none focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500"
              placeholder="••••••••" />
            <p className="mt-1 text-xs text-slate-500">Min 8 chars, 1 uppercase, 1 number, 1 special character.</p>
          </div>
          <button type="submit" disabled={loading || !!success.includes('Redirecting')}
            className="w-full rounded-lg bg-gradient-to-r from-emerald-500 to-cyan-500 px-4 py-2.5 text-sm font-semibold text-white shadow-lg shadow-emerald-500/25 disabled:opacity-50">
            {loading ? 'Resetting...' : 'Reset Password'}
          </button>
          <button type="button" onClick={() => { setStep('send'); setSuccess(''); }}
            className="w-full rounded-lg border border-slate-700 px-4 py-2.5 text-sm text-slate-400 hover:text-white transition-colors">
            Back to Email
          </button>
        </form>
      )}

      <div className="mt-6 text-center text-sm">
        <Link href="/login" className="text-emerald-400 hover:text-emerald-300 transition-colors">Back to sign in</Link>
      </div>
    </div>
  );
}
