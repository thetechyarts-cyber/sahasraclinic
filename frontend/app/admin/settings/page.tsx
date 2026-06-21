'use client';

import { useState, useEffect } from 'react';
import { api } from '@/lib/api-client';

export default function SystemSettingsPage() {
  const [hospitalInfo, setHospitalInfo] = useState({
    name: '',
    phone: '',
    email: '',
    address: ''
  });
  
  const [features, setFeatures] = useState({
    enable_whatsapp: false,
    enable_online_booking: true,
    require_upi_verification: true
  });

  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    const fetchSettings = async () => {
      try {
        const { data } = await api.get('/settings');
        const settingsMap = data.data.reduce((acc: any, s: any) => ({ ...acc, [s.key]: s.value }), {});
        
        if (settingsMap.hospital_info) setHospitalInfo(settingsMap.hospital_info);
        if (settingsMap.features) setFeatures(settingsMap.features);
      } catch (err) {
        console.error('Failed to fetch settings', err);
      } finally {
        setLoading(false);
      }
    };
    fetchSettings();
  }, []);

  const handleSave = async () => {
    setSaving(true);
    try {
      await Promise.all([
        api.put('/settings/hospital_info', { value: hospitalInfo }),
        api.put('/settings/features', { value: features })
      ]);
      alert('Settings saved successfully!');
    } catch (err: any) {
      alert(err.response?.data?.error || 'Failed to save settings');
    } finally {
      setSaving(false);
    }
  };

  if (loading) return <div className="p-8 text-slate-400">Loading settings...</div>;

  return (
    <div className="max-w-4xl mx-auto p-8">
      <div className="mb-8 flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold bg-gradient-to-r from-emerald-400 to-cyan-400 bg-clip-text text-transparent">
            System Settings
          </h1>
          <p className="mt-2 text-slate-400">Manage global hospital configurations and feature toggles</p>
        </div>
        <button 
          onClick={handleSave}
          disabled={saving}
          className="rounded-lg bg-emerald-500 px-6 py-2 text-sm font-semibold text-white shadow-lg shadow-emerald-500/25 transition-all hover:bg-emerald-400 disabled:opacity-50"
        >
          {saving ? 'Saving...' : 'Save Settings'}
        </button>
      </div>

      <div className="grid gap-8">
        {/* Hospital Info */}
        <div className="rounded-xl border border-slate-800 bg-slate-900/50 p-6 backdrop-blur-sm">
          <h2 className="text-lg font-semibold text-white mb-6 border-b border-slate-800 pb-2">
            Hospital Information
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label className="block text-sm font-medium text-slate-300 mb-1">Hospital Name</label>
              <input 
                type="text" 
                value={hospitalInfo.name}
                onChange={e => setHospitalInfo({...hospitalInfo, name: e.target.value})}
                className="w-full rounded-lg border border-slate-700 bg-slate-800 p-2.5 text-white focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500" 
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-300 mb-1">Contact Phone</label>
              <input 
                type="text" 
                value={hospitalInfo.phone}
                onChange={e => setHospitalInfo({...hospitalInfo, phone: e.target.value})}
                className="w-full rounded-lg border border-slate-700 bg-slate-800 p-2.5 text-white focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500" 
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-300 mb-1">Contact Email</label>
              <input 
                type="email" 
                value={hospitalInfo.email}
                onChange={e => setHospitalInfo({...hospitalInfo, email: e.target.value})}
                className="w-full rounded-lg border border-slate-700 bg-slate-800 p-2.5 text-white focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500" 
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-300 mb-1">Address</label>
              <input 
                type="text" 
                value={hospitalInfo.address}
                onChange={e => setHospitalInfo({...hospitalInfo, address: e.target.value})}
                className="w-full rounded-lg border border-slate-700 bg-slate-800 p-2.5 text-white focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500" 
              />
            </div>
          </div>
        </div>

        {/* Feature Toggles */}
        <div className="rounded-xl border border-slate-800 bg-slate-900/50 p-6 backdrop-blur-sm">
          <h2 className="text-lg font-semibold text-white mb-6 border-b border-slate-800 pb-2">
            Feature Toggles
          </h2>
          <div className="space-y-6">
            <label className="flex items-center justify-between p-4 rounded-lg bg-slate-800/50 border border-slate-700/50 hover:bg-slate-800 transition-colors cursor-pointer">
              <div>
                <div className="font-medium text-white">Enable WhatsApp API</div>
                <div className="text-sm text-slate-400 mt-1">Automatically send payment links to patients via WhatsApp</div>
              </div>
              <input 
                type="checkbox"
                checked={features.enable_whatsapp}
                onChange={e => setFeatures({...features, enable_whatsapp: e.target.checked})}
                className="h-5 w-5 rounded border-slate-600 bg-slate-700 text-emerald-500 focus:ring-emerald-500 focus:ring-offset-slate-900"
              />
            </label>

            <label className="flex items-center justify-between p-4 rounded-lg bg-slate-800/50 border border-slate-700/50 hover:bg-slate-800 transition-colors cursor-pointer">
              <div>
                <div className="font-medium text-white">Enable Online Booking</div>
                <div className="text-sm text-slate-400 mt-1">Allow patients to register and create case sheets online</div>
              </div>
              <input 
                type="checkbox"
                checked={features.enable_online_booking}
                onChange={e => setFeatures({...features, enable_online_booking: e.target.checked})}
                className="h-5 w-5 rounded border-slate-600 bg-slate-700 text-emerald-500 focus:ring-emerald-500 focus:ring-offset-slate-900"
              />
            </label>

            <label className="flex items-center justify-between p-4 rounded-lg bg-slate-800/50 border border-slate-700/50 hover:bg-slate-800 transition-colors cursor-pointer">
              <div>
                <div className="font-medium text-white">Require UPI Verification</div>
                <div className="text-sm text-slate-400 mt-1">Force manual admin verification of UPI payment screenshots</div>
              </div>
              <input 
                type="checkbox"
                checked={features.require_upi_verification}
                onChange={e => setFeatures({...features, require_upi_verification: e.target.checked})}
                className="h-5 w-5 rounded border-slate-600 bg-slate-700 text-emerald-500 focus:ring-emerald-500 focus:ring-offset-slate-900"
              />
            </label>
          </div>
        </div>
      </div>
    </div>
  );
}
