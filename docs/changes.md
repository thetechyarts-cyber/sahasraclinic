# HMS — Changes Log

---

## Change 1 — Remove Razorpay, Replace Twilio with Meta WhatsApp, Replace SendGrid with Nodemailer (Gmail)

### What Changed & Why

| Old | New | Reason |
|-----|-----|--------|
| Razorpay | ❌ Removed | Payment is manual UPI — admin sends QR/link via WhatsApp, patient pays and uploads screenshot, admin marks as paid |
| Twilio WhatsApp | Meta WhatsApp Business API | Using Meta directly via phone number ID and access token |
| SendGrid | Nodemailer (Gmail) | Using clinic's own Gmail account to send emails |

---

### `.env.example` — Updated

**Remove these completely:**
```bash
# REMOVE — Razorpay not used
RAZORPAY_KEY_ID=rzp_test_xxxx
RAZORPAY_KEY_SECRET=xxxx

# REMOVE — Twilio not used
TWILIO_ACCOUNT_SID=ACxxxx
TWILIO_AUTH_TOKEN=xxxx
TWILIO_PHONE_NUMBER=+1xxxxxxxxxx
TWILIO_WHATSAPP_NUMBER=+14155238886

# REMOVE — SendGrid not used
SENDGRID_API_KEY=SG.xxxx
SENDGRID_FROM_EMAIL=noreply@yourhospital.com
```

**Add these instead:**
```bash
# Meta WhatsApp Business API
META_WHATSAPP_PHONE_NUMBER_ID=your_phone_number_id
META_WHATSAPP_ACCESS_TOKEN=your_permanent_access_token
META_WHATSAPP_API_VERSION=v19.0

# Gmail (Nodemailer)
GMAIL_USER=yourclinic@gmail.com
GMAIL_APP_PASSWORD=xxxx xxxx xxxx xxxx
GMAIL_FROM_NAME=Hospital Name
```

**Full updated `.env.example`:**
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

---

### Packages — Updated

**Remove:**
```bash
npm uninstall razorpay @sendgrid/mail twilio
```

**Add:**
```bash
npm install nodemailer axios
npm install -D @types/nodemailer
```

> `axios` is used to call Meta WhatsApp Cloud API (simple REST call — no SDK needed)
> `nodemailer` handles Gmail SMTP sending

---

### How to Get Meta WhatsApp Credentials

1. Go to [developers.facebook.com](https://developers.facebook.com)
2. Create a new App → select **Business** type
3. Add **WhatsApp** product to your app
4. Go to WhatsApp → Getting Started
5. Copy your **Phone Number ID** → `META_WHATSAPP_PHONE_NUMBER_ID`
6. Generate a **Permanent Access Token** from Meta Business Suite → `META_WHATSAPP_ACCESS_TOKEN`
7. Set API version to `v19.0` (or latest stable)

> **Important:** WhatsApp messages to new users require a pre-approved **Message Template** from Meta.
> For the payment QR/link message, submit a template like:
> *"Hello {{1}}, please find your payment details for your appointment. Amount: ₹{{2}}. Pay here: {{3}}"*
> Template approval takes 1–3 business days.

---

### How to Get Gmail App Password

1. Go to your Gmail account → **Google Account Settings**
2. Security → Enable **2-Step Verification** (required)
3. Security → **App Passwords**
4. Select app: **Mail**, device: **Other** → type "HMS"
5. Copy the 16-character password → `GMAIL_APP_PASSWORD`

> Never use your actual Gmail password — always use an App Password.

---

### Updated Utility Files

#### WhatsApp sender (`utils/whatsapp.ts`)
```typescript
import axios from 'axios';

const WHATSAPP_URL = `https://graph.facebook.com/${process.env.META_WHATSAPP_API_VERSION}/${process.env.META_WHATSAPP_PHONE_NUMBER_ID}/messages`;

// Send a pre-approved template message
export const sendWhatsAppTemplate = async (
  to: string,           // patient phone e.g. 9876543210
  templateName: string, // approved template name
  parameters: string[]  // dynamic values in the template
) => {
  await axios.post(
    WHATSAPP_URL,
    {
      messaging_product: 'whatsapp',
      to: `91${to}`,
      type: 'template',
      template: {
        name: templateName,
        language: { code: 'en' },
        components: [
          {
            type: 'body',
            parameters: parameters.map(text => ({ type: 'text', text })),
          },
        ],
      },
    },
    {
      headers: {
        Authorization: `Bearer ${process.env.META_WHATSAPP_ACCESS_TOKEN}`,
        'Content-Type': 'application/json',
      },
    }
  );
};

// Send a plain text message (only to users who messaged you first within 24hrs)
export const sendWhatsAppText = async (to: string, message: string) => {
  await axios.post(
    WHATSAPP_URL,
    {
      messaging_product: 'whatsapp',
      to: `91${to}`,
      type: 'text',
      text: { body: message },
    },
    {
      headers: {
        Authorization: `Bearer ${process.env.META_WHATSAPP_ACCESS_TOKEN}`,
        'Content-Type': 'application/json',
      },
    }
  );
};

// Usage — send payment QR link to patient
export const sendPaymentWhatsApp = async (patientPhone: string, patientName: string, amount: string, qrLink: string) => {
  await sendWhatsAppTemplate(patientPhone, 'payment_request', [patientName, amount, qrLink]);
};
```

#### Email sender (`utils/mailer.ts`)
```typescript
import nodemailer from 'nodemailer';

const transporter = nodemailer.createTransport({
  service: 'gmail',
  auth: {
    user: process.env.GMAIL_USER,
    pass: process.env.GMAIL_APP_PASSWORD,
  },
});

export const sendEmail = async (options: {
  to: string;
  subject: string;
  html: string;
}) => {
  await transporter.sendMail({
    from: `"${process.env.GMAIL_FROM_NAME}" <${process.env.GMAIL_USER}>`,
    to: options.to,
    subject: options.subject,
    html: options.html,
  });
};

// Usage examples
export const sendOTPEmail = async (to: string, otp: string) => {
  await sendEmail({
    to,
    subject: 'Your OTP — HMS',
    html: `<p>Your OTP is <strong>${otp}</strong>. Valid for 5 minutes.</p>`,
  });
};

export const sendPaymentConfirmationEmail = async (to: string, patientName: string, amount: string) => {
  await sendEmail({
    to,
    subject: 'Payment Confirmed — HMS',
    html: `<p>Dear ${patientName}, your payment of ₹${amount} has been confirmed. You have been added to the queue.</p>`,
  });
};
```

---

### Updated Payment Flow (Online)

```
Old flow:
Patient → Razorpay checkout → webhook → auto mark paid → queue

New flow:
Admin → sends UPI QR / payment link via WhatsApp (Meta API)
Patient → pays via GPay / PhonePe / any UPI app
Patient → uploads payment screenshot inside app
Admin → reviews screenshot → manually marks as paid
System → adds patient to queue
```

---

### Files to Update Across the Project

| File | What to Change |
|------|---------------|
| `SETUP.md` | Replace `.env.example` block with updated one above |
| `PACKAGES.md` | Remove `razorpay`, `@sendgrid/mail`, `twilio` — add `nodemailer`, `axios` |
| `API-REFERENCE.md` | Remove `/payments/create-order`, `/payments/verify` endpoints |
| `HMS-PROJECT-PLAN.md` | Update Phase 4 payment section, remove Razorpay steps |
| `DATABASE-SCHEMA.md` | Remove `gateway`, `order_id`, `payment_id`, `signature` from payments table — add `screenshot_url`, `upi_ref` |
| `BUG-TRACKING.md` | Remove Razorpay debugging section |
| `SECURITY-RBAC.md` | Remove Razorpay webhook verification from security checklist |