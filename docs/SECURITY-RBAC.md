# HMS — Security & RBAC Reference

> Security rules, role permissions matrix, and implementation checklist.

---

## Role Permissions Matrix

| Permission | Super Admin | Admin | Doctor | Pharmacist | Patient |
|-----------|:-----------:|:-----:|:------:|:----------:|:-------:|
| Create organization / hospital | ✅ | ❌ | ❌ | ❌ | ❌ |
| Create / manage roles | ✅ | ❌ | ❌ | ❌ | ❌ |
| Create / manage users | ✅ | ✅ | ❌ | ❌ | ❌ |
| View all audit logs | ✅ | ✅ | ❌ | ❌ | ❌ |
| Manage subscriptions | ✅ | ❌ | ❌ | ❌ | ❌ |
| System settings | ✅ | ❌ | ❌ | ❌ | ❌ |
| Register patient (offline) | ✅ | ✅ | ❌ | ❌ | ❌ |
| Register patient (online) | ❌ | ❌ | ❌ | ❌ | ✅ |
| Create offline case sheet | ✅ | ✅ | ❌ | ❌ | ❌ |
| Create online case sheet | ❌ | ❌ | ❌ | ❌ | ✅ |
| View all patients | ✅ | ✅ | ✅ | ❌ | ❌ |
| Search patients | ✅ | ✅ | ✅ | ❌ | ❌ |
| Mark payment as paid | ✅ | ✅ | ❌ | ❌ | ❌ |
| Manage queue | ✅ | ✅ | ❌ | ❌ | ❌ |
| View queue | ✅ | ✅ | ✅ | ❌ | ❌ |
| View own queue token | ❌ | ❌ | ❌ | ❌ | ✅ |
| Create consultation | ❌ | ❌ | ✅ | ❌ | ❌ |
| View consultation | ✅ | ✅ | ✅ (own) | ❌ | ❌ |
| Create prescription | ❌ | ❌ | ✅ | ❌ | ❌ |
| Approve prescription | ✅ | ✅ | ✅ | ❌ | ❌ |
| View all prescriptions | ✅ | ✅ | ✅ (own patients) | ✅ (today, approved) | ❌ |
| View own prescription | ❌ | ❌ | ❌ | ❌ | ✅ (after approval) |
| Request prescription copy | ❌ | ❌ | ❌ | ❌ | ✅ |
| Approve prescription request | ❌ | ❌ | ✅ | ❌ | ❌ |
| Dispense medicine | ❌ | ❌ | ❌ | ✅ | ❌ |
| View case sheet | ✅ | ✅ | ✅ | ❌ | ✅ (own) |
| Upload reports | ✅ | ✅ | ❌ | ❌ | ✅ |
| View reports | ✅ | ✅ | ❌ | ❌ | ✅ (own) |
| Create prognosis | ❌ | ❌ | ✅ | ❌ | ❌ |
| Reactivate archived patient | ✅ | ✅ | ✅ | ❌ | ❌ |
| Manage CMS | ✅ | ✅ | ❌ | ❌ | ❌ |
| Make payment | ❌ | ❌ | ❌ | ❌ | ✅ |
| View billing | ✅ | ✅ | ❌ | ❌ | ✅ (own) |

---

## RBAC Middleware (Backend)

```typescript
// middlewares/auth.ts — verify JWT
export const authenticate = async (req: Request, res: Response, next: NextFunction) => {
  const token = req.headers.authorization?.replace('Bearer ', '');
  if (!token) return sendError(res, 'No token provided', 401);

  try {
    const { data: { user }, error } = await supabase.auth.getUser(token);
    if (error || !user) return sendError(res, 'Invalid or expired token', 401);
    req.user = user;
    next();
  } catch {
    return sendError(res, 'Authentication failed', 401);
  }
};

// middlewares/rbac.ts — check role
export const authorize = (...allowedRoles: string[]) =>
  async (req: Request, res: Response, next: NextFunction) => {
    const userRole = req.user?.user_metadata?.role;
    if (!allowedRoles.includes(userRole)) {
      return sendError(res, 'Access denied — insufficient permissions', 403);
    }
    next();
  };

// Usage on routes
router.post('/patients', authenticate, authorize('super_admin', 'admin'), createPatient);
router.get('/pharmacist/prescriptions', authenticate, authorize('pharmacist'), getTodaysPrescriptions);
```

---

## Security Layers

### 1. Transport Security
- HTTPS enforced everywhere (no HTTP in production)
- HSTS header via `helmet()`
- All API calls use `Authorization: Bearer <token>`

### 2. Authentication
- JWT tokens via Supabase Auth
- Token expiry: 7 days (access) + 30 days (refresh)
- Refresh token rotation on each use
- OTP verification for sensitive actions (6-digit, 5 min expiry)
- Forced logout on role change

### 3. Authorization (RBAC)
- Every route has `authenticate` + `authorize` middleware
- Frontend hides UI per role using `useRole()` hook
- Backend never trusts frontend role claims — always re-checks from JWT
- RLS policies enforce data access at DB level (last line of defense)

### 4. Input Validation
- All request bodies validated with Zod before processing
- SQL injection impossible via Supabase parameterized queries
- File uploads: MIME type check + max size 10MB per file
- Phone numbers validated as E.164 format
- UUIDs validated before DB queries

### 5. Rate Limiting
```typescript
import rateLimit from 'express-rate-limit';

// General API limit
export const generalLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 100,
  message: { success: false, error: 'Too many requests' },
});

// Auth endpoints — stricter
export const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 10,
  message: { success: false, error: 'Too many auth attempts' },
});

// OTP — very strict
export const otpLimiter = rateLimit({
  windowMs: 60 * 60 * 1000, // 1 hour
  max: 5,
  message: { success: false, error: 'OTP limit reached, try again in 1 hour' },
});
```

### 6. File Upload Security
```typescript
import multer from 'multer';

const ALLOWED_MIME_TYPES = [
  'application/pdf',
  'image/jpeg', 'image/png', 'image/webp',
  'audio/mpeg', 'audio/wav',
  'video/mp4', 'video/webm',
];

const MAX_FILE_SIZE = 10 * 1024 * 1024; // 10MB

export const upload = multer({
  storage: multer.memoryStorage(),
  limits: { fileSize: MAX_FILE_SIZE },
  fileFilter: (req, file, cb) => {
    if (ALLOWED_MIME_TYPES.includes(file.mimetype)) {
      cb(null, true);
    } else {
      cb(new AppError('File type not allowed', 400));
    }
  },
});
```

### 7. Helmet Configuration
```typescript
app.use(helmet({
  contentSecurityPolicy: {
    directives: {
      defaultSrc: ["'self'"],
      scriptSrc: ["'self'"],
    },
  },
  hsts: { maxAge: 31536000, includeSubDomains: true },
}));
```

### 8. CORS Configuration
```typescript
app.use(cors({
  origin: [process.env.APP_URL!, 'https://yourhospital.com'],
  methods: ['GET', 'POST', 'PUT', 'DELETE'],
  allowedHeaders: ['Content-Type', 'Authorization'],
  credentials: true,
}));
```

---

## Sensitive Data Handling

| Data | Rule |
|------|------|
| Passwords | Bcrypt hash only, never store plaintext |
| JWT secrets | `.env` only, rotate every 90 days |
| Meta WhatsApp keys | `.env` only |
| Patient medical data | Encrypted at rest (Supabase default), HTTPS in transit |
| OTPs | Never log, expire in 5 minutes, single use |
| Prescription PDFs | Stored in private Supabase bucket, signed URL only |
| Patient documents | Private bucket, signed URL with 1-hour expiry |

### Signed URLs for File Access
```typescript
// Generate a short-lived signed URL for secure file access
const { data } = await supabase.storage
  .from('patient-files')
  .createSignedUrl(`patients/${patientId}/reports/${fileName}`, 3600); // 1 hour

return data?.signedUrl;
```

---

## Security Checklist (Pre-Production)

### Backend
- [ ] All routes have `authenticate` middleware
- [ ] All routes have `authorize` with correct roles
- [ ] Rate limiting on all routes, stricter on auth + OTP
- [ ] Zod validation on every `req.body`, `req.params`, `req.query`
- [ ] No raw SQL string concatenation anywhere
- [ ] `helmet()` configured with CSP
- [ ] CORS restricted to known origins
- [ ] `.env` not committed, `.env.example` has all keys documented
- [ ] `console.log` removed from all production code
- [ ] Error handler never exposes stack traces in production
- [ ] File MIME type + size validation on all uploads
- [ ] Audit log entry on every write operation

### Database
- [ ] RLS enabled on all tables
- [ ] RLS policies tested for each role
- [ ] Service role key only on backend, never frontend
- [ ] Anon key has minimal permissions
- [ ] All foreign keys have explicit `ON DELETE` behavior
- [ ] No sensitive data in `audit_logs.metadata` (mask phone, email)

### Frontend
- [ ] No secrets in `NEXT_PUBLIC_*` env vars (only public keys)
- [ ] Role check on every protected page (server-side + client-side)
- [ ] JWT not stored in localStorage — use Supabase's built-in session (httpOnly cookies)
- [ ] No patient data in URL params (use POST body)
- [ ] File preview uses signed URLs, never direct storage paths

### Infrastructure
- [ ] SSL certificate on all domains
- [ ] HTTP → HTTPS redirect enforced
- [ ] Automated daily backups enabled on Supabase
- [ ] Backup restore tested
- [ ] Sentry error monitoring active
- [ ] Uptime monitoring active
