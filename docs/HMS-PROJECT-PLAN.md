# Sahasra Clinic: Complete Project Plan

> **Stack:** Next.js · Node.js + Express · Supabase (PostgreSQL + Storage) · Razorpay · SendGrid · Twilio · WhatsApp Business API
> **Auth:** Supabase Auth (JWT + OTP + RBAC)
> **UI:** Tailwind CSS + ShadCN UI
> **Deployment:** Vercel (frontend) · Railway / DigitalOcean (backend) · Supabase (DB)

---

## Roles Overview

| Role | Key Permissions |
|------|----------------|
| Super Admin | Create orgs, manage roles, subscriptions, system settings, all reports |
| Admin | Register patients, billing, documents, queue, CMS, mark payments |
| Doctor | Assigned patients only, consultation, prescription, prognosis, approve requests |
| Pharmacist | Today's approved prescriptions only, dispense, mark as dispensed |
| Patient | Case sheet, upload reports, payments, request prescription copy |

---

## Patient Flow Summary

### Offline (In-Clinic)
1. Patient registration
2. Admin creates offline case sheet
3. Upload reports
4. **Admin marks as paid** (payment collected at clinic)
5. Added to queue (token generated)
6. Doctor consultation (views case sheet, writes notes)
7. Prescription created by doctor
8. Prescription sent to pharmacist → pharmacist dispenses medicine
9. Patient requests prescription copy → request sent to doctor
10. Doctor approves request
11. Patient receives prescription

### Online
1. Patient registers / logs in
2. Patient creates online case sheet
3. Upload reports
4. **WhatsApp sent automatically** with case sheet info + payment link
5. Patient pays online (Manual UPI and uploads screenshot)
6. Admin verifies screenshot and marks as paid → patient added to queue
7. Doctor consultation
8. Prescription created (no pharmacist involved)
9. Patient requests prescription copy → request sent to doctor
10. Doctor approves request
11. Patient receives prescription

---

## Phase 1 — Project Setup & Foundation
**Goal:** Boilerplate, DB schema, auth, RBAC working end-to-end.
**Estimated Time:** 1 week

### 1.1 Repository & Tooling
- [ ] Init monorepo: `/frontend` (Next.js) + `/backend` (Node.js)
- [ ] Configure ESLint, Prettier, Husky pre-commit hooks
- [ ] Setup `.env.example` for all secrets
- [ ] Configure absolute imports and path aliases
- [ ] Setup GitHub repo with branch protection (main, dev, feature/*)

### 1.2 Supabase Setup
- [ ] Create Supabase project
- [ ] Enable Row Level Security (RLS) on all tables
- [ ] Create all database tables (see schema below)
- [ ] Configure Supabase Storage buckets with folder structure
- [ ] Setup Supabase Auth with JWT + OTP
- [ ] Write seed data for roles and permissions

### 1.3 Database Schema (Supabase PostgreSQL)

```sql
-- Core auth & roles
users (id, name, email, password_hash, role_id, status, created_at)
roles (id, name, description)
permissions (id, name, module)
user_roles (user_id, role_id)

-- Patient data
patient_profiles (id, user_id, gender, dob, phone, address, ...)
case_sheets (id, patient_id, type, data, status, created_at)
female_case_sheets (id, patient_id, menstrual_history, pregnancy_history, lmp, ...)

-- Clinical
consultations (id, patient_id, doctor_id, date, notes, diagnosis)
prescriptions (id, consultation_id, data, status, approved_by, approved_at)
prescription_requests (id, patient_id, prescription_id, request_type, status)
prognosis_logs (id, patient_id, prescription_id, feedback, mood, followup_date)

-- Operations
billing (id, patient_id, amount, mode, status, tan_ref, created_at)
payments (id, billing_id, gateway, tan, sl, status, created_at)
patient_documents (id, patient_id, file_type, file_url, created_at)
queue_tokens (id, patient_id, token, no, status, created_at)

-- System
audit_logs (id, user_id, action, module, entity_id, ip, created_at)
website_content (id, type, title, content, status, created_at)
```

### 1.4 Storage Buckets (Supabase)
```
/patients/{patient_id}/reports/
/patients/{patient_id}/images/
/patients/{patient_id}/audio/
/patients/{patient_id}/video/
/prescriptions/{id}/pdf/
/invoices/{id}/pdf/
```

### 1.5 Backend Foundation
- [ ] Setup Express server with middleware (cors, helmet, morgan, rate-limit)
- [ ] JWT auth middleware
- [ ] RBAC middleware (role + permission check)
- [ ] Global error handler
- [ ] Request validation (Zod)
- [ ] API response formatter (success/error wrapper)
- [ ] Setup routes structure for all services

### 1.6 Frontend Foundation
- [ ] Init Next.js 14 with App Router
- [ ] Configure Tailwind CSS + ShadCN UI
- [ ] Setup auth context (Supabase Auth)
- [ ] Protected route wrapper per role
- [ ] Layout shells for each dashboard (Admin, Doctor, Pharmacist, Patient, Super Admin)
- [ ] Global toast / notification system
- [ ] Setup React Query for data fetching

---

## Phase 2 — Auth & User Management
**Goal:** Login, OTP, role-based routing, user CRUD.
**Estimated Time:** 4–5 days

### 2.1 Auth APIs
- [ ] `POST /auth/register` — patient self-register
- [ ] `POST /auth/login` — email + password → JWT
- [ ] `POST /auth/otp/send` — send OTP via SMS/email
- [ ] `POST /auth/otp/verify` — verify OTP
- [ ] `POST /auth/refresh` — refresh JWT
- [ ] `POST /auth/logout`

### 2.2 User Management APIs (Super Admin / Admin)
- [ ] `GET/POST /users` — list, create users
- [ ] `PUT/DELETE /users/:id` — update, deactivate
- [ ] `POST /users/:id/assign-role` — assign role
- [ ] `GET /roles` — list roles
- [ ] `POST /roles` — create role with permissions

### 2.3 Frontend Auth Pages
- [ ] Login page (email + password)
- [ ] OTP verification page
- [ ] Forgot password flow
- [ ] Role-based redirect after login
- [ ] Protected route HOC per role

---

## Phase 3 — Patient Registration & Case Sheet
**Goal:** Both offline and online patient registration, case sheet creation.
**Estimated Time:** 5–6 days

### 3.1 Patient Registration APIs
- [ ] `POST /patients` — register new patient (admin / self)
- [ ] `GET /patients` — search with 10+ parameters
- [ ] `GET /patients/:id` — full patient profile
- [ ] `PUT /patients/:id` — update profile

### 3.2 Patient Search Parameters
- Registration ID · First Name · Last Name · DOB
- Mobile Number · Email · Village / Town · Birth Place
- Last Consultation Date · Other parameters

### 3.3 Case Sheet APIs
- [ ] `POST /case-sheets` — create online / offline / female
- [ ] `GET /case-sheets/:id` — get case sheet
- [ ] `PUT /case-sheets/:id` — update case sheet
- [ ] `POST /case-sheets/:id/documents` — upload reports (PDF, image, audio, video)

### 3.4 Female Case Sheet Extra Fields
- Menstrual history, pregnancy history, LMP details
- Obstetric history, gynaecological history
- Contraceptive history, notes & observations

### 3.5 Frontend Pages
- [ ] Patient registration form (admin view)
- [ ] Online self-registration form (patient view)
- [ ] Case sheet form (online + offline + female variants)
- [ ] Document upload component (multi-file, drag & drop)
- [ ] Patient search page with filters (admin + doctor)
- [ ] Patient profile page

---

## Phase 4 — Payment & Queue Management
**Goal:** Payment flow (online + offline), queue token generation, real-time queue.
**Estimated Time:** 5–6 days

### 4.1 Payment APIs
- [ ] `POST /payments/:id/mark-paid` — admin manually marks as paid (both flows)
- [ ] `GET /payments/:patient_id` — payment history

### 4.2 WhatsApp Notification (Online Flow)
- [ ] Trigger WhatsApp message after case sheet creation
- [ ] Message contains: patient name, case sheet summary, payment link
- [ ] Integration: Meta WhatsApp Business API

### 4.3 Queue APIs
- [ ] `POST /queue/token` — generate token after payment confirmed
- [ ] `GET /queue` — get current queue list (admin + doctor)
- [ ] `PUT /queue/:id/status` — update status (waiting → in-consultation → completed / cancelled)
- [ ] `GET /queue/history` — past queue records

### 4.4 Real-time Queue (Supabase Realtime)
- [ ] Subscribe to queue table changes
- [ ] Audio + visual notification when token called
- [ ] Doctor sees their own queue only
- [ ] Admin sees full queue

### 4.5 Frontend Pages
- [ ] Payment page (Manual UPI details, screenshot upload)
- [ ] Admin payment management (mark as paid)
- [ ] Queue dashboard (admin view — full queue)
- [ ] Queue display (doctor view — their patients)
- [ ] Token display / waiting screen (patient view)

---

## Phase 5 — Doctor Consultation & Prescription
**Goal:** Consultation workflow, prescription creation, approval flow.
**Estimated Time:** 6–7 days

### 5.1 Consultation APIs
- [ ] `POST /consultations` — create consultation session
- [ ] `GET /consultations/:id` — get consultation with case sheet
- [ ] `PUT /consultations/:id` — update notes / diagnosis
- [ ] `GET /consultations/patient/:id` — consultation history

### 5.2 Prescription APIs
- [ ] `POST /prescriptions` — doctor creates prescription
- [ ] `GET /prescriptions/:id` — get prescription
- [ ] `PUT /prescriptions/:id/approve` — admin/doctor approves
- [ ] `GET /prescriptions/patient/:id` — patient prescription history

### 5.3 Prescription Request Flow
- [ ] `POST /prescription-requests` — patient requests copy
- [ ] `GET /prescription-requests` — doctor sees pending requests
- [ ] `PUT /prescription-requests/:id/approve` — doctor approves
- [ ] `PUT /prescription-requests/:id/reject` — doctor rejects

### 5.4 Prescription Visibility Rules
| Role | Can See |
|------|---------|
| Doctor | All prescriptions of assigned patients |
| Admin | All prescriptions — can approve / reject |
| Pharmacist | Only today's approved prescriptions |
| Patient | Only their own approved prescriptions (after doctor approval) |

### 5.5 Frontend Pages
- [ ] Doctor consultation page (case sheet + notes + diagnosis)
- [ ] Prescription creation form (medicine, dosage, instructions)
- [ ] Prescription PDF generator (download)
- [ ] Patient prescription request page
- [ ] Doctor — pending approval requests list
- [ ] Admin — prescription management

---

## Phase 6 — Pharmacist Module
**Goal:** Pharmacist dashboard, dispense flow (offline only).
**Estimated Time:** 3 days

### 6.1 Pharmacist APIs
- [ ] `GET /pharmacist/prescriptions` — today's approved prescriptions only
- [ ] `PUT /pharmacist/prescriptions/:id/dispense` — mark as dispensed
- [ ] `GET /pharmacist/prescriptions/history` — past dispensed records

### 6.2 Frontend Pages
- [ ] Pharmacist dashboard — today's prescription list
- [ ] Dispense action with confirmation
- [ ] No access to case sheets, patient profiles, or history

---

## Phase 7 — Prognosis & Follow-up
**Goal:** Post-consultation tracking, follow-up scheduling.
**Estimated Time:** 3 days

### 7.1 Prognosis APIs
- [ ] `POST /prognosis` — create prognosis entry
- [ ] `GET /prognosis/patient/:id` — full prognosis history
- [ ] `PUT /prognosis/:id` — update follow-up notes

### 7.2 Fields
- Patient feedback, recovery status, mood / well-being
- Follow-up date, progress notes, doctor review

### 7.3 Frontend Pages
- [ ] Prognosis form (doctor view)
- [ ] Follow-up calendar / schedule (doctor + admin)
- [ ] Patient prognosis history view

---

## Phase 8 — Auto Archive & Reactivation
**Goal:** Auto-archive inactive patients, admin/doctor reactivation.
**Estimated Time:** 2 days

### 8.1 Logic
- No activity for 4 months → status set to `archived`
- Hidden from all active lists and searches
- Admin / doctor can reactivate → status back to `active`

### 8.2 Implementation
- [ ] Supabase cron job (pg_cron) — runs nightly, archives inactive patients
- [ ] `PUT /patients/:id/reactivate` — admin / doctor reactivates
- [ ] Filter all patient list queries by status != archived by default
- [ ] Separate "Archived Patients" view for admin

---

## Phase 9 — Audit Trail & Security
**Goal:** Complete activity logging, security hardening.
**Estimated Time:** 2–3 days

### 9.1 Audit Log Events to Track
- User login / logout
- Case sheet created / updated
- Prescription created / approved
- Medicine dispensed
- Patient arrived / reactivated
- Role / permission changes
- Data deleted / modified
- Payment events

### 9.2 Security Checklist
- [ ] JWT expiry + refresh token rotation
- [ ] RBAC on every route (middleware)
- [ ] Data encryption at rest (Supabase default) and in transit (HTTPS)
- [ ] OTP expiry (5 minutes)
- [ ] Rate limiting per IP and per user
- [ ] DDoS protection (Cloudflare / hosting level)
- [ ] Session management (revoke on logout)
- [ ] Regular automated backups (Supabase)
- [ ] HTTPS enforced (no HTTP fallback)
- [ ] Input sanitization on all endpoints (Zod)

---

## Phase 10 — CMS (Website Content Management)
**Goal:** Super Admin manages public-facing website content.
**Estimated Time:** 2 days

### 10.1 CMS Sections
- Treatments, departments, doctors
- Testimonials, home page content
- FAQ, contact info, policies, hospital info

### 10.2 APIs
- [ ] `GET/POST/PUT/DELETE /cms/:type` — CRUD for each content type
- [ ] Frontend CMS editor (Super Admin only)
- [ ] Public API for website to fetch content

---

## Phase 11 — Notifications
**Goal:** Email, SMS, WhatsApp, in-app notifications.
**Estimated Time:** 2–3 days

### 11.1 Notification Triggers
| Event | Channel |
|-------|---------|
| Patient registered | Email |
| Payment link (online) | WhatsApp |
| Payment confirmed | SMS + Email |
| Queue token called | In-app + Audio |
| Prescription approved | SMS + In-app |
| Follow-up reminder | SMS + Email |
| OTP | SMS + Email |

### 11.2 Services
- Email: Nodemailer (Gmail SMTP)
- WhatsApp: Meta WhatsApp Business API
- In-app: Supabase Realtime

---

## Phase 12 — Reports & Analytics
**Goal:** Admin and Super Admin reporting.
**Estimated Time:** 2–3 days

### 12.1 Reports
- Daily patient count (online vs offline)
- Revenue report (by date range, payment mode)
- Doctor-wise consultation count
- Prescription / medicine dispensed report
- Queue efficiency (avg wait time)
- Audit log export

---

## Phase 13 — Testing & QA
**Goal:** Unit, integration, and E2E tests.
**Estimated Time:** 1 week

### 13.1 Backend Testing
- [ ] Unit tests for all service functions (Jest)
- [ ] Integration tests for all API routes (Supertest)
- [ ] Auth + RBAC tests

### 13.2 Frontend Testing
- [ ] Component tests (React Testing Library)
- [ ] E2E tests (Playwright) — critical flows only
  - Patient registration + payment + queue
  - Doctor consultation + prescription
  - Pharmacist dispense flow

---

## Phase 14 — Deployment & DevOps
**Goal:** Production-ready deployment with monitoring.
**Estimated Time:** 3–4 days

### 14.1 Infrastructure
- Frontend: Vercel (auto deploy from main branch)
- Backend: Railway / DigitalOcean App Platform
- Database: Supabase (managed)
- CDN + DDoS: Cloudflare

### 14.2 CI/CD
- [ ] GitHub Actions — lint + test on every PR
- [ ] Auto deploy to staging on merge to `dev`
- [ ] Manual promote to production from `main`

### 14.3 Monitoring
- Error tracking: Sentry (frontend + backend)
- Logs: Logtail / Papertrail
- Uptime: UptimeRobot

---

## Delivery Checklist (Before Go-Live)
- [ ] All RBAC rules tested across all 5 roles
- [ ] RLS policies verified on all Supabase tables
- [ ] WhatsApp message template approved by Meta
- [ ] All audit log events firing correctly
- [ ] PDF generation tested on all prescription formats
- [ ] Mobile responsiveness checked (PWA install tested)
- [ ] Backup and restore tested
- [ ] Load test done (queue + realtime)
- [ ] SSL certificate active on all domains
