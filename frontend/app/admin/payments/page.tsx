'use client';

import { useEffect, useState } from 'react';
import { api } from '@/lib/api-client';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';

type PendingPayment = {
  id: string;
  amount: number;
  status: string;
  screenshot_url: string;
  upi_ref: string;
  created_at: string;
  billing: {
    id: string;
    patient_id: string;
    case_sheet_id: string;
  };
};

export default function AdminPaymentsDashboard() {
  const [payments, setPayments] = useState<PendingPayment[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [processingId, setProcessingId] = useState<string | null>(null);

  const fetchPayments = async () => {
    try {
      const res = await api.get('/api/payments/pending');
      setPayments(res.data.data || []);
    } catch (err) {
      setError('Failed to fetch pending payments');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchPayments();
  }, []);

  const handleAction = async (paymentId: string, status: 'success' | 'failed') => {
    setProcessingId(paymentId);
    try {
      await api.post(`/api/payments/${paymentId}/mark-paid`, { status });
      // Remove the processed payment from the UI immediately
      setPayments((prev) => prev.filter((p) => p.id !== paymentId));
    } catch (err) {
      alert(`Failed to mark as ${status}. Please try again.`);
    } finally {
      setProcessingId(null);
    }
  };

  if (loading) {
    return (
      <div className="p-8 text-slate-400 animate-pulse">
        Loading pending payments...
      </div>
    );
  }

  return (
    <div className="p-8 space-y-8 bg-slate-950 min-h-screen text-slate-200">
      <div className="flex flex-col gap-2">
        <h1 className="text-3xl font-bold tracking-tight text-white">Payment Verification Queue</h1>
        <p className="text-slate-400">Review and verify UPI payment screenshots submitted by patients.</p>
      </div>

      {error && <div className="text-red-400 bg-red-900/20 p-4 rounded-lg border border-red-500/20">{error}</div>}

      {payments.length === 0 && !error ? (
        <Card className="border-slate-800 bg-slate-900/50">
          <CardContent className="flex flex-col items-center justify-center py-16 text-slate-400">
            <svg className="w-16 h-16 mb-4 text-slate-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
            <p className="text-lg font-medium">All caught up!</p>
            <p className="text-sm">No pending payments to verify.</p>
          </CardContent>
        </Card>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
          {payments.map((payment) => (
            <Card key={payment.id} className="border-slate-800 bg-slate-900 overflow-hidden shadow-xl hover:border-slate-700 transition-colors">
              <div className="h-48 w-full bg-slate-950 relative overflow-hidden group border-b border-slate-800">
                <img 
                  src={payment.screenshot_url} 
                  alt="Payment Screenshot" 
                  className="w-full h-full object-contain cursor-pointer transition-transform duration-300 group-hover:scale-105"
                  onClick={() => window.open(payment.screenshot_url, '_blank')}
                  title="Click to view full size"
                />
                <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center pointer-events-none">
                  <span className="bg-slate-900/80 px-4 py-2 rounded-full text-sm font-medium backdrop-blur-sm border border-slate-700 text-white">View Full Screen</span>
                </div>
              </div>
              
              <CardContent className="p-6 space-y-6">
                <div className="space-y-3">
                  <div className="flex justify-between items-start">
                    <div>
                      <p className="text-xs text-slate-500 font-medium tracking-wide uppercase mb-1">UPI Reference</p>
                      <p className="text-emerald-400 font-mono font-medium">{payment.upi_ref}</p>
                    </div>
                    <div className="text-right">
                      <p className="text-xs text-slate-500 font-medium tracking-wide uppercase mb-1">Amount</p>
                      <p className="text-white font-bold text-lg">₹{payment.amount}</p>
                    </div>
                  </div>
                  
                  <div className="pt-3 border-t border-slate-800/60">
                    <p className="text-xs text-slate-500 font-medium tracking-wide uppercase mb-1">Date Submitted</p>
                    <p className="text-slate-300 text-sm">
                      {new Date(payment.created_at).toLocaleString('en-IN', {
                        day: 'numeric', month: 'short', year: 'numeric',
                        hour: 'numeric', minute: '2-digit'
                      })}
                    </p>
                  </div>
                </div>

                <div className="flex items-center gap-3 pt-2">
                  <Button 
                    variant="outline"
                    className="flex-1 bg-red-950/20 text-red-400 border-red-900 hover:bg-red-900/40 hover:text-red-300 transition-all"
                    disabled={processingId === payment.id}
                    onClick={() => handleAction(payment.id, 'failed')}
                  >
                    Reject
                  </Button>
                  <Button 
                    className="flex-1 bg-emerald-600 text-white hover:bg-emerald-500 shadow-lg shadow-emerald-900/20 transition-all"
                    disabled={processingId === payment.id}
                    onClick={() => handleAction(payment.id, 'success')}
                  >
                    {processingId === payment.id ? 'Processing...' : 'Verify & Admit'}
                  </Button>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}
