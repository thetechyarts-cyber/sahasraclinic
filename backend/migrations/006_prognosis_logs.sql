-- Migration 006: Prognosis Logs
-- The prognosis_logs table and triggers were already created in 001_initial_schema.sql and 003_triggers.sql
-- This file only adds the Row Level Security (RLS) policies for Phase 7 (Prognosis & Follow-up)

-- Admins and Super Admins can see all logs
CREATE POLICY "Admins can view all prognosis logs" ON prognosis_logs
  FOR SELECT USING (
    EXISTS (SELECT 1 FROM users WHERE id = auth.uid() AND role_id IN (
      SELECT id FROM roles WHERE name IN ('super_admin', 'admin')
    ))
  );

-- Doctors can see logs for their patients
CREATE POLICY "Doctors can view and manage prognosis logs" ON prognosis_logs
  FOR ALL USING (
    doctor_id = auth.uid() OR
    EXISTS (SELECT 1 FROM users WHERE id = auth.uid() AND role_id = (SELECT id FROM roles WHERE name = 'doctor'))
  );

-- Patients can view their own logs
CREATE POLICY "Patients can view their own logs" ON prognosis_logs
  FOR SELECT USING (
    patient_id IN (SELECT id FROM patient_profiles WHERE user_id = auth.uid())
  );
