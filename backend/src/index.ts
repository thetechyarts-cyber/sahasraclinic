import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import morgan from 'morgan';
import rateLimit from 'express-rate-limit';
import { env } from './config/env';
import { logger } from './utils/logger';
import { errorHandler } from './middlewares/error-handler.middleware';
import { sendSuccess } from './utils/response';
import { supabase } from './config/supabase';

// Route imports
import authRoutes from './modules/auth/auth.routes';
import patientRoutes from './modules/patients/patient.routes';
import auditRoutes from './modules/audit/audit.routes';
import userRoutes from './modules/users/user.routes';
import roleRoutes from './modules/users/role.routes';
import caseSheetRoutes from './modules/case-sheets/case-sheet.routes';
import queueRoutes from './modules/queue/queue.routes';
import consultationRoutes from './modules/consultations/consultation.routes';
import prescriptionRoutes from './modules/prescriptions/prescription.routes';
import paymentRoutes from './modules/payments/payment.routes';
import prognosisRoutes from './modules/prognosis/prognosis.routes';
import cmsRoutes from './modules/cms/cms.routes';
import reportsRoutes from './modules/reports/reports.routes';
import settingsRoutes from './modules/settings/settings.routes';

const app = express();

// ─── Middleware Order (per CODING-RULES.md) ─────────────────────

// 1. Security headers
app.use(
  helmet({
    contentSecurityPolicy: {
      directives: {
        defaultSrc: ["'self'"],
        scriptSrc: ["'self'", 'https://checkout.razorpay.com'],
        frameSrc: ['https://api.razorpay.com'],
      },
    },
  }),
);

// 2. CORS
app.use(
  cors({
    origin: [env.APP_URL, 'https://yourhospital.com'],
    methods: ['GET', 'POST', 'PUT', 'DELETE'],
    allowedHeaders: ['Content-Type', 'Authorization'],
    credentials: true,
  }),
);

// 3. Body parser
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true }));

// 4. Request logging
app.use(
  morgan('combined', {
    stream: { write: (message: string) => logger.info(message.trim()) },
  }),
);

// 5. Rate limiting
const generalLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 1000,
  message: { success: false, error: 'Too many requests' },
});

const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 10,
  message: { success: false, error: 'Too many auth attempts' },
});

app.use('/api', generalLimiter);
app.use('/api/auth', authLimiter);

// ─── Health Check ───────────────────────────────────────────────

app.get('/api/health', async (_req, res) => {
  try {
    // Check database connectivity
    const { error } = await supabase.from('roles').select('id').limit(1);
    const dbStatus = error ? 'error' : 'ok';

    const checks = {
      server: 'ok' as const,
      database: dbStatus,
      timestamp: new Date().toISOString(),
    };

    const allOk = checks.database === 'ok';
    sendSuccess(res, checks, allOk ? 200 : 503);
  } catch {
    sendSuccess(res, { server: 'ok', database: 'error' }, 503);
  }
});

// ─── API Routes ─────────────────────────────────────────────────

app.use('/api/auth', authRoutes);
app.use('/api/patients', patientRoutes);
app.use('/api/audit-logs', auditRoutes);
app.use('/api/users', userRoutes);
app.use('/api/roles', roleRoutes);
app.use('/api/case-sheets', caseSheetRoutes);
app.use('/api/queue', queueRoutes);
app.use('/api/consultations', consultationRoutes);
app.use('/api/prescriptions', prescriptionRoutes);
app.use('/api/payments', paymentRoutes);
app.use('/api/prognosis', prognosisRoutes);
app.use('/api/cms', cmsRoutes);
app.use('/api/reports', reportsRoutes);
app.use('/api/settings', settingsRoutes);

// ─── 404 Handler ────────────────────────────────────────────────

app.use((_req, res) => {
  res.status(404).json({ success: false, error: 'Route not found' });
});

// ─── Global Error Handler ───────────────────────────────────────

app.use(errorHandler);

// ─── Server Start ───────────────────────────────────────────────

const PORT = parseInt(env.PORT, 10);

if (process.env.NODE_ENV !== 'test') {
  app.listen(PORT, () => {
    logger.info(`🏥 HMS Backend running on http://localhost:${PORT}`);
    logger.info(`📋 Health check: http://localhost:${PORT}/api/health`);
    logger.info(`🔧 Environment: ${env.NODE_ENV}`);
  });
}

export { app };
