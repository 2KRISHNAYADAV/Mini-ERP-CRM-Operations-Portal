import dotenv from 'dotenv';

dotenv.config();

export const env = {
  PORT: parseInt(process.env.PORT || '5000', 10),
  DATABASE_URL: process.env.DATABASE_URL || '',
  JWT_SECRET: process.env.JWT_SECRET || 'fallback_secret_change_me',
  NODE_ENV: process.env.NODE_ENV || 'development',
  JWT_EXPIRES_IN: '1d',
  FRONTEND_URL: process.env.FRONTEND_URL || '',
} as const;

if (!env.DATABASE_URL) {
  console.error('❌ DATABASE_URL is not set in .env');
  process.exit(1);
}

if (!process.env.JWT_SECRET) {
  console.warn('⚠️  JWT_SECRET is not set — using insecure fallback. Set it in .env!');
}
