# HMS — Environment Setup & Onboarding

> Follow this guide exactly when setting up the project for the first time.

---

## Prerequisites

Ensure these are installed before starting:

```bash
node --version    # v20+ required
npm --version     # v10+
git --version     # any recent version
```

Also needed:
- [Supabase account](https://supabase.com) — free tier works for dev
- [Meta Developer account](https://developers.facebook.com) — for WhatsApp Business API
- Gmail account with 2-Step Verification enabled — for Nodemailer

---

## Step 1 — Clone & Structure

```bash
git clone <repo-url>
cd hms

# Structure expected:
# hms/
#   backend/
#   frontend/
#   docs/         ← these .md files live here
```

---

## Step 2 — Supabase Setup

1. Go to [supabase.com](https://supabase.com) → New project
2. Note down:
   - Project URL (`https://xxxx.supabase.co`)
   - `anon` key (for frontend)
   - `service_role` key (for backend — keep secret)
3. Go to **SQL Editor** → run the migration files from `/backend/migrations/` in order
4. Go to **Storage** → create buckets:
   - `patient-files` (private)
   - `prescription-pdfs` (private)
   - `invoice-pdfs` (private)
5. Enable **Realtime** on the `queue_tokens` table:
   - Go to Database → Replication → enable `queue_tokens`

---

## Step 3 — Backend Setup

```bash
cd backend
cp .env.example .env
```

Fill in `.env`:
```bash
PORT=5000
NODE_ENV=development

# Supabase
SUPABASE_URL=https://xxxx.supabase.co
SUPABASE_SERVICE_ROLE_KEY=eyJxxx...

# JWT
JWT_SECRET=your-super-secret-key-min-32-chars
JWT_EXPIRES_IN=7d

# Meta WhatsApp Business API
META_WHATSAPP_PHONE_NUMBER_ID=your_phone_number_id
META_WHATSAPP_ACCESS_TOKEN=your_permanent_access_token
META_WHATSAPP_API_VERSION=v19.0

# Gmail (Nodemailer)
GMAIL_USER=yourclinic@gmail.com
GMAIL_APP_PASSWORD=xxxx xxxx xxxx xxxx
GMAIL_FROM_NAME=Hospital Name

# App
APP_URL=http://localhost:3000
API_URL=http://localhost:5000
```

```bash
npm install
npm run dev     # starts on port 5000
```

---

## Step 4 — Frontend Setup

```bash
cd frontend
cp .env.example .env.local
```

Fill in `.env.local`:
```bash
NEXT_PUBLIC_SUPABASE_URL=https://xxxx.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJxxx...
NEXT_PUBLIC_API_URL=http://localhost:5000/api
```

```bash
npm install
npx shadcn-ui@latest init   # if first time — select defaults
npm run dev     # starts on port 3000
```

---

## Step 5 — Seed Initial Data

```bash
cd backend
npm run db:seed
```

This creates:
- Default roles: `super_admin`, `admin`, `doctor`, `pharmacist`, `patient`
- Default permissions per role
- One Super Admin user: `admin@hospital.com` / `Admin@123`

**Change the default password immediately after first login.**

---

## Step 6 — Verify Everything Works

```bash
# 1. Health check
curl http://localhost:5000/api/health

# Expected:
# { "success": true, "data": { "server": "ok", "database": "ok" } }

# 2. Login
curl -X POST http://localhost:5000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email": "admin@hospital.com", "password": "Admin@123"}'

# Expected: JWT token in response
```

---

## Development Workflow

```bash
# Create a new feature branch
git checkout dev
git pull origin dev
git checkout -b feature/your-feature-name

# Work on the feature...

# Before committing
npm run lint:fix      # in backend or frontend
npm run test          # make sure tests pass

# Commit
git add .
git commit -m "feat: your feature description"
git push origin feature/your-feature-name

# Open PR → target: dev branch
```

---

## Useful Local URLs

| URL | Description |
|-----|-------------|
| `http://localhost:3000` | Frontend (Next.js) |
| `http://localhost:5000/api` | Backend API |
| `http://localhost:5000/api/health` | Health check |
| `https://xxxx.supabase.co` | Supabase dashboard |
| Supabase → Table Editor | Browse DB data |
| Supabase → Storage | Browse uploaded files |
| Supabase → Auth → Users | Manage auth users |

---

## Common Setup Errors

**`Cannot find module '@supabase/supabase-js'`**
```bash
cd backend && npm install
```

**`Invalid API key` from Supabase**
- Double check you're using `service_role` key in backend, not `anon` key
- Anon key goes in frontend only

**`JWT malformed` errors**
- Make sure `JWT_SECRET` is the same in both `.env` files if backend and frontend share it
- More than 32 chars recommended

**Port 5000 already in use**
```bash
lsof -i :5000 | grep LISTEN
kill -9 <PID>
```

**Supabase RLS blocking everything**
- In dev, you can temporarily use service role key which bypasses RLS
- Never do this in production

---

## Recommended VS Code Extensions

```json
{
  "recommendations": [
    "dbaeumer.vscode-eslint",
    "esbenp.prettier-vscode",
    "bradlc.vscode-tailwindcss",
    "formulahendry.auto-rename-tag",
    "christian-kohler.path-intellisense",
    "ms-vscode.vscode-typescript-next",
    "supabase.vscode-supabase",
    "prisma.prisma",
    "usernamehw.errorlens"
  ]
}
```

---

## VS Code Settings (`.vscode/settings.json`)

```json
{
  "editor.defaultFormatter": "esbenp.prettier-vscode",
  "editor.formatOnSave": true,
  "editor.codeActionsOnSave": {
    "source.fixAll.eslint": true
  },
  "typescript.preferences.importModuleSpecifier": "relative",
  "tailwindCSS.experimental.classRegex": [
    ["cva\\(([^)]*)\\)", "[\"'`]([^\"'`]*).*?[\"'`]"]
  ]
}
```
