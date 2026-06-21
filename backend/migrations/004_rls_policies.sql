-- ═══════════════════════════════════════════════════════════════
-- HMS Database — Row Level Security Policies
-- ═══════════════════════════════════════════════════════════════

-- Enable RLS on all tables
ALTER TABLE users ENABLE ROW LEVEL SECURITY;
ALTER TABLE patient_profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE case_sheets ENABLE ROW LEVEL SECURITY;
ALTER TABLE female_case_sheets ENABLE ROW LEVEL SECURITY;
ALTER TABLE consultations ENABLE ROW LEVEL SECURITY;
ALTER TABLE prescriptions ENABLE ROW LEVEL SECURITY;
ALTER TABLE prescription_requests ENABLE ROW LEVEL SECURITY;
ALTER TABLE queue_tokens ENABLE ROW LEVEL SECURITY;
ALTER TABLE billing ENABLE ROW LEVEL SECURITY;
ALTER TABLE payments ENABLE ROW LEVEL SECURITY;
ALTER TABLE audit_logs ENABLE ROW LEVEL SECURITY;
ALTER TABLE patient_documents ENABLE ROW LEVEL SECURITY;
ALTER TABLE prognosis_logs ENABLE ROW LEVEL SECURITY;
ALTER TABLE website_content ENABLE ROW LEVEL SECURITY;

-- Helper function: get current user role
CREATE OR REPLACE FUNCTION current_user_role()
RETURNS TEXT AS $$
  SELECT r.name FROM users u
  JOIN roles r ON r.id = u.role_id
  WHERE u.id = auth.uid()
$$ LANGUAGE sql STABLE SECURITY DEFINER;

-- ── Patient profiles ────────────────────────────────────────────
CREATE POLICY "staff_read_patients" ON patient_profiles
  FOR SELECT USING (current_user_role() IN ('super_admin', 'admin', 'doctor'));

CREATE POLICY "patient_read_own" ON patient_profiles
  FOR SELECT USING (user_id = auth.uid());

CREATE POLICY "admin_create_patient" ON patient_profiles
  FOR INSERT WITH CHECK (current_user_role() IN ('super_admin', 'admin'));

CREATE POLICY "admin_update_patient" ON patient_profiles
  FOR UPDATE USING (current_user_role() IN ('super_admin', 'admin'));

-- ── Case sheets ─────────────────────────────────────────────────
CREATE POLICY "staff_read_case_sheets" ON case_sheets
  FOR SELECT USING (current_user_role() IN ('super_admin', 'admin', 'doctor'));

CREATE POLICY "patient_read_own_case_sheet" ON case_sheets
  FOR SELECT USING (
    patient_id IN (SELECT id FROM patient_profiles WHERE user_id = auth.uid())
  );

CREATE POLICY "admin_patient_create_case_sheet" ON case_sheets
  FOR INSERT WITH CHECK (current_user_role() IN ('super_admin', 'admin', 'patient'));

-- ── Prescriptions ───────────────────────────────────────────────
CREATE POLICY "doctor_read_prescriptions" ON prescriptions
  FOR SELECT USING (
    current_user_role() = 'doctor' AND doctor_id = auth.uid()
  );

CREATE POLICY "admin_read_prescriptions" ON prescriptions
  FOR SELECT USING (current_user_role() IN ('super_admin', 'admin'));

CREATE POLICY "pharmacist_read_prescriptions" ON prescriptions
  FOR SELECT USING (
    current_user_role() = 'pharmacist'
    AND status = 'approved'
    AND created_at::DATE = CURRENT_DATE
  );

CREATE POLICY "patient_read_own_prescription" ON prescriptions
  FOR SELECT USING (
    current_user_role() = 'patient'
    AND patient_id IN (SELECT id FROM patient_profiles WHERE user_id = auth.uid())
    AND id IN (
      SELECT prescription_id FROM prescription_requests
      WHERE status = 'approved'
    )
  );

CREATE POLICY "doctor_create_prescription" ON prescriptions
  FOR INSERT WITH CHECK (current_user_role() = 'doctor' AND doctor_id = auth.uid());

-- ── Queue tokens ────────────────────────────────────────────────
CREATE POLICY "admin_doctor_read_queue" ON queue_tokens
  FOR SELECT USING (current_user_role() IN ('super_admin', 'admin', 'doctor'));

CREATE POLICY "patient_read_own_token" ON queue_tokens
  FOR SELECT USING (
    patient_id IN (SELECT id FROM patient_profiles WHERE user_id = auth.uid())
  );

CREATE POLICY "admin_manage_queue" ON queue_tokens
  FOR ALL USING (current_user_role() IN ('super_admin', 'admin'));

-- ── Audit logs ──────────────────────────────────────────────────
CREATE POLICY "super_admin_read_audit" ON audit_logs
  FOR SELECT USING (current_user_role() IN ('super_admin', 'admin'));

CREATE POLICY "service_write_audit" ON audit_logs
  FOR INSERT WITH CHECK (true);

-- ── Billing ─────────────────────────────────────────────────────
CREATE POLICY "admin_read_billing" ON billing
  FOR SELECT USING (current_user_role() IN ('super_admin', 'admin'));

CREATE POLICY "patient_read_own_billing" ON billing
  FOR SELECT USING (
    patient_id IN (SELECT id FROM patient_profiles WHERE user_id = auth.uid())
  );

CREATE POLICY "admin_manage_billing" ON billing
  FOR ALL USING (current_user_role() IN ('super_admin', 'admin'));

-- ── Consultations ───────────────────────────────────────────────
CREATE POLICY "staff_read_consultations" ON consultations
  FOR SELECT USING (current_user_role() IN ('super_admin', 'admin', 'doctor'));

CREATE POLICY "doctor_create_consultation" ON consultations
  FOR INSERT WITH CHECK (current_user_role() = 'doctor' AND doctor_id = auth.uid());

CREATE POLICY "doctor_update_consultation" ON consultations
  FOR UPDATE USING (current_user_role() = 'doctor' AND doctor_id = auth.uid());
