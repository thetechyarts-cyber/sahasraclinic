-- ═══════════════════════════════════════════════════════════════
-- HMS Database Schema — Initial Migration
-- Run in Supabase SQL Editor in order
-- ═══════════════════════════════════════════════════════════════

-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- ─── ROLES & PERMISSIONS ───────────────────────────────────────

CREATE TABLE roles (
  id          UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name        TEXT UNIQUE NOT NULL,
  description TEXT,
  created_at  TIMESTAMPTZ DEFAULT now()
);

CREATE TABLE permissions (
  id         UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name       TEXT UNIQUE NOT NULL,
  module     TEXT NOT NULL,
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
  registration_id   TEXT UNIQUE,
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
  id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  patient_id      UUID REFERENCES patient_profiles(id),
  type            TEXT CHECK (type IN ('online', 'offline', 'female')),
  chief_complaint TEXT,
  history         JSONB,
  vitals          JSONB,
  status          TEXT DEFAULT 'draft' CHECK (status IN ('draft', 'complete')),
  created_by      UUID REFERENCES users(id),
  created_at      TIMESTAMPTZ DEFAULT now(),
  updated_at      TIMESTAMPTZ DEFAULT now()
);

CREATE TABLE female_case_sheets (
  id                     UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  case_sheet_id          UUID REFERENCES case_sheets(id) ON DELETE CASCADE,
  patient_id             UUID REFERENCES patient_profiles(id),
  menstrual_history      JSONB,
  pregnancy_history      JSONB,
  lmp_date               DATE,
  lmp_details            TEXT,
  obstetric_history       JSONB,
  gynaecological_history JSONB,
  contraceptive_history  TEXT,
  notes                  TEXT,
  created_at             TIMESTAMPTZ DEFAULT now(),
  updated_at             TIMESTAMPTZ DEFAULT now()
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
  id             UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  patient_id     UUID REFERENCES patient_profiles(id),
  case_sheet_id  UUID REFERENCES case_sheets(id),
  amount         DECIMAL(10,2) NOT NULL,
  mode           TEXT CHECK (mode IN ('online', 'offline', 'cash', 'card', 'upi')),
  status         TEXT DEFAULT 'pending' CHECK (status IN ('pending', 'paid', 'failed', 'refunded')),
  tan_ref        TEXT,
  marked_paid_by UUID REFERENCES users(id),
  marked_paid_at TIMESTAMPTZ,
  created_at     TIMESTAMPTZ DEFAULT now(),
  updated_at     TIMESTAMPTZ DEFAULT now()
);

CREATE TABLE payments (
  id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  billing_id      UUID REFERENCES billing(id),
  gateway         TEXT DEFAULT 'razorpay',
  order_id        TEXT,
  payment_id      TEXT,
  signature       TEXT,
  amount          DECIMAL(10,2),
  status          TEXT DEFAULT 'pending' CHECK (status IN ('pending', 'success', 'failed')),
  created_at      TIMESTAMPTZ DEFAULT now(),
  updated_at      TIMESTAMPTZ DEFAULT now()
);

-- ─── QUEUE ─────────────────────────────────────────────────────

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
  medicines         JSONB NOT NULL,
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
  action      TEXT NOT NULL,
  module      TEXT NOT NULL,
  entity_id   UUID,
  metadata    JSONB,
  ip          TEXT,
  created_at  TIMESTAMPTZ DEFAULT now()
);

-- ─── CMS ───────────────────────────────────────────────────────

CREATE TABLE website_content (
  id          UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  type        TEXT NOT NULL,
  title       TEXT,
  content     JSONB,
  status      TEXT DEFAULT 'draft' CHECK (status IN ('draft', 'published', 'archived')),
  created_by  UUID REFERENCES users(id),
  created_at  TIMESTAMPTZ DEFAULT now(),
  updated_at  TIMESTAMPTZ DEFAULT now()
);
