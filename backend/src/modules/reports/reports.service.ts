import { supabase } from '../../config/supabase';
import { AppError } from '../../utils/app-error';

const getDashboardStats = async (startDate?: string, endDate?: string) => {
  // Simple default to last 30 days if not provided
  const start = startDate || new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString();
  const end = endDate || new Date().toISOString();

  // 1. Total Patients registered in period
  const { count: totalPatients } = await supabase
    .from('patient_profiles')
    .select('id', { count: 'exact', head: true })
    .gte('created_at', start)
    .lte('created_at', end);

  // 2. Total Revenue in period (from billing where status is paid)
  // Need to sum amount. Supabase JS doesn't have sum() built-in easily without RPC, 
  // so we fetch the amounts and sum them in Node (assuming small dataset for MVP).
  const { data: billings } = await supabase
    .from('billing')
    .select('amount')
    .eq('status', 'paid')
    .gte('created_at', start)
    .lte('created_at', end);

  const totalRevenue = (billings || []).reduce((sum, b) => sum + (Number(b.amount) || 0), 0);

  // 3. Total Consultations
  const { count: totalConsultations } = await supabase
    .from('consultations')
    .select('id', { count: 'exact', head: true })
    .gte('date', start)
    .lte('date', end);

  // 4. Queue Wait Times (rough estimate for demo)
  const { data: queue } = await supabase
    .from('queue_tokens')
    .select('created_at, called_at')
    .not('called_at', 'is', null)
    .gte('created_at', start)
    .lte('created_at', end)
    .limit(100);

  let avgWaitTimeMins = 0;
  if (queue && queue.length > 0) {
    const totalMins = queue.reduce((sum, q) => {
      const wait = new Date(q.called_at!).getTime() - new Date(q.created_at).getTime();
      return sum + wait / (1000 * 60);
    }, 0);
    avgWaitTimeMins = Math.round(totalMins / queue.length);
  }

  // 5. Pending Payments
  const { count: pendingPayments } = await supabase
    .from('payments')
    .select('id', { count: 'exact', head: true })
    .eq('status', 'pending')
    .gte('created_at', start)
    .lte('created_at', end);

  return {
    totalPatients: totalPatients || 0,
    totalRevenue,
    totalConsultations: totalConsultations || 0,
    avgWaitTimeMins,
    pendingPayments: pendingPayments || 0,
  };
};

const getPharmacistDashboardStats = async (pharmacistId: string) => {
  const startOfDay = new Date();
  startOfDay.setHours(0, 0, 0, 0);

  // 1. Pending dispense today (approved, offline)
  const { count: pendingCount } = await supabase
    .from('prescriptions')
    .select('id, consultations!inner(case_sheets!inner(type))', { count: 'exact', head: true })
    .eq('status', 'approved')
    .gte('approved_at', startOfDay.toISOString())
    .neq('consultations.case_sheets.type', 'online');

  // 2. Dispensed today by this pharmacist
  const { count: dispensedCount } = await supabase
    .from('prescriptions')
    .select('id', { count: 'exact', head: true })
    .eq('status', 'dispensed')
    .eq('dispensed_by', pharmacistId)
    .gte('dispensed_at', startOfDay.toISOString());

  // 3. Total approved today (offline)
  const totalApproved = (pendingCount || 0) + (dispensedCount || 0);

  return {
    totalApproved,
    dispensedToday: dispensedCount || 0,
    pendingDispense: pendingCount || 0,
  };
};

const getDoctorDashboardStats = async (doctorId: string) => {
  const today = new Date().toISOString().split('T')[0];
  const todayISO = new Date();
  todayISO.setHours(0, 0, 0, 0);

  // 1. Waiting in queue
  const { count: queueWaiting } = await supabase
    .from('queue_tokens')
    .select('id', { count: 'exact', head: true })
    .eq('doctor_id', doctorId)
    .eq('date', today)
    .eq('status', 'waiting');

  // 2. Consultations completed today
  const { count: consultationsCompleted } = await supabase
    .from('consultations')
    .select('id', { count: 'exact', head: true })
    .eq('doctor_id', doctorId)
    // consultations doesn't have a specific completion date column other than updated_at, 
    // assuming updated_at reflects completion if status='completed'
    .eq('status', 'completed')
    .gte('updated_at', todayISO.toISOString());

  // 3. Pending prescription requests (if prescription_requests exists and uses reviewed_by or target doctor)
  // We'll just fetch requests where status is pending for this doctor's prescriptions.
  // This requires a join, so we might need a more complex query, but we can also just fetch pending.
  const { data: pendingReqs } = await supabase
    .from('prescription_requests')
    .select('id, prescriptions!inner(doctor_id)')
    .eq('status', 'pending')
    .eq('prescriptions.doctor_id', doctorId);

  // 4. Follow-ups due today
  const { count: followupsDue } = await supabase
    .from('prognosis_logs')
    .select('id', { count: 'exact', head: true })
    .eq('doctor_id', doctorId)
    .eq('followup_date', today);

  return {
    queueWaiting: queueWaiting || 0,
    consultationsCompleted: consultationsCompleted || 0,
    prescriptionRequestsPending: pendingReqs ? pendingReqs.length : 0,
    followupsDue: followupsDue || 0,
  };
};

export const reportsService = {
  getDashboardStats,
  getDoctorDashboardStats,
  getPharmacistDashboardStats,
};
