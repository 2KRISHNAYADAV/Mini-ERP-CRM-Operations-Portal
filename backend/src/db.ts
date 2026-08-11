import { Pool } from 'pg';
import { env } from './config/env';

// Bypass self-signed certificate verification
process.env.NODE_TLS_REJECT_UNAUTHORIZED = '0';

export const pool = new Pool({
  connectionString: env.DATABASE_URL,
  ssl: { rejectUnauthorized: false },
  max: 20,
  idleTimeoutMillis: 30000,
  connectionTimeoutMillis: 2000,
});

pool.on('error', (err) => {
  console.error('❌ Unexpected database error:', err.message);
});

export const query = (text: string, params?: any[]) =>
  pool.query(text, params);

// Test connection on startup
export const testConnection = async () => {
  try {
    const client = await pool.connect();
    const result = await client.query('SELECT NOW()');
    client.release();
    console.log(`✅ Database connected at ${result.rows[0].now}`);
  } catch (err: any) {
    console.error('❌ Database connection failed:', err.message);
    process.exit(1);
  }
};
