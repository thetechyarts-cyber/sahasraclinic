# HMS — Database Schema & RLS Policies

> All tables, columns, relationships, and Row Level Security policies.

---

## Tables Overview

```
users                  ← auth accounts
roles                  ← super_admin, admin, doctor, pharmacist, patient
permissions            ← granular permissions per module
user_roles             ← junction: user ↔ role
patient_profiles       ← extended patient info
case_sheets            ← online / offline / female
female_case_sheets     ← extra fields for female patients
consultations          ← doctor consultation sessions
prescriptions          ← medicines, dosage, instructions
prescription_requests  ← patient requests copy
prognosis_logs         ← follow-up tracking
billing                ← invoice per visit
payments               ← payment transaction records
patient_documents      ← uploaded files (reports, images, audio, video)
queue_tokens           ← waiting room queue
audit_logs             ← all system activity
website_content        ← CMS content
```

---

## Full Schema (SQL)

```sql
-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- ─── ROLES & PERMISSIONS ───────────────────────────────────────

CREATE TABLE roles (
  id          UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name        TEXT UNIQUE NOT NULL,  -- 'super_admin', 'admin', 'doctor', 'pharmacist', 'patient'
  description TEXT,
  created_at  TIMESTAMPTZ DEFAULT now()
);

CREATE TABLE permissions (
  id         UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name       TEXT UNIQUE NOT NULL,  -- 'approve_prescription', 'view_queue'
  module     TEXT NOT NULL,         -- 'prescriptions', 'queue'
  created_at TIMESTAMPTZ DEFAULT now()
);

CREATE TABLE role_permissions (
  role_id       UUID REFERENCES roles(id) ON DELETE CASCADE,
  permission_id UUID REFERENCES permissions(id) ON DELETE CASCADE,
  PRIMARY KEY (role_id, permission_id)
);

-- ─── USERS ─────────────────────────────────────────────────────

CREATE TABLE users (
  id            UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  email         TEXT UNIQUE NOT NULL,
  password_hash TEXT NOT NULL,
  name          TEXT NOT NULL,
  role_id       UUID REFERENCES roles(id),
  status        TEXT DEFAULT 'active' CHECK (status IN ('active', 'inactive', 'suspended')),
  created_at    TIMESTAMPTZ DEFAULT now(),
  updated_at    TIMESTAMPTZ DEFAULT now()
);

-- ─── PATIENT PROFILES ──────────────────────────────────────────

CREATE TABLE patient_profiles (
  id                UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id           UUID REFERENCES users(id) ON DELETE CASCADE,
  registration_id   TEXT UNIQUE,           -- auto-generated e.g. HMS-2024-00001
  gender            TEXT CHECK (gender IN ('male', 'female', 'other')),
  dob               DATE,
  phone             TEXT,
  address           TEXT,
  village           TEXT,
  birth_place       TEXT,
  status            TEXT DEFAULT 'active' CHECK (status IN ('active', 'archived')),
  archived_at       TIMESTAMPTZ,
  created_at        TIMESTAMPTZ DEFAULT now(),
  updated_at        TIMESTAMPTZ DEFAULT now()
);

-- ─── CASE SHEETS ───────────────────────────────────────────────

CREATE TABLE case_sheets (
  id            UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  patient_id    UUID REFERENCES patient_profiles(id),
  type          TEXT CHECK (type IN ('online', 'offline', 'female')),
  chief_complaint TEXT,
  history       JSONB,                -- flexible history fields
  vitals        JSONB,                -- bp, pulse, temp, weight, height
  status        TEXT DEFAULT 'draft' CHECK (status IN ('draft', 'complete')),
  created_by    UUID REFERENCES users(id),
  created_at    TIMESTAMPTZ DEFAULT now(),
  updated_at    TIMESTAMPTZ DEFAULT now()
);

CREATE TABLE female_case_sheets (
  id                    UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  case_sheet_id         UUID REFERENCES case_sheets(id) ON DELETE CASCADE,
  patient_id            UUID REFERENCES patient_profiles(id),
  menstrual_history     JSONB,
  pregnancy_history     JSONB,
  lmp_date              DATE,
  lmp_details           TEXT,
  obstetric_history     JSONB,
  gynaecological_history JSONB,
  contraceptive_history TEXT,
  notes                 TEXT,
  created_at            TIMESTAMPTZ DEFAULT now(),
  updated_at            TIMESTAMPTZ DEFAULT now()
);

-- ─── DOCUMENTS ─────────────────────────────────────────────────

CREATE TABLE patient_documents (
  id            UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  patient_id    UUID REFERENCES patient_profiles(id),
  case_sheet_id UUID REFERENCES case_sheets(id),
  file_type     TEXT CHECK (file_type IN ('pdf', 'image', 'audio', 'video')),
  file_name     TEXT NOT NULL,
  file_url      TEXT NOT NULL,
  file_size     INTEGER,
  uploaded_by   UUID REFERENCES users(id),
  created_at    TIMESTAMPTZ DEFAULT now()
);

-- ─── BILLING & PAYMENTS ────────────────────────────────────────

CREATE TABLE billing (
  id            UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  patient_id    UUID REFERENCES patient_profiles(id),
  case_sheet_id UUID REFERENCES case_sheets(id),
  amount        DECIMAL(10,2) NOT NULL,
  mode          TEXT CHECK (mode IN ('online', 'offline', 'cash', 'card', 'upi')),
  status        TEXT DEFAULT 'pending' CHECK (status IN ('pending', 'paid', 'failed', 'refunded')),
  tan_ref       TEXT,
  marked_paid_by UUID REFERENCES users(id),
  marked_paid_at TIMESTAMPTZ,
  created_at    TIMESTAMPTZ DEFAULT now(),
  updated_at    TIMESTAMPTZ DEFAULT now()
);

CREATE TABLE payments (
  id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  billing_id      UUID REFERENCES billing(id),
  screenshot_url  TEXT,
  upi_ref         TEXT,
  request_type    TEXT, -- e.g., 'lost', 'renew'
  status          TEXT DEFAULT 'pending' CHECK (status IN ('pending', 'approved', 'rejected')),
  created_at      TIMESTAMPTZ DEFAULT now(),
  updated_at      TIMESTAMPTZ DEFAULT now()
);

CREATE TABLE prognosis_logs (
  id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  patient_id      UUID REFERENCES patient_profiles(id) NOT NULL,
  doctor_id       UUID REFERENCES users(id) NOT NULL,
  prescription_id UUID REFERENCES prescriptions(id) NULL,
  patient_feedback TEXT,
  recovery_status TEXT CHECK (recovery_status IN ('improving', 'stable', 'deteriorating', 'recovered')),
  mood            TEXT,
  progress_notes  TEXT,
  followup_date   TIMESTAMPTZ,
  created_at      TIMESTAMPTZ DEFAULT now(),
  updated_at      TIMESTAMPTZ DEFAULT now()
);

-- =========================================================================
-- OPERATIONS
-- =========================================================================

CREATE TABLE queue_tokens (
  id            UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  patient_id    UUID REFERENCES patient_profiles(id),
  billing_id    UUID REFERENCES billing(id),
  token_number  INTEGER NOT NULL,
  date          DATE DEFAULT CURRENT_DATE,
  status        TEXT DEFAULT 'waiting' CHECK (status IN ('waiting', 'in_consultation', 'completed', 'cancelled')),
  called_at     TIMESTAMPTZ,
  completed_at  TIMESTAMPTZ,
  created_at    TIMESTAMPTZ DEFAULT now(),
  updated_at    TIMESTAMPTZ DEFAULT now()
);

-- ─── CONSULTATIONS ─────────────────────────────────────────────

CREATE TABLE consultations (
  id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  patient_id      UUID REFERENCES patient_profiles(id),
  doctor_id       UUID REFERENCES users(id),
  case_sheet_id   UUID REFERENCES case_sheets(id),
  queue_token_id  UUID REFERENCES queue_tokens(id),
  notes           TEXT,
  diagnosis       TEXT,
  followup_date   DATE,
  status          TEXT DEFAULT 'active' CHECK (status IN ('active', 'completed')),
  created_at      TIMESTAMPTZ DEFAULT now(),
  updated_at      TIMESTAMPTZ DEFAULT now()
);

-- ─── PRESCRIPTIONS ─────────────────────────────────────────────

CREATE TABLE prescriptions (
  id                UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  consultation_id   UUID REFERENCES consultations(id),
  patient_id        UUID REFERENCES patient_profiles(id),
  doctor_id         UUID REFERENCES users(id),
  medicines         JSONB NOT NULL,   -- [{ name, dosage, frequency, duration, instructions }]
  notes             TEXT,
  status            TEXT DEFAULT 'created' CHECK (status IN ('created', 'approved', 'dispensed')),
  approved_by       UUID REFERENCES users(id),
  approved_at       TIMESTAMPTZ,
  dispensed_by      UUID REFERENCES users(id),
  dispensed_at      TIMESTAMPTZ,
  pdf_url           TEXT,
  created_at        TIMESTAMPTZ DEFAULT now(),
  updated_at        TIMESTAMPTZ DEFAULT now()
);

CREATE TABLE prescription_requests (
  id                UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  patient_id        UUID REFERENCES patient_profiles(id),
  prescription_id   UUID REFERENCES prescriptions(id),
  requested_by      UUID REFERENCES users(id),
  request_type      TEXT DEFAULT 'copy' CHECK (request_type IN ('copy', 'refill')),
  status            TEXT DEFAULT 'pending' CHECK (status IN ('pending', 'approved', 'rejected')),
  reviewed_by       UUID REFERENCES users(id),
  reviewed_at       TIMESTAMPTZ,
  created_at        TIMESTAMPTZ DEFAULT now()
);

-- ─── PROGNOSIS ─────────────────────────────────────────────────

CREATE TABLE prognosis_logs (
  id                UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  patient_id        UUID REFERENCES patient_profiles(id),
  prescription_id   UUID REFERENCES prescriptions(id),
  doctor_id         UUID REFERENCES users(id),
  feedback          TEXT,
  recovery_status   TEXT CHECK (recovery_status IN ('improving', 'stable', 'deteriorating', 'recovered')),
  mood              TEXT CHECK (mood IN ('good', 'neutral', 'poor')),
  wellbeing_score   INTEGER CHECK (wellbeing_score BETWEEN 1 AND 10),
  followup_date     DATE,
  progress_notes    TEXT,
  doctor_review     TEXT,
  created_at        TIMESTAMPTZ DEFAULT now(),
  updated_at        TIMESTAMPTZ DEFAULT now()
);

-- ─── AUDIT LOGS ────────────────────────────────────────────────

CREATE TABLE audit_logs (
  id          UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id     UUID REFERENCES users(id),
  action      TEXT NOT NULL,   -- 'LOGIN', 'PRESCRIPTION_APPROVED', 'PAYMENT_MARKED'
  module      TEXT NOT NULL,   -- 'auth', 'prescriptions', 'payments'
  entity_id   UUID,            -- ID of the affected record
  metadata    JSONB,           -- extra context
  ip          TEXT,
  created_at  TIMESTAMPTZ DEFAULT now()
);

-- ─── CMS ───────────────────────────────────────────────────────

CREATE TABLE website_content (
  id          UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  type        TEXT NOT NULL,   -- 'treatment', 'doctor', 'faq', 'testimonial'
  title       TEXT,
  content     JSONB,
  status      TEXT DEFAULT 'draft' CHECK (status IN ('draft', 'published', 'archived')),
  created_by  UUID REFERENCES users(id),
  created_at  TIMESTAMPTZ DEFAULT now(),
  updated_at  TIMESTAMPTZ DEFAULT now()
);
```

---

## Indexes

```sql
-- Frequently queried columns
CREATE INDEX idx_patient_profiles_status ON patient_profiles(status);
CREATE INDEX idx_patient_profiles_phone ON patient_profiles(phone);
CREATE INDEX idx_case_sheets_patient_id ON case_sheets(patient_id);
CREATE INDEX idx_queue_tokens_date_status ON queue_tokens(date, status);
CREATE INDEX idx_prescriptions_patient_id ON prescriptions(patient_id);
CREATE INDEX idx_prescriptions_status ON prescriptions(status);
CREATE INDEX idx_audit_logs_user_id ON audit_logs(user_id);
CREATE INDEX idx_audit_logs_created_at ON audit_logs(created_at);
CREATE INDEX idx_consultations_doctor_id ON consultations(doctor_id);
```

---

## Auto-updated `updated_at` Trigger

```sql
CREATE OR REPLACE FUNCTION set_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Apply to all tables with updated_at
CREATE TRIGGER trg_users_updated_at BEFORE UPDATE ON users FOR EACH ROW EXECUTE FUNCTION set_updated_at();
CREATE TRIGGER trg_patient_profiles_updated_at BEFORE UPDATE ON patient_profiles FOR EACH ROW EXECUTE FUNCTION set_updated_at();
CREATE TRIGGER trg_case_sheets_updated_at BEFORE UPDATE ON case_sheets FOR EACH ROW EXECUTE FUNCTION set_updated_at();
CREATE TRIGGER trg_billing_updated_at BEFORE UPDATE ON billing FOR EACH ROW EXECUTE FUNCTION set_updated_at();
CREATE TRIGGER trg_queue_tokens_updated_at BEFORE UPDATE ON queue_tokens FOR EACH ROW EXECUTE FUNCTION set_updated_at();
CREATE TRIGGER trg_consultations_updated_at BEFORE UPDATE ON consultations FOR EACH ROW EXECUTE FUNCTION set_updated_at();
CREATE TRIGGER trg_prescriptions_updated_at BEFORE UPDATE ON prescriptions FOR EACH ROW EXECUTE FUNCTION set_updated_at();
CREATE TRIGGER trg_prognosis_logs_updated_at BEFORE UPDATE ON prognosis_logs FOR EACH ROW EXECUTE FUNCTION set_updated_at();
```

---

## RLS Policies

```sql
-- Enable RLS on all tables
ALTER TABLE users ENABLE ROW LEVEL SECURITY;
ALTER TABLE patient_profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE case_sheets ENABLE ROW LEVEL SECURITY;
ALTER TABLE consultations ENABLE ROW LEVEL SECURITY;
ALTER TABLE prescriptions ENABLE ROW LEVEL SECURITY;
ALTER TABLE prescription_requests ENABLE ROW LEVEL SECURITY;
ALTER TABLE queue_tokens ENABLE ROW LEVEL SECURITY;
ALTER TABLE billing ENABLE ROW LEVEL SECURITY;
ALTER TABLE payments ENABLE ROW LEVEL SECURITY;
ALTER TABLE audit_logs ENABLE ROW LEVEL SECURITY;

-- Helper function: get current user role
CREATE OR REPLACE FUNCTION current_user_role()
RETURNS TEXT AS $$
  SELECT r.name FROM users u
  JOIN roles r ON r.id = u.role_id
  WHERE u.id = auth.uid()
$$ LANGUAGE sql STABLE SECURITY DEFINER;

-- ── Patient profiles ─────────────────────────────────────────────
-- Super admin + admin + doctor can read all
CREATE POLICY "staff_read_patients" ON patient_profiles
  FOR SELECT USING (current_user_role() IN ('super_admin', 'admin', 'doctor'));

-- Patient reads own profile only
CREATE POLICY "patient_read_own" ON patient_profiles
  FOR SELECT USING (user_id = auth.uid());

-- Admin creates patients
CREATE POLICY "admin_create_patient" ON patient_profiles
  FOR INSERT WITH CHECK (current_user_role() IN ('super_admin', 'admin'));

-- Admin updates patients
CREATE POLICY "admin_update_patient" ON patient_profiles
  FOR UPDATE USING (current_user_role() IN ('super_admin', 'admin'));

-- ── Case sheets ──────────────────────────────────────────────────
CREATE POLICY "staff_read_case_sheets" ON case_sheets
  FOR SELECT USING (current_user_role() IN ('super_admin', 'admin', 'doctor'));

CREATE POLICY "patient_read_own_case_sheet" ON case_sheets
  FOR SELECT USING (
    patient_id IN (SELECT id FROM patient_profiles WHERE user_id = auth.uid())
  );

CREATE POLICY "admin_patient_create_case_sheet" ON case_sheets
  FOR INSERT WITH CHECK (current_user_role() IN ('super_admin', 'admin', 'patient'));

-- ── Prescriptions ────────────────────────────────────────────────
-- Doctor sees assigned patients only
CREATE POLICY "doctor_read_prescriptions" ON prescriptions
  FOR SELECT USING (
    current_user_role() = 'doctor' AND doctor_id = auth.uid()
  );

-- Admin sees all
CREATE POLICY "admin_read_prescriptions" ON prescriptions
  FOR SELECT USING (current_user_role() IN ('super_admin', 'admin'));

-- Pharmacist sees today's approved only
CREATE POLICY "pharmacist_read_prescriptions" ON prescriptions
  FOR SELECT USING (
    current_user_role() = 'pharmacist'
    AND status = 'approved'
    AND created_at::DATE = CURRENT_DATE
  );

-- Patient sees own approved (only after request approved)
CREATE POLICY "patient_read_own_prescription" ON prescriptions
  FOR SELECT USING (
    current_user_role() = 'patient'
    AND patient_id IN (SELECT id FROM patient_profiles WHERE user_id = auth.uid())
    AND id IN (
      SELECT prescription_id FROM prescription_requests
      WHERE status = 'approved'
    )
  );

-- Doctor creates prescription
CREATE POLICY "doctor_create_prescription" ON prescriptions
  FOR INSERT WITH CHECK (current_user_role() = 'doctor' AND doctor_id = auth.uid());

-- ── Queue tokens ─────────────────────────────────────────────────
CREATE POLICY "admin_doctor_read_queue" ON queue_tokens
  FOR SELECT USING (current_user_role() IN ('super_admin', 'admin', 'doctor'));

CREATE POLICY "patient_read_own_token" ON queue_tokens
  FOR SELECT USING (
    patient_id IN (SELECT id FROM patient_profiles WHERE user_id = auth.uid())
  );

CREATE POLICY "admin_manage_queue" ON queue_tokens
  FOR ALL USING (current_user_role() IN ('super_admin', 'admin'));

-- ── Audit logs ───────────────────────────────────────────────────
CREATE POLICY "super_admin_read_audit" ON audit_logs
  FOR SELECT USING (current_user_role() IN ('super_admin', 'admin'));

-- Service role writes audit logs (backend only)
CREATE POLICY "service_write_audit" ON audit_logs
  FOR INSERT WITH CHECK (true);  -- controlled by backend service role
```

---

## Auto-Archive Cron Job

```sql
-- Run nightly via pg_cron (enable in Supabase extensions)
SELECT cron.schedule(
  'archive-inactive-patients',
  '0 2 * * *',   -- 2 AM every night
  $$
    UPDATE patient_profiles
    SET status = 'archived', archived_at = now()
    WHERE status = 'active'
      AND id NOT IN (
        SELECT DISTINCT patient_id FROM consultations
        WHERE created_at > now() - INTERVAL '4 months'
      )
      AND id NOT IN (
        SELECT DISTINCT patient_id FROM case_sheets
        WHERE created_at > now() - INTERVAL '4 months'
      );
  $$
);
```
