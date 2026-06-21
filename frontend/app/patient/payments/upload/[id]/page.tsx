'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { api } from '@/lib/api-client';

export default function PaymentUploadPage({ params }: { params: { id: string } }) {
  const router = useRouter();
  const [file, setFile] = useState<File | null>(null);
  const [upiRef, setUpiRef] = useState('');
  const [isUploading, setIsUploading] = useState(false);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      setFile(e.target.files[0]);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!file || !upiRef) {
      alert('Please provide both the screenshot and UPI reference number.');
      return;
    }
    
    setIsUploading(true);
    
    try {
      const formData = new FormData();
      formData.append('file', file);
      formData.append('upiRef', upiRef);

      await api.post(`/payments/${params.id}/screenshot`, formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      });

      alert('Payment screenshot uploaded successfully! Waiting for admin verification.');
      router.push('/patient/dashboard');
    } catch (err: any) {
      alert(err.response?.data?.error || 'Failed to upload screenshot');
    } finally {
      setIsUploading(false);
    }
  };

  return (
    <div className="max-w-2xl mx-auto p-8">
      <div className="mb-8">
        <h1 className="text-3xl font-bold bg-gradient-to-r from-emerald-400 to-cyan-400 bg-clip-text text-transparent">
          Payment Verification
        </h1>
        <p className="mt-2 text-slate-400">Upload your UPI payment screenshot to complete registration</p>
      </div>

      <div className="rounded-xl border border-slate-800 bg-slate-900/50 p-8 backdrop-blur-sm">
        <div className="mb-8 p-6 bg-slate-800/50 rounded-lg border border-slate-700 text-center">
          <p className="text-sm text-slate-400 mb-2 uppercase tracking-wider">Consultation Fee</p>
          <p className="text-4xl font-bold text-white">₹500.00</p>
          
          <div className="mt-6 pt-6 border-t border-slate-700">
            <p className="text-sm text-slate-300 mb-4">Please pay using the UPI QR Code below</p>
            {/* Mock QR Code for demonstration */}
            <div className="w-48 h-48 bg-white mx-auto rounded-lg p-2 flex items-center justify-center">
              <img src={`https://api.qrserver.com/v1/create-qr-code/?size=150x150&data=upi://pay?pa=hospital@upi&pn=Hospital&am=500.00&cu=INR`} alt="UPI QR Code" />
            </div>
            <p className="mt-4 font-mono text-emerald-400 text-lg tracking-wider">hospital@upi</p>
          </div>
        </div>

        <form onSubmit={handleSubmit} className="space-y-6">
          <div>
            <label className="block text-sm font-medium text-slate-300 mb-2">Upload Screenshot *</label>
            <div className="mt-1 flex justify-center px-6 pt-5 pb-6 border-2 border-slate-700 border-dashed rounded-lg hover:border-emerald-500/50 transition-colors bg-slate-900/50">
              <div className="space-y-1 text-center">
                <svg className="mx-auto h-12 w-12 text-slate-500" stroke="currentColor" fill="none" viewBox="0 0 48 48" aria-hidden="true">
                  <path d="M28 8H12a4 4 0 00-4 4v20m32-12v8m0 0v8a4 4 0 01-4 4H12a4 4 0 01-4-4v-4m32-4l-3.172-3.172a4 4 0 00-5.656 0L28 28M8 32l9.172-9.172a4 4 0 015.656 0L28 28m0 0l4 4m4-24h8m-4-4v8m-12 4h.02" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                </svg>
                <div className="flex text-sm text-slate-400 justify-center">
                  <label htmlFor="file-upload" className="relative cursor-pointer bg-slate-800 rounded-md px-3 py-1 font-medium text-emerald-400 hover:text-emerald-300 focus-within:outline-none focus-within:ring-2 focus-within:ring-offset-2 focus-within:ring-emerald-500">
                    <span>{file ? file.name : "Choose a file"}</span>
                    <input id="file-upload" name="file-upload" type="file" className="sr-only" accept="image/*" onChange={handleFileChange} required />
                  </label>
                </div>
                {!file && <p className="text-xs text-slate-500">PNG, JPG up to 5MB</p>}
              </div>
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-slate-300 mb-2">12-Digit UPI Reference Number *</label>
            <input 
              type="text" 
              required
              pattern="[0-9]{12}"
              title="Must be a 12-digit number"
              className="w-full rounded-lg border border-slate-700 bg-slate-900 p-3 text-white focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500 font-mono"
              placeholder="e.g. 123456789012"
              value={upiRef}
              onChange={(e) => setUpiRef(e.target.value)}
            />
            <p className="mt-1 text-xs text-slate-500">You can find this in your payment app (Google Pay, PhonePe, Paytm, etc.)</p>
          </div>

          <button
            type="submit"
            disabled={isUploading || !file || !upiRef}
            className="w-full py-3 bg-emerald-600 hover:bg-emerald-500 text-white font-bold rounded-lg shadow-lg shadow-emerald-900/20 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {isUploading ? 'Uploading & Saving...' : 'Submit Payment Details'}
          </button>
        </form>
      </div>
    </div>
  );
}
