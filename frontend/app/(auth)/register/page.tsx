'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { useAuth } from '@/providers/auth-provider';
import { ROUTES } from '@/constants';

export default function RegisterPage(): JSX.Element {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: '',
    phone: '',
    gender: '',
    dob: '',
    address: '',
  });
  const [error, setError] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const { register } = useAuth();
  const router = useRouter();

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>): void => {
    setFormData((prev) => ({ ...prev, [e.target.name]: e.target.value }));
  };

  const handleSubmit = async (e: React.FormEvent): Promise<void> => {
    e.preventDefault();
    setError('');
    setIsSubmitting(true);

    try {
      // Format phone with +91 prefix
      const payload = {
        ...formData,
        phone: formData.phone.startsWith('+91') ? formData.phone : `+91${formData.phone}`,
      };
      await register(payload);
      // Trigger OTP sending automatically
      await fetch(process.env.NEXT_PUBLIC_API_URL + '/auth/otp/send', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: formData.email })
      });
      router.push('/otp');
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : 'Registration failed';
      setError(message);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="rounded-2xl border border-slate-800 bg-slate-900/80 p-8 shadow-2xl shadow-emerald-500/5 backdrop-blur-xl">
      {/* Header */}
      <div className="mb-8 text-center">
        <div className="mx-auto mb-4 flex h-14 w-14 items-center justify-center rounded-2xl bg-gradient-to-br from-emerald-400 to-cyan-400 shadow-lg shadow-emerald-500/25">
          <span className="text-xl font-bold text-slate-900">H</span>
        </div>
        <h1 className="text-2xl font-bold text-white">Create account</h1>
        <p className="mt-1 text-sm text-slate-400">Register as a new patient</p>
      </div>

      {error && (
        <div className="mb-6 rounded-lg border border-red-500/20 bg-red-500/10 px-4 py-3 text-sm text-red-400">
          {error}
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label htmlFor="name" className="mb-1.5 block text-sm font-medium text-slate-300">Full Name</label>
          <input id="name" name="name" type="text" required value={formData.name} onChange={handleChange}
            className="w-full rounded-lg border border-slate-700 bg-slate-800/50 px-4 py-2.5 text-sm text-white placeholder-slate-500 outline-none focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500"
            placeholder="John Doe" />
        </div>

        <div>
          <label htmlFor="email" className="mb-1.5 block text-sm font-medium text-slate-300">Email</label>
          <input id="email" name="email" type="email" required value={formData.email} onChange={handleChange}
            className="w-full rounded-lg border border-slate-700 bg-slate-800/50 px-4 py-2.5 text-sm text-white placeholder-slate-500 outline-none focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500"
            placeholder="you@example.com" />
        </div>

        <div>
          <label htmlFor="password" className="mb-1.5 block text-sm font-medium text-slate-300">Password</label>
          <input id="password" name="password" type="password" required value={formData.password} onChange={handleChange}
            className="w-full rounded-lg border border-slate-700 bg-slate-800/50 px-4 py-2.5 text-sm text-white placeholder-slate-500 outline-none focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500"
            placeholder="••••••••" />
          <p className="mt-1 text-xs text-slate-500">Min 8 chars, 1 uppercase, 1 number, 1 special character</p>
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div>
            <label htmlFor="phone" className="mb-1.5 block text-sm font-medium text-slate-300">Phone</label>
            <input id="phone" name="phone" type="tel" required value={formData.phone} onChange={handleChange}
              className="w-full rounded-lg border border-slate-700 bg-slate-800/50 px-4 py-2.5 text-sm text-white placeholder-slate-500 outline-none focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500"
              placeholder="9876543210" />
          </div>
          <div>
            <label htmlFor="gender" className="mb-1.5 block text-sm font-medium text-slate-300">Gender</label>
            <select id="gender" name="gender" required value={formData.gender} onChange={handleChange}
              className="w-full rounded-lg border border-slate-700 bg-slate-800/50 px-4 py-2.5 text-sm text-white outline-none focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500">
              <option value="">Select</option>
              <option value="male">Male</option>
              <option value="female">Female</option>
              <option value="other">Other</option>
            </select>
          </div>
        </div>

        <div>
          <label htmlFor="dob" className="mb-1.5 block text-sm font-medium text-slate-300">Date of Birth</label>
          <input id="dob" name="dob" type="date" value={formData.dob} onChange={handleChange}
            className="w-full rounded-lg border border-slate-700 bg-slate-800/50 px-4 py-2.5 text-sm text-white outline-none focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500" />
        </div>

        <button type="submit" disabled={isSubmitting}
          className="w-full rounded-lg bg-gradient-to-r from-emerald-500 to-cyan-500 px-4 py-2.5 text-sm font-semibold text-white shadow-lg shadow-emerald-500/25 transition-all hover:shadow-emerald-500/40 disabled:opacity-50 disabled:cursor-not-allowed">
          {isSubmitting ? 'Creating account...' : 'Create account'}
        </button>
      </form>

      <div className="mt-6 text-center text-sm">
        <span className="text-slate-400">Already have an account? </span>
        <Link href="/login" className="text-emerald-400 hover:text-emerald-300 transition-colors">Sign in</Link>
      </div>
    </div>
  );
}
