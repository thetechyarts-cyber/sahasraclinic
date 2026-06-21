import { supabase } from '../../config/supabase';
import { AppError } from '../../utils/app-error';
import { logger } from '../../utils/logger';
import { CreateCaseSheetPayload, UpdateCaseSheetPayload } from './case-sheet.schema';

import { env } from '../../config/env';
import { sendPaymentWhatsApp } from '../../utils/whatsapp';
import { resolvePatientId } from '../../utils/helpers';

const create = async (payload: CreateCaseSheetPayload, userId: string) => {
  const actualPatientId = await resolvePatientId(payload.patient_id);

  const { data: caseSheet, error } = await supabase
    .from('case_sheets')
    .insert({
      patient_id: actualPatientId,
      type: payload.type,
      chief_complaint: payload.chief_complaint,
      history: payload.history || {},
      vitals: payload.vitals || {},
      status: payload.status,
      created_by: userId,
    })
    .select()
    .single();

  if (error || !caseSheet) {
    logger.error('Failed to create case sheet:', error);
    throw new AppError('Failed to create case sheet', 500);
  }

  // Handle female history if provided and type is female
  if (payload.type === 'female' && payload.female_history) {
    const { error: femaleError } = await supabase.from('female_case_sheets').insert({
      case_sheet_id: caseSheet.id,
      patient_id: actualPatientId,
      menstrual_history: payload.female_history.menstrual_history || {},
      pregnancy_history: payload.female_history.pregnancy_history || {},
      lmp_date: payload.female_history.lmp_date || null,
      lmp_details: payload.female_history.lmp_details || null,
      obstetric_history: payload.female_history.obstetric_history || {},
      gynaecological_history: payload.female_history.gynaecological_history || {},
      contraceptive_history: payload.female_history.contraceptive_history || null,
      notes: payload.female_history.notes || null,
    });

    if (femaleError) {
      logger.error('Failed to create female case sheet data:', femaleError);
      throw new AppError('Failed to save female-specific data', 500);
    }
  }

  let createdPayment = null;

  // If online case sheet, generate billing, payment, and send WhatsApp
  if (payload.type === 'online') {
    // Standard consultation fee
    const consultationFee = 500.00;

    const { data: billing, error: billingError } = await supabase
      .from('billing')
      .insert({
        patient_id: actualPatientId,
        case_sheet_id: caseSheet.id,
        amount: consultationFee,
        mode: 'upi',
        status: 'pending',
      })
      .select()
      .single();

    if (billingError || !billing) {
      logger.error('Failed to create billing record', billingError);
    } else {
      const { data: payment } = await supabase.from('payments').insert({
        billing_id: billing.id,
        amount: consultationFee,
        status: 'pending',
      }).select().single();
      
      createdPayment = payment;

      // Get patient phone and name
      const { data: patientData } = await supabase
        .from('patient_profiles')
        .select('phone, users ( name )')
        .eq('id', actualPatientId)
        .single();

      if (patientData?.phone && (patientData.users as any)?.name) {
        const patientName = (patientData.users as any).name;
        // Construct upload link
        const uploadLink = `${env.APP_URL}/payments/upload/${billing.id}`;
        
        try {
          await sendPaymentWhatsApp(patientData.phone, patientName, String(consultationFee), uploadLink);
          logger.info(`WhatsApp payment link sent to ${patientData.phone}`);
        } catch (waError) {
          logger.error('Failed to send WhatsApp payment link', waError);
          // Do not fail the case sheet creation if WhatsApp fails
        }
      }
    }
  }

  // Audit
  await supabase.from('audit_logs').insert({
    user_id: userId,
    action: 'CASE_SHEET_CREATED',
    module: 'case-sheets',
    entity_id: caseSheet.id,
  });

  return { ...caseSheet, payment: createdPayment };
};

const getById = async (id: string) => {
  const { data: caseSheet, error } = await supabase
    .from('case_sheets')
    .select('*, female_case_sheets(*), patient_documents(*)')
    .eq('id', id)
    .single();

  if (error || !caseSheet) {
    throw new AppError('Case sheet not found', 404);
  }

  return caseSheet;
};

const update = async (id: string, payload: UpdateCaseSheetPayload, userId: string) => {
  const { female_history, ...updates } = payload;

  const { data: caseSheet, error } = await supabase
    .from('case_sheets')
    .update(updates)
    .eq('id', id)
    .select()
    .single();

  if (error || !caseSheet) {
    throw new AppError('Failed to update case sheet', 500);
  }

  if (female_history && caseSheet.type === 'female') {
    // Upsert logic for female_case_sheets
    const { data: existingFemaleRow } = await supabase
      .from('female_case_sheets')
      .select('id')
      .eq('case_sheet_id', id)
      .maybeSingle();

    if (existingFemaleRow) {
      await supabase
        .from('female_case_sheets')
        .update(female_history)
        .eq('case_sheet_id', id);
    } else {
      await supabase
        .from('female_case_sheets')
        .insert({
          case_sheet_id: id,
          patient_id: caseSheet.patient_id,
          ...female_history,
        });
    }
  }

  await supabase.from('audit_logs').insert({
    user_id: userId,
    action: 'CASE_SHEET_UPDATED',
    module: 'case-sheets',
    entity_id: id,
  });

  return caseSheet;
};

const uploadDocument = async (caseSheetId: string, patientId: string, file: Express.Multer.File, userId: string) => {
  // Construct path: patients/{patientId}/reports/{filename}_{timestamp}
  const timestamp = Date.now();
  const ext = file.originalname.split('.').pop() || '';
  const safeName = file.originalname.replace(/[^a-z0-9]/gi, '_').toLowerCase();
  const fileName = `${safeName}_${timestamp}.${ext}`;
  const filePath = `patients/${patientId}/reports/${fileName}`;

  const { data: uploadData, error: uploadError } = await supabase.storage
    .from('patient-documents') // Assuming bucket is 'patient-documents'
    .upload(filePath, file.buffer, {
      contentType: file.mimetype,
      upsert: false,
    });

  if (uploadError) {
    logger.error('Supabase Storage Error:', uploadError);
    throw new AppError('Failed to upload document to storage', 500);
  }

  const fileUrl = `${supabase.storage.from('patient-documents').getPublicUrl(filePath).data.publicUrl}`;
  let fileType = 'pdf';
  if (file.mimetype.startsWith('image/')) fileType = 'image';
  else if (file.mimetype.startsWith('audio/')) fileType = 'audio';
  else if (file.mimetype.startsWith('video/')) fileType = 'video';

  const { data: doc, error: dbError } = await supabase
    .from('patient_documents')
    .insert({
      patient_id: patientId,
      case_sheet_id: caseSheetId,
      file_type: fileType,
      file_name: file.originalname,
      file_url: fileUrl,
      file_size: file.size,
      uploaded_by: userId,
    })
    .select()
    .single();

  if (dbError) {
    throw new AppError('Failed to save document record', 500);
  }

  return doc;
};

const deleteDocument = async (docId: string, deletedBy: string) => {
  // Check if document exists
  const { data: doc, error: fetchError } = await supabase
    .from('patient_documents')
    .select('*')
    .eq('id', docId)
    .single();

  if (fetchError || !doc) {
    throw new AppError('Document not found', 404);
  }

  // Delete from storage
  const filePathMatch = doc.file_url.match(/patient-documents\/(.+)$/);
  if (filePathMatch && filePathMatch[1]) {
    await supabase.storage.from('patient-documents').remove([filePathMatch[1]]);
  }

  // Delete from DB
  const { error: deleteError } = await supabase
    .from('patient_documents')
    .delete()
    .eq('id', docId);

  if (deleteError) {
    logger.error('Failed to delete document', deleteError);
    throw new AppError('Failed to delete document', 500);
  }

  await supabase.from('audit_logs').insert({
    user_id: deletedBy,
    action: 'DOCUMENT_DELETED',
    module: 'case_sheets',
    entity_id: docId,
  });

  return true;
};

export const caseSheetService = {
  create,
  getById,
  update,
  uploadDocument,
  deleteDocument,
};
