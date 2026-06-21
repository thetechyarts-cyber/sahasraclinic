import { supabase } from '../../config/supabase';
import { AppError } from '../../utils/app-error';
import { logger } from '../../utils/logger';
import { sendPaymentConfirmationEmail } from '../../utils/mailer';

export const markPaymentPaid = async (
  paymentId: string,
  payload: { status: 'success' | 'failed'; notes?: string },
  userId: string
) => {
  // 1. Get payment
  const { data: payment, error: fetchError } = await supabase
    .from('payments')
    .select('id, billing_id, status, billing ( patient_id, amount )')
    .eq('id', paymentId)
    .single();

  if (fetchError || !payment) {
    throw new AppError('Payment not found', 404);
  }

  if (payment.status !== 'pending') {
    throw new AppError(`Payment is already marked as ${payment.status}`, 400);
  }

  const patientId = (payment.billing as any)?.patient_id;

  // 2. Update payment status
  const { error: paymentError } = await supabase
    .from('payments')
    .update({ status: payload.status, updated_at: new Date().toISOString() })
    .eq('id', paymentId);

  if (paymentError) {
    logger.error('Failed to update payment status', paymentError);
    throw new AppError('Failed to update payment', 500);
  }

  // 3. Update billing status
  const billingStatus = payload.status === 'success' ? 'paid' : 'failed';
  const { error: billingError } = await supabase
    .from('billing')
    .update({
      status: billingStatus,
      marked_paid_by: userId,
      marked_paid_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    })
    .eq('id', payment.billing_id);

  if (billingError) {
    logger.error('Failed to update billing status', billingError);
    throw new AppError('Failed to update billing status', 500);
  }

  // 4. Log audit
  await supabase.from('audit_logs').insert({
    user_id: userId,
    action: payload.status === 'success' ? 'PAYMENT_MARKED_PAID' : 'PAYMENT_MARKED_FAILED',
    module: 'payments',
    entity_id: paymentId,
    metadata: { notes: payload.notes },
  });

  // 5. Generate queue token if successful
  if (payload.status === 'success') {
    // Check if they already have a queue token today
    const { data: existingToken } = await supabase
      .from('queue_tokens')
      .select('id')
      .eq('billing_id', payment.billing_id)
      .maybeSingle();

    if (!existingToken) {
      // Get next token number
      const { data: latestToken } = await supabase
        .from('queue_tokens')
        .select('token_number')
        .eq('date', new Date().toISOString().split('T')[0])
        .order('token_number', { ascending: false })
        .limit(1)
        .maybeSingle();

      const nextNumber = latestToken ? latestToken.token_number + 1 : 1;

      await supabase.from('queue_tokens').insert({
        patient_id: patientId,
        billing_id: payment.billing_id,
        token_number: nextNumber,
        status: 'waiting',
      });
      logger.info(`Generated queue token ${nextNumber} for payment ${paymentId}`);

      // Fetch user details for email
      const { data: patientProfile } = await supabase
        .from('patient_profiles')
        .select('users(name, email)')
        .eq('id', patientId)
        .single();
        
      if (patientProfile && patientProfile.users) {
        try {
          await sendPaymentConfirmationEmail(
            (patientProfile.users as any).email,
            (patientProfile.users as any).name,
            String((payment.billing as any).amount || '0')
          );
          logger.info(`Payment confirmation email sent to ${(patientProfile.users as any).email}`);
        } catch (err) {
          logger.error('Failed to send payment confirmation email', err);
        }
      }
    }
  }

  return { message: 'Payment status updated successfully', paymentId, status: payload.status };
};

export const getPatientPayments = async (patientId: string) => {
  const { data, error } = await supabase
    .from('billing')
    .select(`
      id,
      amount,
      mode,
      status,
      created_at,
      case_sheet_id,
      payments (
        id,
        status,
        screenshot_url,
        upi_ref,
        created_at
      )
    `)
    .eq('patient_id', patientId)
    .order('created_at', { ascending: false });

  if (error) {
    logger.error('Failed to fetch patient payments', error);
    throw new AppError('Failed to fetch payment history', 500);
  }

  return data;
};

export const getPendingPayments = async () => {
  const { data, error } = await supabase
    .from('payments')
    .select(`
      id,
      amount,
      status,
      screenshot_url,
      upi_ref,
      created_at,
      billing ( id, case_sheet_id, patient_id, status )
    `)
    .eq('status', 'pending')
    .not('screenshot_url', 'is', null)
    .order('created_at', { ascending: false });

  if (error) {
    logger.error('Failed to fetch pending payments', error);
    throw new AppError('Failed to fetch pending payments', 500);
  }

  return data;
};

export const uploadScreenshot = async (paymentId: string, file: Express.Multer.File, upiRef: string, userId: string) => {
  const timestamp = Date.now();
  const ext = file.originalname.split('.').pop() || 'jpg';
  const filePath = `screenshots/${paymentId}_${timestamp}.${ext}`;

  const { error: uploadError } = await supabase.storage
    .from('patient-payments')
    .upload(filePath, file.buffer, { contentType: file.mimetype });

  if (uploadError) {
    logger.error('Supabase Storage Error:', uploadError);
    throw new AppError('Failed to upload screenshot to storage', 500);
  }

  const fileUrl = `${supabase.storage.from('patient-payments').getPublicUrl(filePath).data.publicUrl}`;

  const { error: updateError } = await supabase
    .from('payments')
    .update({ screenshot_url: fileUrl, upi_ref: upiRef, updated_at: new Date().toISOString() })
    .eq('id', paymentId);

  if (updateError) {
    logger.error('Failed to update payment with screenshot', updateError);
    throw new AppError('Failed to save screenshot details', 500);
  }

  await supabase.from('audit_logs').insert({
    user_id: userId,
    action: 'PAYMENT_SCREENSHOT_UPLOADED',
    module: 'payments',
    entity_id: paymentId,
    metadata: { upiRef },
  });

  return { message: 'Screenshot uploaded successfully', screenshot_url: fileUrl };
};

export const paymentService = {
  markPaymentPaid,
  getPatientPayments,
  getPendingPayments,
  uploadScreenshot,
};
