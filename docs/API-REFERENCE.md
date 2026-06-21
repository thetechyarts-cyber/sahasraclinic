# HMS — API Reference

> Base URL: `https://api.yourdomain.com/api`
> All requests require `Authorization: Bearer <JWT>` except `/auth/*`

---

## Auth

| Method | Endpoint | Role | Description |
|--------|----------|------|-------------|
| POST | `/auth/register` | Public | Patient self-register |
| POST | `/auth/login` | Public | Login → returns JWT |
| POST | `/auth/otp/send` | Public | Send OTP to phone/email |
| POST | `/auth/otp/verify` | Public | Verify OTP |
| POST | `/auth/refresh` | Auth | Refresh JWT token |
| POST | `/auth/logout` | Auth | Logout, revoke session |

---

## Users & Roles

| Method | Endpoint | Role | Description |
|--------|----------|------|-------------|
| GET | `/users` | Super Admin | List all users |
| POST | `/users` | Super Admin | Create user |
| PUT | `/users/:id` | Super Admin | Update user |
| DELETE | `/users/:id` | Super Admin | Deactivate user |
| POST | `/users/:id/assign-role` | Super Admin | Assign role |
| GET | `/roles` | Super Admin | List roles |
| POST | `/roles` | Super Admin | Create role |
| PUT | `/roles/:id` | Super Admin | Update role permissions |

---

## Patients

| Method | Endpoint | Role | Description |
|--------|----------|------|-------------|
| POST | `/patients` | Admin | Register new patient |
| GET | `/patients` | Admin, Doctor | Search patients (10 params) |
| GET | `/patients/:id` | Admin, Doctor | Get patient profile |
| PUT | `/patients/:id` | Admin | Update patient |
| PUT | `/patients/:id/reactivate` | Admin, Doctor | Reactivate archived patient |

**Search query params:** `registrationId`, `firstName`, `lastName`, `dob`, `mobile`, `email`, `village`, `birthPlace`, `lastConsultDate`, `other`

---

## Case Sheets

| Method | Endpoint | Role | Description |
|--------|----------|------|-------------|
| POST | `/case-sheets` | Admin, Patient | Create case sheet |
| GET | `/case-sheets/:id` | Admin, Doctor | Get case sheet |
| PUT | `/case-sheets/:id` | Admin | Update case sheet |
| POST | `/case-sheets/:id/documents` | Admin, Patient | Upload reports |
| GET | `/case-sheets/patient/:id` | Admin, Doctor | All case sheets for patient |

**Case sheet types:** `online`, `offline`, `female`

---

## Payments

| Method | Endpoint | Role | Description |
|--------|----------|------|-------------|
| POST | `/payments/:id/mark-paid` | Admin | Manually mark as paid |
| GET | `/payments/patient/:id` | Admin | Patient payment history |

---

## Queue

| Method | Endpoint | Role | Description |
|--------|----------|------|-------------|
| POST | `/queue/token` | Admin | Generate token (after payment) |
| GET | `/queue` | Admin, Doctor | Get current queue |
| PUT | `/queue/:id/status` | Admin, Doctor | Update token status |
| GET | `/queue/history` | Admin | Past queue records |

**Token statuses:** `waiting` → `in_consultation` → `completed` / `cancelled`

---

## Consultations

| Method | Endpoint | Role | Description |
|--------|----------|------|-------------|
| POST | `/consultations` | Doctor | Start consultation |
| GET | `/consultations/:id` | Doctor, Admin | Get consultation |
| PUT | `/consultations/:id` | Doctor | Update notes/diagnosis |
| GET | `/consultations/patient/:id` | Doctor, Admin | Consultation history |

---

## Prescriptions

| Method | Endpoint | Role | Description |
|--------|----------|------|-------------|
| POST | `/prescriptions` | Doctor | Create prescription |
| GET | `/prescriptions/:id` | Doctor, Admin, Pharmacist* | Get prescription |
| PUT | `/prescriptions/:id/approve` | Admin, Doctor | Approve prescription |
| GET | `/prescriptions/patient/:id` | Doctor, Admin | Patient's prescriptions |
| GET | `/prescriptions/:id/pdf` | Doctor, Admin, Patient** | Download PDF |

*Pharmacist: only today's approved
**Patient: only after doctor approval of request

---

## Prescription Requests

| Method | Endpoint | Role | Description |
|--------|----------|------|-------------|
| POST | `/prescription-requests` | Patient | Request prescription copy |
| GET | `/prescription-requests` | Doctor | Pending requests |
| PUT | `/prescription-requests/:id/approve` | Doctor | Approve request |
| PUT | `/prescription-requests/:id/reject` | Doctor | Reject request |

---

## Pharmacist

| Method | Endpoint | Role | Description |
|--------|----------|------|-------------|
| GET | `/pharmacist/prescriptions` | Pharmacist | Today's approved prescriptions |
| PUT | `/pharmacist/prescriptions/:id/dispense` | Pharmacist | Mark as dispensed |
| GET | `/pharmacist/prescriptions/history` | Pharmacist | Past dispensed records |

---

## Prognosis

| Method | Endpoint | Role | Description |
|--------|----------|------|-------------|
| POST | `/prognosis` | Doctor | Create prognosis entry |
| GET | `/prognosis/patient/:id` | Doctor, Admin | Full prognosis history |
| PUT | `/prognosis/:id` | Doctor | Update follow-up notes |

---

## Audit Logs

| Method | Endpoint | Role | Description |
|--------|----------|------|-------------|
| GET | `/audit-logs` | Super Admin, Admin | List audit logs (paginated) |
| GET | `/audit-logs/export` | Super Admin | Export as CSV |

**Filter params:** `userId`, `action`, `module`, `from`, `to`

---

## CMS

| Method | Endpoint | Role | Description |
|--------|----------|------|-------------|
| GET | `/cms/:type` | Public | Get content by type |
| POST | `/cms/:type` | Super Admin | Create content |
| PUT | `/cms/:id` | Super Admin | Update content |
| DELETE | `/cms/:id` | Super Admin | Delete content |

**Types:** `treatments`, `departments`, `doctors`, `testimonials`, `faq`, `contact`, `policies`, `hospital-info`

---

## Notifications

| Method | Endpoint | Role | Description |
|--------|----------|------|-------------|
| GET | `/notifications` | Auth | Get user's notifications |
| PUT | `/notifications/:id/read` | Auth | Mark as read |
| PUT | `/notifications/read-all` | Auth | Mark all as read |

---

## Reports

| Method | Endpoint | Role | Description |
|--------|----------|------|-------------|
| GET | `/reports/patients` | Admin, Super Admin | Daily patient count |
| GET | `/reports/revenue` | Admin, Super Admin | Revenue by date range |
| GET | `/reports/consultations` | Admin, Super Admin | Doctor-wise count |
| GET | `/reports/prescriptions` | Admin, Super Admin | Prescriptions summary |
| GET | `/reports/queue` | Admin, Super Admin | Queue efficiency stats |

---

## Health

| Method | Endpoint | Role | Description |
|--------|----------|------|-------------|
| GET | `/health` | Public | Server + DB health check |

---

## Standard Response Shapes

### Success
```json
{
  "success": true,
  "data": { },
  "message": "Optional message"
}
```

### Error
```json
{
  "success": false,
  "error": "Human readable error",
  "details": [ ]
}
```

### Paginated list
```json
{
  "success": true,
  "data": {
    "items": [ ],
    "total": 100,
    "page": 1,
    "limit": 20,
    "hasMore": true
  }
}
```

---

## HTTP Status Codes Used

| Code | Meaning |
|------|---------|
| 200 | Success (GET, PUT) |
| 201 | Created (POST) |
| 400 | Validation error / bad request |
| 401 | Unauthenticated — no/invalid JWT |
| 403 | Unauthorized — wrong role/permission |
| 404 | Resource not found |
| 409 | Conflict — duplicate record |
| 429 | Rate limit exceeded |
| 500 | Internal server error |
| 503 | Service unavailable |
