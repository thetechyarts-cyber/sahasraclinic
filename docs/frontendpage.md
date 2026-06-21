# HMS — Frontend Pages & UI Structure

> Complete page map for the HMS Next.js app.
> Single Next.js app — public website and all dashboards in one codebase.

---

## App Structure Overview

```
/ (public landing page)
/about
/doctors
/treatments
/contact
/login
/register
/verify-otp

/admin/*          → Admin dashboard
/doctor/*         → Doctor dashboard
/pharmacist/*     → Pharmacist dashboard
/patient/*        → Patient portal
/super-admin/*    → Super Admin dashboard
```

---

## Public Pages (No Login Required)

### `/` — Landing Page

Single scrollable page with 5 sections. All content editable via CMS.

```
┌─────────────────────────────────────┐
│  NAVBAR                             │
│  Logo | Home About Doctors Contact  │
│                    [Login] [Book]   │
├─────────────────────────────────────┤
│  HERO SECTION                       │
│  Hospital name + tagline            │
│  "Book an Appointment" CTA button   │
│  → goes to /register                │
│  Background: hospital image/banner  │
├─────────────────────────────────────┤
│  ABOUT SECTION                      │
│  Hospital description               │
│  Key highlights (years, doctors,    │
│  patients served, specialities)     │
├─────────────────────────────────────┤
│  TESTIMONIALS SECTION               │
│  Patient review cards (carousel)    │
│  Name, review text, star rating     │
│  Content from CMS                   │
├─────────────────────────────────────┤
│  CONTACT SECTION                    │
│  Address, phone, email, map embed   │
│  Simple contact form                │
│  (Name, Phone, Message → email)     │
├─────────────────────────────────────┤
│  FOOTER                             │
│  Logo, quick links, social media    │
│  Copyright, privacy policy link     │
└─────────────────────────────────────┘
```

**Data sources:**
- Hero content → CMS `website_content` table (type: `hero`)
- About content → CMS (type: `about`)
- Testimonials → CMS (type: `testimonial`)
- Contact info → CMS (type: `contact`)
- Footer links → CMS (type: `footer`)

---

### `/login` — Login Page

```
┌─────────────────────────┐
│  Hospital Logo          │
│                         │
│  Welcome back           │
│  ─────────────────────  │
│  Email         [_____]  │
│  Password      [_____]  │
│                         │
│  [Forgot password?]     │
│                         │
│  [    Login    ]        │
│                         │
│  Don't have account?    │
│  [Register here]        │
└─────────────────────────┘
```

- On success → redirect based on role:
  - `super_admin` → `/super-admin/dashboard`
  - `admin` → `/admin/dashboard`
  - `doctor` → `/doctor/dashboard`
  - `pharmacist` → `/pharmacist/dashboard`
  - `patient` → `/patient/dashboard`
- On fail → show inline error under fields

---

### `/register` — Patient Self-Registration

```
┌─────────────────────────────┐
│  Create your account        │
│  ─────────────────────────  │
│  Full Name        [______]  │
│  Email            [______]  │
│  Phone Number     [______]  │
│  Password         [______]  │
│  Confirm Password [______]  │
│                             │
│  [ Create Account ]         │
│                             │
│  Already registered?        │
│  [ Login here ]             │
└─────────────────────────────┘
```

- On submit → OTP sent to phone/email → redirect to `/verify-otp`

---

### `/verify-otp` — OTP Verification

```
┌─────────────────────────────┐
│  Verify your number         │
│                             │
│  OTP sent to +91 XXXXXX     │
│                             │
│  [ _ ] [ _ ] [ _ ] [ _ ]   │
│       [ _ ] [ _ ]           │
│                             │
│  [ Verify ]                 │
│                             │
│  Didn't receive? [Resend]   │
│  (Resend enabled after 30s) │
└─────────────────────────────┘
```

- 6-digit OTP, single-input or split boxes
- Resend cooldown: 30 seconds
- OTP expiry: 5 minutes
- On verify → redirect to `/patient/dashboard`

---

### `/forgot-password` — Forgot Password

```
┌─────────────────────────────┐
│  Reset your password        │
│                             │
│  Enter your email or phone  │
│  [______________________]   │
│                             │
│  [ Send Reset Link ]        │
│                             │
│  [ Back to login ]          │
└─────────────────────────────┘
```

---

## Patient Portal (`/patient/*`)

### `/patient/dashboard`
- Welcome message with patient name
- Quick stats: upcoming appointment, last visit date
- Quick actions: Book Appointment, View Prescriptions, Upload Reports

### `/patient/case-sheet/new`
- Multi-step form:
  - Step 1: Chief complaint + symptoms
  - Step 2: Medical history
  - Step 3: Upload reports (drag & drop)
  - Step 4: Review & submit
- On submit → WhatsApp payment link sent → show confirmation screen

### `/patient/case-sheet/:id`
- View submitted case sheet (read-only)

### `/patient/payment`
- Order summary (consultation fee)
- Razorpay checkout button
- After payment → show "Payment successful, you've been added to the queue"

### `/patient/queue`
- Current token number
- Tokens ahead in queue
- Real-time update (Supabase Realtime)
- Estimated wait time

### `/patient/prescriptions`
- List of all prescriptions
- Status badge: pending / approved
- "Request Copy" button on each
- Download PDF (only after doctor approval)

### `/patient/reports`
- List of uploaded reports
- Preview + download

### `/patient/profile`
- View and edit personal details
- Change password

---

## Admin Dashboard (`/admin/*`)

### `/admin/dashboard`
- Today's stats: patients registered, queue count, payments received
- Quick actions: Register Patient, View Queue, Mark Payment

### `/admin/patients`
- Patient search (10 parameters)
- Patient list table with status badges
- Register new patient button

### `/admin/patients/new`
- Offline patient registration form
- Create offline case sheet option

### `/admin/patients/:id`
- Full patient profile
- Case sheets, consultations, billing history
- Reactivate button (if archived)

### `/admin/queue`
- Live queue view (all tokens)
- Token status management
- Audio/visual notification when token called

### `/admin/payments`
- Pending payments list
- "Mark as Paid" button per patient
- Payment history with filters

### `/admin/case-sheets/:id`
- View + edit case sheet
- Upload additional documents

### `/admin/reports`
- Revenue report (date range filter)
- Patient count (online vs offline)
- Export CSV button

---

## Doctor Dashboard (`/doctor/*`)

### `/doctor/dashboard`
- Today's queue (assigned patients)
- Pending prescription requests count
- Quick action: View Queue

### `/doctor/queue`
- Real-time queue for this doctor
- "Call Next Patient" button
- Patient token cards with name + token number

### `/doctor/consultation/:queueTokenId`
- Patient info panel (left side)
- Case sheet viewer (scrollable)
- Uploaded reports viewer
- Consultation notes + diagnosis form (right side)
- "Create Prescription" button

### `/doctor/prescription/new`
- Medicine name (autocomplete)
- Dosage, frequency, duration, instructions
- Add multiple medicines
- Notes field
- Preview + Save

### `/doctor/prescriptions`
- All prescriptions for assigned patients
- Filter by status
- View/edit/approve

### `/doctor/prescription-requests`
- Pending requests from patients
- Patient name, prescription summary
- Approve / Reject buttons

### `/doctor/patients`
- Assigned patients list
- Search by name, registration ID
- Click → patient profile

### `/doctor/patients/:id`
- Full patient profile (read-only)
- Consultation history
- Prognosis logs
- Add prognosis / follow-up

---

## Pharmacist Dashboard (`/pharmacist/*`)

### `/pharmacist/dashboard`
- Today's approved prescriptions only
- Count of dispensed vs pending

### `/pharmacist/prescriptions`
- List: patient name, medicines, doctor name
- "Mark as Dispensed" button
- Dispensed ones grayed out
- NO access to case sheets, patient profiles, or history

---

## Super Admin Dashboard (`/super-admin/*`)

### `/super-admin/dashboard`
- System-wide stats
- Active users per role
- Recent audit log entries

### `/super-admin/users`
- All users list
- Create user (any role)
- Assign/change role
- Deactivate/activate user

### `/super-admin/roles`
- Roles list
- Create role, assign permissions

### `/super-admin/cms`
- Content editor for all website sections:
  - Hero text + image
  - About section
  - Testimonials (add/edit/delete)
  - Contact info
  - Footer links
- Publish / Draft toggle per item

### `/super-admin/audit-logs`
- Full audit log table
- Filter by user, action, module, date
- Export CSV

### `/super-admin/settings`
- Hospital name, logo, contact
- Subscription / plan settings
- System configuration

---

## Next.js Route Structure

```
app/
  (public)/
    page.tsx                  → / (landing page)
    login/page.tsx
    register/page.tsx
    verify-otp/page.tsx
    forgot-password/page.tsx
    layout.tsx                → public navbar + footer

  (admin)/
    layout.tsx                → admin sidebar + header
    dashboard/page.tsx
    patients/
      page.tsx
      new/page.tsx
      [id]/page.tsx
    queue/page.tsx
    payments/page.tsx
    case-sheets/[id]/page.tsx
    reports/page.tsx

  (doctor)/
    layout.tsx
    dashboard/page.tsx
    queue/page.tsx
    consultation/[tokenId]/page.tsx
    prescription/
      new/page.tsx
      [id]/page.tsx
    prescriptions/page.tsx
    prescription-requests/page.tsx
    patients/
      page.tsx
      [id]/page.tsx

  (pharmacist)/
    layout.tsx
    dashboard/page.tsx
    prescriptions/page.tsx

  (patient)/
    layout.tsx
    dashboard/page.tsx
    case-sheet/
      new/page.tsx
      [id]/page.tsx
    payment/page.tsx
    queue/page.tsx
    prescriptions/page.tsx
    reports/page.tsx
    profile/page.tsx

  (super-admin)/
    layout.tsx
    dashboard/page.tsx
    users/page.tsx
    roles/page.tsx
    cms/page.tsx
    audit-logs/page.tsx
    settings/page.tsx
```

---

## Shared Components Needed

```
components/
  shared/
    navbar-public.tsx         → public site navbar
    footer-public.tsx         → public site footer
    sidebar-admin.tsx         → admin/doctor/pharmacist sidebar
    role-guard.tsx            → redirect if wrong role
    page-loader.tsx           → full page loading state
    data-table.tsx            → reusable sortable/filterable table
    file-uploader.tsx         → drag & drop multi-file upload
    queue-card.tsx            → token display card
    prescription-card.tsx     → prescription summary card
    patient-card.tsx          → patient info summary
    stat-card.tsx             → dashboard stat boxes
    pdf-viewer.tsx            → inline PDF preview
    otp-input.tsx             → 6-box OTP input component
  forms/
    patient-registration-form.tsx
    case-sheet-form.tsx
    female-case-sheet-form.tsx
    consultation-form.tsx
    prescription-form.tsx
    contact-form.tsx
    login-form.tsx
    register-form.tsx
```

---

## CMS → Public Page Mapping

| CMS Content Type | Appears On |
|-----------------|------------|
| `hero` | Landing page — hero section |
| `about` | Landing page — about section |
| `testimonial` | Landing page — testimonials carousel |
| `contact` | Landing page — contact section + footer |
| `footer` | Footer — links and info |
| `treatments` | Future: /treatments page |
| `doctors` | Future: /doctors page |
| `faq` | Future: /faq page |
| `policies` | Footer links → /privacy, /terms |