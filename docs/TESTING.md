# HMS — Testing Strategy & Examples

> How to test each layer of the HMS project, with examples for critical flows.

---

## Test Coverage Goals

| Layer | Tool | Coverage Target |
|-------|------|----------------|
| Backend services | Jest | 80%+ |
| Backend API routes | Supertest | All critical routes |
| Frontend components | React Testing Library | Key forms and flows |
| E2E critical flows | Playwright | 5 core user journeys |

---

## Backend — Unit Tests (Jest)

### Setup `jest.config.ts`
```typescript
export default {
  preset: 'ts-jest',
  testEnvironment: 'node',
  setupFilesAfterFramework: ['./src/tests/setup.ts'],
  testMatch: ['**/*.test.ts'],
  collectCoverageFrom: ['src/**/*.ts', '!src/index.ts', '!src/config/**'],
};
```

### Test file naming
- Unit tests: `patient.service.test.ts`
- Integration tests: `patient.routes.test.ts`
- Place test files next to the files they test

---

### Example — Auth Service Tests
```typescript
// src/modules/auth/auth.service.test.ts
import { authService } from './auth.service';
import { supabase } from '../../config/supabase';

jest.mock('../../config/supabase');

describe('AuthService', () => {
  describe('login', () => {
    it('returns JWT on valid credentials', async () => {
      (supabase.auth.signInWithPassword as jest.Mock).mockResolvedValue({
        data: { session: { access_token: 'mock-jwt' } },
        error: null,
      });

      const result = await authService.login('test@email.com', 'password123');
      expect(result.token).toBe('mock-jwt');
    });

    it('throws AppError on invalid credentials', async () => {
      (supabase.auth.signInWithPassword as jest.Mock).mockResolvedValue({
        data: null,
        error: { message: 'Invalid credentials' },
      });

      await expect(authService.login('wrong@email.com', 'wrong')).rejects.toThrow('Invalid credentials');
    });
  });
});
```

---

### Example — Prescription Service Tests
```typescript
// src/modules/prescriptions/prescription.service.test.ts
describe('PrescriptionService', () => {
  describe('createPrescription', () => {
    it('creates prescription with correct status', async () => {
      const payload = {
        consultationId: 'uuid-1',
        patientId: 'uuid-2',
        medicines: [{ name: 'Paracetamol', dosage: '500mg', frequency: 'twice daily' }],
      };

      const result = await prescriptionService.create(payload, 'doctor-uuid');
      expect(result.status).toBe('created');
      expect(result.medicines).toHaveLength(1);
    });

    it('throws if consultation does not belong to doctor', async () => {
      await expect(
        prescriptionService.create({ consultationId: 'other-doctors-uuid', ... }, 'doctor-uuid')
      ).rejects.toThrow('Access denied');
    });
  });

  describe('requestPrescriptionCopy', () => {
    it('creates prescription request with pending status', async () => {
      const result = await prescriptionService.requestCopy('prescription-uuid', 'patient-uuid');
      expect(result.status).toBe('pending');
    });

    it('throws if prescription does not belong to patient', async () => {
      await expect(
        prescriptionService.requestCopy('other-patients-uuid', 'patient-uuid')
      ).rejects.toThrow('Prescription not found');
    });
  });
});
```

---

## Backend — Integration Tests (Supertest)

### Setup test server
```typescript
// src/tests/setup.ts
import { app } from '../index';
import { supabase } from '../config/supabase';

// Helper: get test JWT for a specific role
export const getTestToken = async (role: string): Promise<string> => {
  const emails = {
    admin: 'test-admin@hms.test',
    doctor: 'test-doctor@hms.test',
    pharmacist: 'test-pharmacist@hms.test',
    patient: 'test-patient@hms.test',
  };
  const { data } = await supabase.auth.signInWithPassword({
    email: emails[role],
    password: 'TestPass@123',
  });
  return data.session!.access_token;
};

export { app };
```

### Example — Queue Route Tests
```typescript
// src/modules/queue/queue.routes.test.ts
import request from 'supertest';
import { app, getTestToken } from '../../tests/setup';

describe('Queue Routes', () => {
  let adminToken: string;
  let doctorToken: string;
  let patientToken: string;

  beforeAll(async () => {
    adminToken = await getTestToken('admin');
    doctorToken = await getTestToken('doctor');
    patientToken = await getTestToken('patient');
  });

  describe('GET /api/queue', () => {
    it('returns queue for admin', async () => {
      const res = await request(app)
        .get('/api/queue')
        .set('Authorization', `Bearer ${adminToken}`);
      expect(res.status).toBe(200);
      expect(res.body.success).toBe(true);
      expect(Array.isArray(res.body.data.items)).toBe(true);
    });

    it('returns queue for doctor', async () => {
      const res = await request(app)
        .get('/api/queue')
        .set('Authorization', `Bearer ${doctorToken}`);
      expect(res.status).toBe(200);
    });

    it('blocks patient from viewing queue', async () => {
      const res = await request(app)
        .get('/api/queue')
        .set('Authorization', `Bearer ${patientToken}`);
      expect(res.status).toBe(403);
    });

    it('blocks unauthenticated requests', async () => {
      const res = await request(app).get('/api/queue');
      expect(res.status).toBe(401);
    });
  });

  describe('POST /api/queue/token', () => {
    it('generates token for admin', async () => {
      const res = await request(app)
        .post('/api/queue/token')
        .set('Authorization', `Bearer ${adminToken}`)
        .send({ patientId: 'test-patient-uuid', billingId: 'test-billing-uuid' });
      expect(res.status).toBe(201);
      expect(res.body.data.token_number).toBeGreaterThan(0);
    });
  });
});
```

### Example — Payment Route Tests
```typescript
describe('Payment Routes', () => {
  describe('POST /api/payments/verify (Razorpay webhook)', () => {
    it('verifies valid Razorpay signature', async () => {
      // Generate a valid signature for testing
      const crypto = require('crypto');
      const orderId = 'order_test123';
      const paymentId = 'pay_test456';
      const signature = crypto
        .createHmac('sha256', process.env.RAZORPAY_KEY_SECRET!)
        .update(`${orderId}|${paymentId}`)
        .digest('hex');

      const res = await request(app)
        .post('/api/payments/verify')
        .send({ razorpay_order_id: orderId, razorpay_payment_id: paymentId, razorpay_signature: signature });

      expect(res.status).toBe(200);
    });

    it('rejects invalid signature', async () => {
      const res = await request(app)
        .post('/api/payments/verify')
        .send({ razorpay_order_id: 'order_1', razorpay_payment_id: 'pay_1', razorpay_signature: 'fake' });
      expect(res.status).toBe(400);
    });
  });
});
```

---

## Frontend — Component Tests (React Testing Library)

### Example — Patient Registration Form
```typescript
// components/forms/patient-registration-form.test.tsx
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { PatientRegistrationForm } from './patient-registration-form';

describe('PatientRegistrationForm', () => {
  it('shows validation errors on empty submit', async () => {
    render(<PatientRegistrationForm onSubmit={jest.fn()} />);
    fireEvent.click(screen.getByRole('button', { name: /register/i }));

    await waitFor(() => {
      expect(screen.getByText(/name is required/i)).toBeInTheDocument();
      expect(screen.getByText(/phone number is required/i)).toBeInTheDocument();
    });
  });

  it('calls onSubmit with correct data', async () => {
    const mockSubmit = jest.fn();
    render(<PatientRegistrationForm onSubmit={mockSubmit} />);

    fireEvent.change(screen.getByLabelText(/name/i), { target: { value: 'John Doe' } });
    fireEvent.change(screen.getByLabelText(/phone/i), { target: { value: '+919876543210' } });
    fireEvent.click(screen.getByRole('button', { name: /register/i }));

    await waitFor(() => {
      expect(mockSubmit).toHaveBeenCalledWith(
        expect.objectContaining({ name: 'John Doe', phone: '+919876543210' })
      );
    });
  });

  it('shows invalid phone error for wrong format', async () => {
    render(<PatientRegistrationForm onSubmit={jest.fn()} />);
    fireEvent.change(screen.getByLabelText(/phone/i), { target: { value: '12345' } });
    fireEvent.click(screen.getByRole('button', { name: /register/i }));

    await waitFor(() => {
      expect(screen.getByText(/invalid phone number/i)).toBeInTheDocument();
    });
  });
});
```

---

## E2E Tests — Playwright

### 5 Critical User Journeys

**1. Online patient registration → payment → queue**
**2. Offline patient registration → admin marks paid → queue**
**3. Doctor consultation → prescription creation**
**4. Patient requests prescription copy → doctor approves**
**5. Pharmacist dispenses prescription (offline flow)**

```typescript
// e2e/online-patient-flow.spec.ts
import { test, expect } from '@playwright/test';

test.describe('Online patient flow', () => {
  test('patient can register, pay, and see queue token', async ({ page }) => {
    // 1. Register
    await page.goto('/register');
    await page.fill('[name="name"]', 'Test Patient');
    await page.fill('[name="email"]', 'patient@test.com');
    await page.fill('[name="phone"]', '9876543210');
    await page.fill('[name="password"]', 'TestPass@123');
    await page.click('button[type="submit"]');

    // 2. OTP verification (mock OTP in test env)
    await page.waitForURL('/verify-otp');
    await page.fill('[name="otp"]', '123456'); // test OTP
    await page.click('button[type="submit"]');

    // 3. Create case sheet
    await page.waitForURL('/patient/case-sheet/new');
    await page.fill('[name="chiefComplaint"]', 'Fever and cold');
    await page.click('button[type="submit"]');

    // 4. WhatsApp sent confirmation visible
    await expect(page.getByText(/payment link sent/i)).toBeVisible();

    // 5. Simulate payment (test mode)
    await page.goto('/patient/payment?orderId=test_order');
    // Razorpay test mode auto-completes

    // 6. Wait for queue token
    await page.waitForURL('/patient/queue');
    await expect(page.getByText(/token number/i)).toBeVisible();
  });
});
```

```typescript
// e2e/prescription-request.spec.ts
test('patient can request prescription and doctor can approve', async ({ browser }) => {
  const patientContext = await browser.newContext();
  const doctorContext = await browser.newContext();

  const patientPage = await patientContext.newPage();
  const doctorPage = await doctorContext.newPage();

  // Login as patient
  await patientPage.goto('/login');
  await patientPage.fill('[name="email"]', 'patient@test.com');
  await patientPage.fill('[name="password"]', 'TestPass@123');
  await patientPage.click('button[type="submit"]');

  // Request prescription
  await patientPage.goto('/patient/prescriptions');
  await patientPage.click('text=Request Copy');
  await expect(patientPage.getByText(/request sent/i)).toBeVisible();

  // Login as doctor
  await doctorPage.goto('/login');
  await doctorPage.fill('[name="email"]', 'doctor@test.com');
  await doctorPage.fill('[name="password"]', 'TestPass@123');
  await doctorPage.click('button[type="submit"]');

  // Approve request
  await doctorPage.goto('/doctor/prescription-requests');
  await doctorPage.click('text=Approve');
  await expect(doctorPage.getByText(/approved/i)).toBeVisible();

  // Patient should now see prescription
  await patientPage.reload();
  await expect(patientPage.getByText(/download prescription/i)).toBeVisible();

  await patientContext.close();
  await doctorContext.close();
});
```

---

## Running Tests

```bash
# Backend — unit tests
cd backend
npm run test

# Backend — with coverage
npm run test:coverage

# Backend — watch mode
npm run test:watch

# Frontend — component tests
cd frontend
npm run test

# E2E — all tests
npx playwright test

# E2E — specific flow
npx playwright test e2e/online-patient-flow.spec.ts

# E2E — with UI (headed mode for debugging)
npx playwright test --headed

# E2E — generate report
npx playwright show-report
```

---

## Test Environment Setup

Add to backend `.env.test`:
```bash
NODE_ENV=test
SUPABASE_URL=https://test-project.supabase.co
SUPABASE_SERVICE_ROLE_KEY=test-service-key
JWT_SECRET=test-jwt-secret-min-32-chars
RAZORPAY_KEY_SECRET=test-razorpay-secret
OTP_TEST_BYPASS=123456   # fixed OTP for tests
```

Test users to seed in DB (via `npm run db:seed:test`):
- `test-admin@hms.test` / `TestPass@123` (admin role)
- `test-doctor@hms.test` / `TestPass@123` (doctor role)
- `test-pharmacist@hms.test` / `TestPass@123` (pharmacist role)
- `test-patient@hms.test` / `TestPass@123` (patient role)
