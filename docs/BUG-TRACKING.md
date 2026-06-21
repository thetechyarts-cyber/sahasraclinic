# HMS — Bug Tracking & Debugging Guide

> Standard process for finding, reporting, fixing, and verifying bugs across the HMS project.

---

## Bug Severity Levels

| Level | Label | Description | Response Time |
|-------|-------|-------------|---------------|
| P0 | Critical | System down, payments broken, data loss | Fix immediately, hotfix branch |
| P1 | High | Core flow broken (registration, queue, prescription) | Fix within 24 hours |
| P2 | Medium | Feature partially broken but workaround exists | Fix in current sprint |
| P3 | Low | UI glitch, minor UX issue, non-blocking | Fix in next sprint |

---

## Bug Report Template

When logging a bug (GitHub Issue / Notion / Linear), always include:

```
**Title:** [Module] Short description of the bug

**Severity:** P0 / P1 / P2 / P3

**Environment:** local / staging / production

**Steps to Reproduce:**
1. Go to ...
2. Click on ...
3. See error ...

**Expected Behavior:**
What should have happened.

**Actual Behavior:**
What actually happened.

**Screenshots / Logs:**
Attach console errors, network tab, server logs.

**User Role:**
Which role was logged in when this happened.

**Related Code:**
File path / function name if known.
```

---

## Debugging by Layer

### 1. Frontend Bugs

**Step 1 — Check browser console**
- Look for red errors first
- Check for unhandled promise rejections
- Check for React hydration errors (SSR/CSR mismatch)

**Step 2 — Check network tab**
- Is the API request being made?
- What status code is returned?
- Check the request payload — is the data being sent correctly?
- Check the response body — what is the server returning?

**Step 3 — Check React Query / state**
- Use React Query DevTools to inspect query state
- Check if data is stale / cached incorrectly
- Verify query keys are correct

**Step 4 — Check auth / role**
- Is the user's session still valid?
- Is the JWT token being sent in the `Authorization` header?
- Is the role check passing?

**Common Frontend Bugs & Fixes:**

| Bug | Likely Cause | Fix |
|-----|-------------|-----|
| Page shows blank / crashes | Unhandled null/undefined in render | Add null checks, use optional chaining `?.` |
| Form not submitting | Zod validation error not shown | Log `formState.errors` to find the field |
| Data not refreshing after mutation | React Query cache not invalidated | Add `queryClient.invalidateQueries()` after mutation |
| Redirect loop on login | Role-based redirect logic error | Check `useRole()` hook and middleware |
| File upload not working | Wrong content-type header | Use `multipart/form-data`, not `application/json` |
| Realtime queue not updating | Supabase channel not subscribed | Check `supabase.channel()` setup and filter |

---

### 2. Backend Bugs

**Step 1 — Check server logs**
```bash
# Local
npm run dev   # watch console output

# Production (Railway / DO)
railway logs --tail
# or check the platform dashboard logs
```

**Step 2 — Check the error response**
- Is the global error handler catching it?
- Is `AppError` being thrown with correct status code?
- Is Zod validation rejecting the request before it hits the service?

**Step 3 — Isolate the layer**
- Add temporary `console.log` (remove before commit) to narrow down which line fails
- Test the service function in isolation (unit test or quick script)
- Check if the issue is in the DB query vs the business logic

**Step 4 — Check DB**
- Run the raw SQL in Supabase SQL editor to verify it works
- Check RLS policies — they silently block queries without errors
- Check if the record actually exists (common mistake: wrong ID format uuid vs int)

**Common Backend Bugs & Fixes:**

| Bug | Likely Cause | Fix |
|-----|-------------|-----|
| 401 on valid request | JWT expired or wrong secret | Check token expiry, verify `JWT_SECRET` matches |
| 403 on correct role | RBAC middleware wrong permission name | Check permission string matches DB exactly |
| 400 Zod error | Request body field name mismatch | Log `req.body` and compare to Zod schema |
| Empty array returned | RLS policy blocking the query | Test query in Supabase editor as service role |
| OTP not sending | Nodemailer/Meta credentials wrong | Check Gmail App Password, check Meta Token |
| File upload fails | Bucket policy / MIME type restriction | Check Supabase Storage bucket settings |
| N+1 slow queries | Fetching related data in a loop | Rewrite with JOIN or Supabase nested select |

---

### 3. Database / Supabase Bugs

**Debugging RLS (Row Level Security) Issues**
RLS silently returns empty results or blocks writes — always suspect RLS first when data mysteriously disappears.

```sql
-- Temporarily test as service role (bypasses RLS)
-- Run in Supabase SQL editor
SELECT * FROM case_sheets WHERE patient_id = 'xxx';

-- Check existing policies on a table
SELECT * FROM pg_policies WHERE tablename = 'case_sheets';

-- Test what a specific user can see (set role)
SET LOCAL ROLE authenticated;
SET LOCAL request.jwt.claims = '{"sub": "user-uuid", "role": "doctor"}';
SELECT * FROM case_sheets;
```

**Common DB Issues:**

| Issue | Fix |
|-------|-----|
| Insert silently ignored | RLS `WITH CHECK` policy not allowing insert |
| SELECT returns empty | RLS `USING` policy not matching current user |
| FK constraint error | Referenced record doesn't exist — check insert order |
| UUID cast error | Passing string where UUID expected — ensure correct type |
| `updated_at` not updating | Add trigger: `CREATE TRIGGER set_updated_at BEFORE UPDATE ...` |

---

### 4. Payment (Manual UPI) Bugs

**Common Payment Issues:**

| Issue | Fix |
|-------|-----|
| Payment stuck as pending | Admin must manually verify screenshot and mark as paid — expected behavior |
| Screenshot upload fails | Check Supabase Storage bucket settings for file size/MIME type |

---

### 5. WhatsApp / Email Bugs

**Check Meta WhatsApp:**
- Verify `META_WHATSAPP_PHONE_NUMBER_ID` and `META_WHATSAPP_ACCESS_TOKEN`.
- Check if template name matches the approved template in Meta Dashboard.

**Check Nodemailer:**
- Ensure Gmail App Password is used, not standard account password.
- Verify 2-Step Verification is enabled on the Gmail account.

**Common Notification Issues:**

| Issue | Fix |
|-------|-----|
| SMS not delivered | Number format wrong — use +91XXXXXXXXXX |
| WhatsApp message not sending | Template not approved by Meta / wrong template ID |
| Email going to spam | SPF/DKIM records not set on domain |
| OTP expired | Check `OTP_EXPIRY_MINUTES` constant, regenerate |

---

## Debugging Tools & Commands

### Useful npm scripts to add
```json
{
  "scripts": {
    "debug": "node --inspect src/index.ts",
    "db:studio": "supabase studio",
    "db:migrate": "supabase db push",
    "db:seed": "ts-node scripts/seed.ts",
    "test:watch": "jest --watch",
    "test:coverage": "jest --coverage",
    "lint:fix": "eslint . --fix && prettier --write ."
  }
}
```

### Check health of all services
```typescript
// GET /health endpoint — add to backend
app.get('/health', async (req, res) => {
  const checks = {
    server: 'ok',
    database: await checkDB(),
    storage: await checkStorage(),
  };
  const allOk = Object.values(checks).every(v => v === 'ok');
  res.status(allOk ? 200 : 503).json(checks);
});
```

---

## Fix Workflow

```
1. Reproduce the bug locally
2. Write a failing test that captures the bug (if possible)
3. Fix the code
4. Verify the test passes
5. Run full test suite — ensure nothing else broke
6. Create PR with:
   - fix: description of the bug
   - What caused it
   - How it was fixed
   - Test added / updated
7. Deploy to staging → verify fix
8. Deploy to production
9. Close the bug report
```

---

## Logs Reference

### Backend log levels (use logger utility)
```typescript
import { logger } from '../utils/logger';

logger.info('Queue token generated', { patientId, token });
logger.warn('Payment pending for over 30 mins', { billingId });
logger.error('WhatsApp message failed to send', { patientId });
```

### Audit log — events to always log
```typescript
// Any write operation must create an audit entry
await auditService.log({
  userId: req.user.id,
  action: 'PRESCRIPTION_APPROVED',
  module: 'prescriptions',
  entityId: prescriptionId,
  ip: req.ip,
});
```
