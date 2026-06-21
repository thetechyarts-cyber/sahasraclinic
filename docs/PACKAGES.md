# HMS — Packages & Tech Decisions

> Every package used in this project, why it was chosen, and how to use it correctly.

---

## Backend Packages

### Core
| Package | Version | Purpose |
|---------|---------|---------|
| `express` | ^4.18 | HTTP server and routing |
| `typescript` | ^5 | Type safety |
| `ts-node-dev` | ^2 | Dev server with hot reload |
| `dotenv` | ^16 | Environment variables |

### Auth & Security
| Package | Version | Purpose |
|---------|---------|---------|
| `@supabase/supabase-js` | ^2 | Supabase client (auth + DB + storage) |
| `jsonwebtoken` | ^9 | JWT sign and verify |
| `bcryptjs` | ^2 | Password hashing |
| `helmet` | ^7 | Security HTTP headers |
| `cors` | ^2 | CORS configuration |
| `express-rate-limit` | ^7 | Rate limiting per IP |

### Validation
| Package | Version | Purpose |
|---------|---------|---------|
| `zod` | ^3 | Schema validation for request bodies |

### Utilities
| Package | Version | Purpose |
|---------|---------|---------|
| `morgan` | ^1 | HTTP request logging |
| `winston` | ^3 | Application logger (file + console) |
| `uuid` | ^9 | Generate UUIDs where needed |
| `date-fns` | ^3 | Date formatting and manipulation |
| `multer` | ^1 | File upload handling (multipart/form-data) |

### Payments
| Package | Version | Purpose |
|---------|---------|---------|
| (None)  | -       | Manual UPI payments via WhatsApp |

### Notifications
| Package | Version | Purpose |
|---------|---------|---------|
| `nodemailer` | ^6 | Email sending via Gmail SMTP |
| `axios` | ^1 | HTTP requests to Meta WhatsApp Business API |

### PDF
| Package | Version | Purpose |
|---------|---------|---------|
| `puppeteer` | ^21 | Generate prescription PDFs from HTML |

### Testing
| Package | Version | Purpose |
|---------|---------|---------|
| `jest` | ^29 | Unit + integration tests |
| `ts-jest` | ^29 | TypeScript support for Jest |
| `supertest` | ^6 | HTTP integration testing |
| `@faker-js/faker` | ^8 | Generate fake test data |

---

## Frontend Packages

### Core
| Package | Version | Purpose |
|---------|---------|---------|
| `next` | ^14 | React framework (App Router) |
| `react` | ^18 | UI library |
| `typescript` | ^5 | Type safety |

### Styling
| Package | Version | Purpose |
|---------|---------|---------|
| `tailwindcss` | ^3 | Utility-first CSS |
| `@shadcn/ui` | latest | Accessible component library |
| `lucide-react` | latest | Icons (used by ShadCN) |
| `class-variance-authority` | latest | Component variants (used by ShadCN) |
| `clsx` | latest | Conditional class merging |
| `tailwind-merge` | latest | Merge Tailwind classes safely |

### Auth & Data
| Package | Version | Purpose |
|---------|---------|---------|
| `@supabase/supabase-js` | ^2 | Supabase client |
| `@supabase/auth-helpers-nextjs` | ^0.9 | Supabase auth + Next.js integration |
| `@tanstack/react-query` | ^5 | Server state management, caching |
| `@tanstack/react-query-devtools` | ^5 | DevTools for debugging queries |
| `axios` | ^1 | HTTP client (API calls to backend) |

### Forms
| Package | Version | Purpose |
|---------|---------|---------|
| `react-hook-form` | ^7 | Performant form state |
| `@hookform/resolvers` | ^3 | Connect Zod to react-hook-form |
| `zod` | ^3 | Schema validation (shared with backend) |

### UI Utilities
| Package | Version | Purpose |
|---------|---------|---------|
| `sonner` | ^1 | Toast notifications |
| `react-dropzone` | ^14 | Drag-and-drop file uploads |
| `@radix-ui/react-*` | latest | Headless UI primitives (via ShadCN) |
| `recharts` | ^2 | Charts for reports/analytics |
| `date-fns` | ^3 | Date formatting |
| `react-pdf` | ^7 | Render prescription PDFs in browser |

### Real-time
| Package | Version | Purpose |
|---------|---------|---------|
| `@supabase/realtime-js` | ^2 | Real-time queue updates (via Supabase) |

### Testing
| Package | Version | Purpose |
|---------|---------|---------|
| `@testing-library/react` | ^14 | Component tests |
| `@testing-library/jest-dom` | ^6 | DOM matchers |
| `playwright` | ^1 | E2E tests |
| `jest` | ^29 | Test runner |

---

## Installation Commands

### Backend setup
```bash
mkdir backend && cd backend
npm init -y
npm install express typescript ts-node-dev dotenv @supabase/supabase-js jsonwebtoken bcryptjs helmet cors express-rate-limit zod morgan winston uuid date-fns multer nodemailer axios puppeteer

npm install -D @types/express @types/node @types/jsonwebtoken @types/bcryptjs @types/cors @types/morgan @types/multer @types/uuid jest ts-jest supertest @faker-js/faker @types/jest @types/supertest
```

### Frontend setup
```bash
npx create-next-app@latest frontend --typescript --tailwind --eslint --app
cd frontend
npx shadcn-ui@latest init

npm install @supabase/supabase-js @supabase/auth-helpers-nextjs @tanstack/react-query @tanstack/react-query-devtools axios react-hook-form @hookform/resolvers zod sonner react-dropzone recharts date-fns react-pdf lucide-react clsx tailwind-merge class-variance-authority

npm install -D @testing-library/react @testing-library/jest-dom jest @playwright/test
```

---

## Key Usage Patterns

### Supabase client (backend — service role)
```typescript
// src/config/supabase.ts
import { createClient } from '@supabase/supabase-js';

export const supabase = createClient(
  process.env.SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!, // service role — bypasses RLS
  { auth: { autoRefreshToken: false, persistSession: false } }
);
```

### Supabase client (frontend — anon key)
```typescript
// lib/supabase.ts
import { createClientComponentClient } from '@supabase/auth-helpers-nextjs';
export const supabase = createClientComponentClient();
```

### Zod validation middleware
```typescript
// middlewares/validate.ts
import { AnyZodObject, ZodError } from 'zod';

export const validate = (schema: AnyZodObject) =>
  (req: Request, res: Response, next: NextFunction) => {
    try {
      schema.parse({ body: req.body, params: req.params, query: req.query });
      next();
    } catch (e) {
      if (e instanceof ZodError) {
        return res.status(400).json({ success: false, error: 'Validation failed', details: e.errors });
      }
      next(e);
    }
  };
```

### React Query + Axios pattern
```typescript
// lib/api-client.ts
import axios from 'axios';

export const api = axios.create({
  baseURL: process.env.NEXT_PUBLIC_API_URL,
});

api.interceptors.request.use(async (config) => {
  const { data: { session } } = await supabase.auth.getSession();
  if (session?.access_token) {
    config.headers.Authorization = `Bearer ${session.access_token}`;
  }
  return config;
});
```

### React Hook Form + Zod
```typescript
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';

const schema = z.object({
  name: z.string().min(2, 'Name is required'),
  phone: z.string().regex(/^\+91\d{10}$/, 'Invalid phone number'),
});

type FormData = z.infer<typeof schema>;

const PatientForm = () => {
  const form = useForm<FormData>({ resolver: zodResolver(schema) });

  const onSubmit = async (data: FormData) => {
    await api.post('/patients', data);
  };

  return (
    <form onSubmit={form.handleSubmit(onSubmit)}>
      {/* ShadCN Form components */}
    </form>
  );
};
```

### Meta WhatsApp API
```typescript
// utils/whatsapp.ts
import axios from 'axios';

const WHATSAPP_URL = `https://graph.facebook.com/${process.env.META_WHATSAPP_API_VERSION}/${process.env.META_WHATSAPP_PHONE_NUMBER_ID}/messages`;

export const sendWhatsAppText = async (to: string, message: string) => {
  await axios.post(
    WHATSAPP_URL,
    { messaging_product: 'whatsapp', to: `91${to}`, type: 'text', text: { body: message } },
    { headers: { Authorization: `Bearer ${process.env.META_WHATSAPP_ACCESS_TOKEN}` } }
  );
};
```

### Supabase Realtime (queue updates)
```typescript
// Subscribe to queue changes
const channel = supabase
  .channel('queue-updates')
  .on('postgres_changes', {
    event: '*',
    schema: 'public',
    table: 'queue_tokens',
  }, (payload) => {
    queryClient.invalidateQueries({ queryKey: ['queue'] });
  })
  .subscribe();

// Cleanup on unmount
return () => { supabase.removeChannel(channel); };
```

### Winston logger
```typescript
// utils/logger.ts
import winston from 'winston';

export const logger = winston.createLogger({
  level: process.env.NODE_ENV === 'production' ? 'warn' : 'debug',
  format: winston.format.combine(
    winston.format.timestamp(),
    winston.format.json()
  ),
  transports: [
    new winston.transports.Console(),
    new winston.transports.File({ filename: 'logs/error.log', level: 'error' }),
    new winston.transports.File({ filename: 'logs/combined.log' }),
  ],
});
```

### Puppeteer prescription PDF
```typescript
// utils/pdf-generator.ts
import puppeteer from 'puppeteer';

export const generatePrescriptionPDF = async (html: string): Promise<Buffer> => {
  const browser = await puppeteer.launch({ headless: true, args: ['--no-sandbox'] });
  const page = await browser.newPage();
  await page.setContent(html, { waitUntil: 'networkidle0' });
  const pdf = await page.pdf({ format: 'A4', printBackground: true });
  await browser.close();
  return pdf;
};
```

### Nodemailer Email
```typescript
// utils/mailer.ts
import nodemailer from 'nodemailer';

const transporter = nodemailer.createTransport({
  service: 'gmail',
  auth: { user: process.env.GMAIL_USER, pass: process.env.GMAIL_APP_PASSWORD },
});

export const sendEmail = async (to: string, subject: string, html: string) => {
  await transporter.sendMail({
    from: `"${process.env.GMAIL_FROM_NAME}" <${process.env.GMAIL_USER}>`,
    to, subject, html
  });
};
```

---

## Package Decision Notes

**Why Puppeteer for PDFs?** Full HTML/CSS control over prescription layout — alternatives like `pdfmake` or `jspdf` are harder to style to match the clinic's format.

**Why React Query v5?** Automatic background refetching, cache invalidation, and optimistic updates out of the box — critical for real-time queue feel without full Supabase Realtime on every component.

**Why Zod shared between frontend + backend?** Single source of truth for validation rules. Change the schema once, both sides update. Avoids divergence bugs.

**Why ShadCN over other UI libraries?** Components are copied into the project (not a black-box npm package), so they can be customized freely. Full Tailwind compatibility.

**Why Supabase Realtime for queue?** Zero extra infrastructure — queue updates are just Postgres changes. No need for a separate WebSocket server.
