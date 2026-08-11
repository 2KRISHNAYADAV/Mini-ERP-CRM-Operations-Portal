import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import morgan from 'morgan';
import rateLimit from 'express-rate-limit';
import dotenv from 'dotenv';
import { env } from './config/env';
import { testConnection } from './db';
import router from './routes';
import { errorHandler, notFound } from './middleware/errorHandler';

dotenv.config();

const app = express();

// ─── Security Middleware ──────────────────────────────────────────────────────
app.use(helmet());

// Removed unused allowedOrigins

app.use(cors({
  origin: (origin, callback) => {
    // Allow requests with no origin (curl, Postman, Render health checks)
    if (!origin) return callback(null, true);
    
    // Allow any localhost / 127.0.0.1 for local development
    if (origin.startsWith('http://localhost:') || origin.startsWith('http://127.0.0.1:')) {
      return callback(null, true);
    }
    
    // Allow explicit prod origins
    if (env.FRONTEND_URL && origin === env.FRONTEND_URL) {
      return callback(null, true);
    }

    callback(new Error(`CORS: origin '${origin}' is not allowed`));
  },
  credentials: true,
}));

// ─── Rate Limiting ────────────────────────────────────────────────────────────
const limiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 200,
  message: { error: 'Too many requests, please try again later.' },
});
app.use('/api', limiter);

// ─── Request Parsing ──────────────────────────────────────────────────────────
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true }));

// ─── Logging ──────────────────────────────────────────────────────────────────
if (env.NODE_ENV === 'development') {
  app.use(morgan('dev'));
}

// ─── Root Health Check ────────────────────────────────────────────────────────
app.get('/', (_req, res) => {
  res.json({
    name: 'Mini ERP + CRM API',
    status: 'running',
    environment: env.NODE_ENV || 'development',
    timestamp: new Date().toISOString()
  });
});

// ─── API Routes ───────────────────────────────────────────────────────────────
app.use('/api', router);

// ─── 404 & Error Handling ────────────────────────────────────────────────────
app.use(notFound);
app.use(errorHandler);

// ─── Start Server ─────────────────────────────────────────────────────────────
const start = async () => {
  await testConnection();
  app.listen(env.PORT, () => {
    console.log(` Server running on http://localhost:${env.PORT}`);
    console.log(` Environment: ${env.NODE_ENV}`);
  });
};

start();
