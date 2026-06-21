# HMS — Complete Panel Breakdowns (All Roles)

> Detailed breakdown of every panel, every feature, every restriction,
> and daily workflow for all 5 roles in the HMS project.

---

## Table of Contents

1. [Super Admin Panel](#1-super-admin-panel)
2. [Admin Panel](#2-admin-panel)
3. [Doctor Panel](#3-doctor-panel)
4. [Pharmacist Panel](#4-pharmacist-panel)
5. [Patient Portal](#5-patient-portal)
6. [All Panels Comparison Table](#6-all-panels-comparison-table)

---

## 1. SUPER ADMIN PANEL

### Dashboard (First screen after login)
- Total hospitals / organizations registered
- Total users across all roles
- System health status
- Recent audit log entries
- Active subscriptions count

---

### Organization / Hospital Management
- Create new hospital / organization
- View all registered hospitals
- Edit hospital details (name, address, contact)
- Activate / deactivate a hospital
- Each hospital has its own set of users and data

---

### User Management
- View all users across all roles
- Create new user (any role — admin, doctor, pharmacist)
- Edit user details
- Assign / change role
- Activate / deactivate user account
- Reset user password

---

### Role & Permission Management
- View all roles (super_admin, admin, doctor, pharmacist, patient)
- Create custom roles if needed
- Assign permissions per role
- Edit what each role can and cannot do

---

### Subscription / Plan Management
- View active subscriptions per hospital
- Create / edit subscription plans
- Assign plan to hospital
- View expiry dates
- Renew or cancel subscriptions

---

### CMS (Website Content Management)
Controls what appears on the public landing page:

- **Hero section** — hospital name, tagline, banner image, CTA button text
- **About section** — hospital description, highlights (years, doctors, patients)
- **Testimonials** — add, edit, delete patient reviews (name, review, rating)
- **Contact section** — address, phone, email, map link
- **Footer** — quick links, social media handles, copyright text
- Publish / unpublish any section
- Draft mode before publishing

---

### Audit Logs
- See every single action done by every user
- Filter by:
  - User name / role
  - Action type (login, created, updated, deleted)
  - Module (patients, prescriptions, payments)
  - Date range
- Export as CSV

---

### System Settings
- Hospital name, logo, contact info
- Email configuration (Gmail / Nodemailer credentials)
- WhatsApp configuration (Meta API credentials)
- OTP expiry settings
- Auto-archive duration settings (default 4 months)
- Backup settings

---

### What Super Admin CANNOT Do
- ❌ Cannot register patients directly
- ❌ Cannot do consultations
- ❌ Cannot dispense medicines
- ❌ Cannot manage queue day-to-day

---

### Super Admin Daily Flow
```
Login
  ↓
Dashboard — system overview
  ↓
Check audit logs for anything suspicious
  ↓
Manage users / roles as needed
  ↓
Update CMS content if hospital info changed
  ↓
Check subscriptions — renew if expiring
```

---
---

## 2. ADMIN PANEL

### Dashboard (First screen after login)
- Today's stats:
  - Patients registered today (online + offline)
  - Queue count (waiting, in consultation, completed)
  - Payments pending verification
  - Payments received today (total amount)
- Quick action buttons:
  - Register Patient
  - View Queue
  - Pending Payments

---

### Patient Registration (Offline)
Admin registers walk-in patients:

- Full registration form:
  - Name, DOB, gender, phone, email
  - Address, village, birth place
  - Registration ID (auto-generated)
- After registration → create offline case sheet immediately
- Upload reports (PDF, images, audio, video)
- Mark payment as paid (cash / card / UPI collected at clinic)
- Add to queue (token auto-generated)

---

### Patient Search
Search any patient using up to 10 parameters:

- Registration ID
- First name / last name
- Date of birth
- Mobile number
- Email
- Village / town
- Birth place
- Last consultation date
- Other parameters

Results show:
- Patient name, registration ID, phone, last visit
- Status badge (active / archived)
- Click → full patient profile

---

### Patient Profile (Admin View)
- Full patient details (editable)
- All case sheets
- All consultations history
- All prescriptions
- Billing and payment history
- Uploaded documents
- Reactivate button (if patient is archived)

---

### Case Sheet Management
- View any patient's case sheets
- Edit case sheet details
- Upload additional documents to case sheet
- View female case sheet (extra fields)

---

### Queue Management
Big part of admin's daily work:

- **Full queue view** (all patients, all statuses)
- Each token card shows:
  - Token number
  - Patient name
  - Status (waiting / in consultation / completed / cancelled)
  - Time in queue
- Actions:
  - Call patient (move to in consultation)
  - Mark as completed
  - Cancel token
  - Reorder queue if needed
- Audio + visual notification when token status changes
- Queue history (past tokens by date)

---

### Payment Management (Online Patients)
- **Pending Verification tab:**
  - Patient name, phone, amount
  - Time screenshot was submitted
  - "View Screenshot" button → opens in modal
  - "Mark as Paid" → verifies payment, adds patient to queue
  - "Reject" → notifies patient to re-upload screenshot
- **Payment History tab:**
  - All payments (online + offline)
  - Filter by date, status, payment mode
  - Export as CSV

---

### Documents Management
- View all uploaded documents per patient
- Download any document
- Delete incorrect uploads
- Upload additional documents on patient's behalf

---

### Prescription Management
- View all prescriptions (all patients, all doctors)
- Approve or reject prescriptions
- View prescription PDF
- Track which prescriptions are pending, approved, dispensed

---

### Reports & Analytics
- Daily patient count (online vs offline)
- Revenue report (by date range)
- Doctor-wise consultation count
- Queue efficiency (average wait time)
- Prescription summary
- Export all reports as CSV

---

### CMS (Limited)
- Edit contact info and footer (if super admin allows)
- Add testimonials from satisfied patients

---

### What Admin CANNOT Do
- ❌ Cannot create consultations
- ❌ Cannot write prescriptions
- ❌ Cannot dispense medicines
- ❌ Cannot manage roles and permissions
- ❌ Cannot access system settings
- ❌ Cannot see other hospital's data

---

### Admin Daily Flow
```
Login
  ↓
Dashboard — check today's numbers
  ↓
Register walk-in patients
  → create case sheet
  → mark payment paid
  → add to queue
  ↓
Monitor queue throughout the day
  ↓
Check pending payments
  → review screenshots
  → mark paid
  → add to queue
  ↓
Handle document uploads and patient queries
  ↓
End of day — check reports
```

---
---

## 3. DOCTOR PANEL

### Dashboard (First screen after login)
- Today's date and doctor's name
- Quick stats:
  - Patients waiting in queue today
  - Consultations completed today
  - Prescription requests pending approval
  - Follow-ups due today
- Quick action buttons:
  - View Queue
  - Pending Prescription Requests

---

### Queue (Most Important — Daily Work)
Doctor spends most time here:

- See **only their assigned patients** in queue
- Each queue card shows:
  - Token number
  - Patient name
  - Wait time
  - Case sheet type (online / offline / female)
- **"Call Next Patient"** button → moves patient from waiting → in consultation
- Real-time updates — new patients appear instantly without refreshing

---

### Consultation Page (Opens when doctor calls a patient)
Main working screen — everything in one place:

**Left side — Patient Info:**
- Patient name, age, gender, phone
- Registration ID
- Case sheet details (chief complaint, symptoms, history, vitals)
- Uploaded reports (PDF viewer, image viewer, audio/video player)
- Previous consultation history (past visits)
- Previous prescriptions

**Right side — Doctor's Work:**
- Consultation notes (what doctor observes)
- Diagnosis field
- Follow-up date (optional)
- **"Create Prescription"** button
- **"Complete Consultation"** button (marks consultation as done)

---

### Prescription Creation
After consultation doctor creates prescription:

- Add multiple medicines:
  - Medicine name (with autocomplete)
  - Dosage (e.g. 500mg)
  - Frequency (once / twice / thrice daily, SOS)
  - Duration (3 days, 1 week, 1 month)
  - Instructions (before food, after food, with water)
- General notes / advice
- Preview prescription before saving
- Save → prescription goes to:
  - **Pharmacist** (offline patients only)
  - **Stays pending** for patient to request copy (online patients — no pharmacist)

---

### Prescription Requests (Approval Queue)
Patients request a copy of their prescription — doctor must approve:

- List of all pending requests
- Each request shows:
  - Patient name
  - Which prescription they want
  - Date of original consultation
- **Approve** → patient can download PDF
- **Reject** → patient gets notified with reason
- Doctor can add a note when rejecting

---

### Patient Search & History
Doctor can search **only their assigned patients**:

- Search by name, registration ID, phone
- Click patient → see full history:
  - All past consultations
  - All prescriptions
  - All uploaded reports
  - Prognosis logs

---

### Prognosis / Follow-up
After consultation doctor logs follow-up details:

- Recovery status (improving / stable / deteriorating / recovered)
- Patient mood / well-being score (1–10)
- Progress notes
- Next follow-up date
- Doctor review notes
- Tracks patient progress over multiple visits

---

### What Doctor CANNOT Do
- ❌ Cannot see patients not assigned to them
- ❌ Cannot register new patients
- ❌ Cannot mark payments
- ❌ Cannot manage queue (add / remove tokens)
- ❌ Cannot access pharmacist functions
- ❌ Cannot edit CMS or system settings
- ❌ Cannot see other doctors' patients or prescriptions

---

### Doctor Daily Flow
```
Login
  ↓
Dashboard — see today's stats + pending requests
  ↓
Queue — call next patient
  ↓
Consultation page
  → read case sheet + reports
  → write notes + diagnosis
  → create prescription
  → complete consultation
  ↓
Repeat for all patients in queue
  ↓
(In between) Approve / reject prescription requests
  ↓
(Optional) Add prognosis / follow-up notes
```

---
---

## 4. PHARMACIST PANEL

### Dashboard (First screen after login)
- Today's approved prescriptions count
- How many dispensed so far today
- How many still pending dispense

---

### Today's Prescriptions (Main Screen)
Only screen pharmacist uses daily:

- Shows **only today's approved prescriptions**
- **Offline patients only** — online patients do not go through pharmacist
- Each prescription card shows:
  - Patient name
  - Token number
  - Doctor name
  - List of medicines with:
    - Medicine name
    - Dosage
    - Frequency
    - Duration
    - Instructions (before/after food etc.)
  - Status: pending dispense / dispensed
- **"Mark as Dispensed"** button with confirmation dialog
- Once dispensed → card grays out / moves to dispensed section

---

### Dispensed History
- Past dispensed prescriptions (by date)
- Filter by date
- Search by patient name

---

### What Pharmacist CANNOT Do
- ❌ Cannot see online patients' prescriptions (online = no pharmacist)
- ❌ Cannot see case sheets
- ❌ Cannot see patient profiles or full history
- ❌ Cannot see prescriptions older than today
- ❌ Cannot create or edit prescriptions
- ❌ Cannot approve prescription copy requests
- ❌ Cannot access queue management
- ❌ Cannot access payments
- ❌ Cannot access any other module

---

### Pharmacist Daily Flow
```
Login
  ↓
Dashboard — see today's pending count
  ↓
Today's prescriptions list
  ↓
Patient comes to counter
  → find their prescription by name / token
  → verify medicines
  → dispense medicines
  → Mark as Dispensed
  ↓
Repeat for all patients throughout the day
  ↓
End of day — check dispensed history count
```

---
---

## 5. PATIENT PORTAL

### Dashboard (First screen after login)
- Welcome message with patient name
- Quick stats:
  - Current queue position (if in queue today)
  - Last visit date
  - Pending prescription requests
- Quick action buttons:
  - Book Appointment (→ create case sheet)
  - View Prescriptions
  - Upload Reports

---

### Registration & Login
- Self-register (online patients only):
  - Name, email, phone, password
  - OTP verification on phone / email
- Login with email + password
- Forgot password flow

---

### Case Sheet Creation (Online)
Multi-step form:

- **Step 1** — Chief complaint (why coming to doctor)
- **Step 2** — Medical history (current medicines, allergies, past surgeries)
- **Step 3** — Upload reports (drag & drop — PDF, images, audio, video)
- **Step 4** — Review & submit
- After submit:
  - WhatsApp sent automatically with UPI QR / payment link
  - Screen shows "Payment link sent to your WhatsApp"

---

### Payment
- View payment amount and UPI details for reference
- Upload payment screenshot after paying via UPI
- Status tracker:
  - Screenshot uploaded → Pending admin verification
  - Admin verifies → Payment confirmed
  - Added to queue → Token number shown

---

### Queue Status
- Current token number
- How many patients are ahead
- Real-time updates (no page refresh needed)
- Estimated wait time
- Notification when their turn is called

---

### Prescriptions
- List of all their prescriptions
- Status badge: pending / approved
- **"Request Copy"** button:
  - Sends request to doctor
  - Doctor approves → can download PDF
  - Doctor rejects → shows rejection reason
- Download PDF button (only after doctor approval)
- Cannot see full prescription details until doctor approves request

---

### Reports / Documents
- View all uploaded reports
- Upload new reports anytime
- Download any report
- Preview PDFs and images directly in browser

---

### Profile
- View personal details
- Edit phone, address, village
- Change password
- View registration ID

---

### Prognosis / Follow-up View
- See their own follow-up dates set by doctor
- Recovery notes left by doctor
- Next appointment reminder

---

### What Patient CANNOT Do
- ❌ Cannot see other patients' data
- ❌ Cannot create offline case sheets
- ❌ Cannot approve their own prescription requests
- ❌ Cannot access queue management
- ❌ Cannot access payment admin functions
- ❌ Cannot see doctor's full consultation notes
- ❌ Cannot register without OTP verification

---

### Patient Daily Flow
```
Register / Login
  ↓
Create online case sheet
  → fill chief complaint + history
  → upload reports
  → submit
  ↓
Receive WhatsApp with UPI payment link
  ↓
Pay via GPay / PhonePe / any UPI
  ↓
Upload payment screenshot in app
  ↓
Wait for admin to verify
  ↓
Receive queue token
  ↓
Monitor queue position in real-time
  ↓
After consultation
  → request prescription copy
  → wait for doctor approval
  → download PDF
```

---
---

## 6. ALL PANELS — Comparison Table

| Feature | Super Admin | Admin | Doctor | Pharmacist | Patient |
|---------|:-----------:|:-----:|:------:|:----------:|:-------:|
| Register patient | ✅ | ✅ | ❌ | ❌ | ✅ self only |
| Create offline case sheet | ✅ | ✅ | ❌ | ❌ | ❌ |
| Create online case sheet | ❌ | ❌ | ❌ | ❌ | ✅ |
| Search all patients | ✅ | ✅ | ✅ own only | ❌ | ❌ |
| View patient profile | ✅ | ✅ | ✅ own only | ❌ | ✅ own only |
| Upload reports | ✅ | ✅ | ❌ | ❌ | ✅ |
| Manage queue | ✅ | ✅ | 👁 view only | ❌ | 👁 own token |
| Mark payment paid | ✅ | ✅ | ❌ | ❌ | ❌ |
| Upload payment screenshot | ❌ | ❌ | ❌ | ❌ | ✅ |
| Review payment screenshot | ✅ | ✅ | ❌ | ❌ | ❌ |
| Do consultation | ❌ | ❌ | ✅ | ❌ | ❌ |
| Create prescription | ❌ | ❌ | ✅ | ❌ | ❌ |
| Approve prescription request | ❌ | ❌ | ✅ | ❌ | ❌ |
| Request prescription copy | ❌ | ❌ | ❌ | ❌ | ✅ |
| Download prescription PDF | ❌ | ✅ | ✅ | ❌ | ✅ after approval |
| Dispense medicine | ❌ | ❌ | ❌ | ✅ offline only | ❌ |
| View prescriptions | ✅ all | ✅ all | ✅ own patients | ✅ today only | ✅ own approved |
| Prognosis / follow-up | ❌ | 👁 view only | ✅ create + edit | ❌ | 👁 view own |
| Reactivate archived patient | ✅ | ✅ | ✅ | ❌ | ❌ |
| Manage CMS | ✅ full | ✅ limited | ❌ | ❌ | ❌ |
| View audit logs | ✅ | ✅ | ❌ | ❌ | ❌ |
| Manage roles & permissions | ✅ | ❌ | ❌ | ❌ | ❌ |
| Manage subscriptions | ✅ | ❌ | ❌ | ❌ | ❌ |
| System settings | ✅ | ❌ | ❌ | ❌ | ❌ |
| View reports & analytics | ✅ | ✅ | ❌ | ❌ | ❌ |
| Manage users | ✅ | ✅ limited | ❌ | ❌ | ❌ |