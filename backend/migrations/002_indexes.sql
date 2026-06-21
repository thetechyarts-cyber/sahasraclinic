-- ═══════════════════════════════════════════════════════════════
-- HMS Database — Performance Indexes
-- ═══════════════════════════════════════════════════════════════

CREATE INDEX idx_patient_profiles_status ON patient_profiles(status);
CREATE INDEX idx_patient_profiles_phone ON patient_profiles(phone);
CREATE INDEX idx_patient_profiles_user_id ON patient_profiles(user_id);
CREATE INDEX idx_case_sheets_patient_id ON case_sheets(patient_id);
CREATE INDEX idx_case_sheets_status ON case_sheets(status);
CREATE INDEX idx_queue_tokens_date_status ON queue_tokens(date, status);
CREATE INDEX idx_prescriptions_patient_id ON prescriptions(patient_id);
CREATE INDEX idx_prescriptions_status ON prescriptions(status);
CREATE INDEX idx_prescriptions_doctor_id ON prescriptions(doctor_id);
CREATE INDEX idx_audit_logs_user_id ON audit_logs(user_id);
CREATE INDEX idx_audit_logs_created_at ON audit_logs(created_at);
CREATE INDEX idx_audit_logs_module ON audit_logs(module);
CREATE INDEX idx_consultations_doctor_id ON consultations(doctor_id);
CREATE INDEX idx_consultations_patient_id ON consultations(patient_id);
CREATE INDEX idx_billing_patient_id ON billing(patient_id);
CREATE INDEX idx_billing_status ON billing(status);
CREATE INDEX idx_users_email ON users(email);
CREATE INDEX idx_users_role_id ON users(role_id);
