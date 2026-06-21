# HMS — Coding Rules & Conventions

> These rules apply to every file written in this project. Follow them without exception.

---

## General

- Use **TypeScript** everywhere — no plain `.js` files except config files
- No `any` type — use `unknown` and narrow it, or define a proper interface
- No commented-out code in commits — delete it or use a `// TODO:` with a ticket ref
- Every function must have a return type annotation
- All magic numbers and strings must be constants — no inline `"pending"`, `"approved"` strings
- Use `const` by default, `let` only when reassignment is needed, never `var`
- All async functions must have try/catch or be wrapped in a global error handler
- Never use `console.log` in production code — use the logger utility

---

## Naming Conventions

| Type | Convention | Example |
|------|-----------|---------|
| Variables | camelCase | `patientId`, `caseSheetData` |
| Functions | camelCase | `getPatientById`, `markAsPaid` |
| React components | PascalCase | `PatientForm`, `QueueTable` |
| Types / Interfaces | PascalCase | `PatientProfile`, `CaseSheetPayload` |
| Enums | PascalCase, values SCREAMING_SNAKE | `PaymentStatus.MARK_PAID` |
| Constants | SCREAMING_SNAKE_CASE | `MAX_FILE_SIZE_MB`, `OTP_EXPIRY_MINUTES` |
| DB table names | snake_case | `patient_profiles`, `audit_logs` |
| API routes | kebab-case | `/api/case-sheets`, `/api/queue-tokens` |
| Files (frontend) | kebab-case | `patient-form.tsx`, `use-queue.ts` |
| Files (backend) | kebab-case | `patient.service.ts`, `auth.middleware.ts` |

---

## Folder Structure

### Backend (`/backend`)
```
src/
  config/          # env, db, supabase client
  middlewares/     # auth, rbac, validate, error-handler
  modules/
    auth/
      auth.routes.ts
      auth.controller.ts
      auth.service.ts
      auth.schema.ts   # Zod schemas
    patients/
    case-sheets/
    consultations/
    prescriptions/
    queue/
    payments/
    pharmacist/
    prognosis/
    audit/
    cms/
    notifications/
  utils/           # logger, response-formatter, file-upload
  types/           # shared TypeScript interfaces
  index.ts
```

### Frontend (`/frontend`)
```
app/
  (auth)/
    login/
    register/
    otp/
  (admin)/
    dashboard/
    patients/
    queue/
    payments/
    reports/
  (doctor)/
    dashboard/
    queue/
    consultation/
    prescriptions/
  (pharmacist)/
    dashboard/
  (patient)/
    dashboard/
    case-sheet/
    prescriptions/
  (super-admin)/
    dashboard/
    users/
    cms/
components/
  ui/              # ShadCN components (do not edit)
  shared/          # reusable app components
  forms/           # form components per module
hooks/             # custom React hooks
lib/               # supabase client, api client, utils
types/             # shared TypeScript interfaces
constants/         # app-wide constants
```

---

## Backend Rules

### Controllers
- Controllers only handle request parsing and response sending
- No business logic in controllers — delegate everything to services
- Always validate request body with Zod before touching it
- Return consistent response shape via `sendSuccess()` / `sendError()` utils

```typescript
// Good
export const createPatient = async (req: Request, res: Response) => {
  const body = createPatientSchema.parse(req.body);
  const patient = await patientService.create(body, req.user.id);
  return sendSuccess(res, patient, 201);
};

// Bad — business logic in controller
export const createPatient = async (req: Request, res: Response) => {
  const existing = await db.query('SELECT * FROM patients WHERE email = $1', [req.body.email]);
  if (existing.rows.length) return res.status(400).json({ error: 'exists' });
  // ...
};
```

### Services
- All DB queries live in services
- Services return typed data — never raw DB rows to controllers
- One service file per module
- No direct Supabase calls outside of services (exception: middleware)

### Middleware Order (apply in this order)
1. `helmet()` — security headers
2. `cors()` — CORS config
3. `express.json()` — body parser
4. `morgan()` — request logging
5. `rateLimiter` — per-IP rate limit
6. Route-level: `authenticate` → `authorize(role)` → `validate(schema)`

### Response Format
```typescript
// All responses must follow this shape
// Success
{ success: true, data: T, message?: string }

// Error
{ success: false, error: string, details?: ZodError[] }
```

### Error Handling
- Never throw raw errors to the client
- Use a custom `AppError` class with `statusCode` and `message`
- Global error handler catches everything — never send `res.status(500)` manually in routes

```typescript
class AppError extends Error {
  constructor(public message: string, public statusCode: number = 400) {
    super(message);
  }
}

// Usage in service
throw new AppError('Patient not found', 404);
```

---

## Frontend Rules

### Components
- One component per file
- No component longer than 200 lines — split it up
- No inline styles — Tailwind classes only
- No hardcoded colors — use Tailwind tokens or CSS variables
- Never use `useEffect` for data fetching — use React Query (`useQuery`, `useMutation`)

### Data Fetching
- All API calls go through `/lib/api-client.ts` — never raw `fetch` in components
- Use React Query for all server state
- Use Zustand or React context for client-only UI state
- Cache keys follow pattern: `['module', 'action', id]`

```typescript
// Good
const { data: patient } = useQuery({
  queryKey: ['patients', patientId],
  queryFn: () => api.patients.getById(patientId),
});

// Bad
useEffect(() => {
  fetch(`/api/patients/${patientId}`).then(r => r.json()).then(setPatient);
}, [patientId]);
```

### Forms
- Use `react-hook-form` + Zod for all forms
- Share Zod schemas between frontend and backend (`/shared/schemas`)
- Always show field-level validation errors
- Disable submit button while submitting (`isSubmitting`)
- Show toast on success AND error

### Auth & RBAC (Frontend)
- Never trust role from localStorage — always derive from JWT / Supabase session
- Wrap every protected page in the role-check HOC
- Hide UI elements based on role using `useRole()` hook — never just CSS `hidden`
- If role check fails → redirect to `/unauthorized`, not 404

```typescript
// Good
const { hasPermission } = useRole();
if (!hasPermission('approve_prescription')) return null;

// Bad
{user.role === 'admin' && <ApproveButton />}
```

---

## Database Rules

### Supabase / PostgreSQL
- Every table must have: `id` (uuid, default gen_random_uuid()), `created_at`, `updated_at`
- Always use RLS policies — never disable RLS in production
- Foreign keys must have `ON DELETE` behavior defined explicitly
- Never do N+1 queries — use JOINs or Supabase `.select()` with relations
- Use transactions for any multi-table write operations
- Index columns used in WHERE clauses frequently (patient_id, doctor_id, status, created_at)

### Migrations
- All schema changes go through migration files — never edit DB directly in production
- Migration files named: `YYYYMMDD_description.sql`
- Always write a rollback migration alongside each forward migration

---

## Git Rules

### Branch Naming
```
main          → production
dev           → staging
feature/      → feature/queue-realtime
fix/          → fix/prescription-approval-bug
hotfix/       → hotfix/payment-webhook-failure
```

### Commit Messages (Conventional Commits)
```
feat: add queue token generation on payment
fix: prescription request not sending notification
chore: update Razorpay SDK to v2
refactor: split patient service into smaller functions
test: add unit tests for billing service
docs: update API endpoints in README
```

### PR Rules
- Every PR needs at least one reviewer
- PR title must match conventional commit format
- No PR merges with failing tests
- Link PR to the relevant task / phase in `HMS-PROJECT-PLAN.md`

---

## Environment Variables

Never hardcode secrets. All secrets in `.env` (never commit `.env`).

```bash
# Backend
DATABASE_URL=
SUPABASE_URL=
SUPABASE_SERVICE_ROLE_KEY=
JWT_SECRET=
RAZORPAY_KEY_ID=
RAZORPAY_KEY_SECRET=
SENDGRID_API_KEY=
TWILIO_ACCOUNT_SID=
TWILIO_AUTH_TOKEN=
TWILIO_WHATSAPP_NUMBER=
APP_URL=

# Frontend
NEXT_PUBLIC_SUPABASE_URL=
NEXT_PUBLIC_SUPABASE_ANON_KEY=
NEXT_PUBLIC_API_URL=
NEXT_PUBLIC_RAZORPAY_KEY_ID=
```

---

## Code Review Checklist

Before approving any PR, verify:

- [ ] No `any` TypeScript types
- [ ] All API routes have auth + RBAC middleware
- [ ] Zod validation on every request body
- [ ] No raw SQL string concatenation (SQL injection risk)
- [ ] No secrets or API keys in code
- [ ] Audit log entry added for any write operation
- [ ] Error states handled in UI (loading, empty, error)
- [ ] Mobile responsive (check at 375px width)
- [ ] No `console.log` left in code
