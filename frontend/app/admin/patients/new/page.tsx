'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { api } from '@/lib/api-client';

export default function NewPatientPage() {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: '',
    phone: '',
    gender: '',
    dob: '',
    address: '',
    village: '',
    birth_place: '',
  });
  const [error, setError] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const router = useRouter();

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    setFormData((prev) => ({ ...prev, [e.target.name]: e.target.value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setIsSubmitting(true);

    try {
      const payload = {
        ...formData,
        phone: formData.phone.startsWith('+91') ? formData.phone : `+91${formData.phone}`,
      };
      
      const { data } = await api.post('/patients', payload);
      router.push(`/admin/patients/${data.data.id}`);
    } catch (err: any) {
      setError(err.response?.data?.error || 'Registration failed');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="p-8">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-white">Register Patient</h1>
        <p className="mt-2 text-slate-400">Create a new offline patient profile</p>
      </div>

      <div className="max-w-2xl rounded-xl border border-slate-800 bg-slate-900/50 p-6 backdrop-blur-sm">
        {error && (
          <div className="mb-6 rounded-lg border border-red-500/20 bg-red-500/10 px-4 py-3 text-sm text-red-400">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="grid gap-6 md:grid-cols-2">
            <div>
              <label className="mb-1.5 block text-sm font-medium text-slate-300">Full Name</label>
              <input name="name" required value={formData.name} onChange={handleChange}
                className="w-full rounded-lg border border-slate-700 bg-slate-800/50 px-4 py-2.5 text-sm text-white focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500 outline-none" />
            </div>
            <div>
              <label className="mb-1.5 block text-sm font-medium text-slate-300">Email Address</label>
              <input name="email" type="email" required value={formData.email} onChange={handleChange}
                className="w-full rounded-lg border border-slate-700 bg-slate-800/50 px-4 py-2.5 text-sm text-white focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500 outline-none" />
            </div>
            <div>
              <label className="mb-1.5 block text-sm font-medium text-slate-300">Mobile Number</label>
              <input name="phone" type="tel" required value={formData.phone} onChange={handleChange} placeholder="9876543210"
                className="w-full rounded-lg border border-slate-700 bg-slate-800/50 px-4 py-2.5 text-sm text-white focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500 outline-none" />
            </div>
            <div>
              <label className="mb-1.5 block text-sm font-medium text-slate-300">Temporary Password</label>
              <input name="password" type="password" required value={formData.password} onChange={handleChange}
                className="w-full rounded-lg border border-slate-700 bg-slate-800/50 px-4 py-2.5 text-sm text-white focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500 outline-none" />
            </div>
            <div>
              <label className="mb-1.5 block text-sm font-medium text-slate-300">Gender</label>
              <select name="gender" required value={formData.gender} onChange={handleChange}
                className="w-full rounded-lg border border-slate-700 bg-slate-800/50 px-4 py-2.5 text-sm text-white focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500 outline-none">
                <option value="">Select Gender</option>
                <option value="male">Male</option>
                <option value="female">Female</option>
                <option value="other">Other</option>
              </select>
            </div>
            <div>
              <label className="mb-1.5 block text-sm font-medium text-slate-300">Date of Birth</label>
              <input name="dob" type="date" value={formData.dob} onChange={handleChange}
                className="w-full rounded-lg border border-slate-700 bg-slate-800/50 px-4 py-2.5 text-sm text-white focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500 outline-none" />
            </div>
          </div>

          <div className="border-t border-slate-800 pt-6">
            <h3 className="mb-4 text-sm font-semibold text-white uppercase tracking-wider">Address Details</h3>
            <div className="grid gap-6 md:grid-cols-2">
              <div className="md:col-span-2">
                <label className="mb-1.5 block text-sm font-medium text-slate-300">Full Address</label>
                <input name="address" value={formData.address} onChange={handleChange}
                  className="w-full rounded-lg border border-slate-700 bg-slate-800/50 px-4 py-2.5 text-sm text-white focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500 outline-none" />
              </div>
              <div>
                <label className="mb-1.5 block text-sm font-medium text-slate-300">Village/Town</label>
                <input name="village" value={formData.village} onChange={handleChange}
                  className="w-full rounded-lg border border-slate-700 bg-slate-800/50 px-4 py-2.5 text-sm text-white focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500 outline-none" />
              </div>
              <div>
                <label className="mb-1.5 block text-sm font-medium text-slate-300">Birth Place</label>
                <input name="birth_place" value={formData.birth_place} onChange={handleChange}
                  className="w-full rounded-lg border border-slate-700 bg-slate-800/50 px-4 py-2.5 text-sm text-white focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500 outline-none" />
              </div>
            </div>
          </div>

          <div className="flex justify-end border-t border-slate-800 pt-6">
            <button type="submit" disabled={isSubmitting}
              className="rounded-lg bg-emerald-500 px-6 py-2.5 text-sm font-semibold text-white shadow-lg shadow-emerald-500/25 transition-all hover:bg-emerald-400 disabled:opacity-50">
              {isSubmitting ? 'Registering...' : 'Register Patient'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
