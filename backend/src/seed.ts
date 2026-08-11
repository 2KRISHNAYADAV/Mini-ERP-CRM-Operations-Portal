/**
 * Seed script — run once to create demo users in Supabase
 * Usage: npx tsx src/seed.ts
 */
import bcrypt from 'bcryptjs';
import { pool } from './db';

const SALT_ROUNDS = 10;

const users = [
  { name: 'Admin User',      email: 'admin@test.com',     password: 'password123', role: 'Admin'     },
  { name: 'Sales User',      email: 'sales@test.com',     password: 'password123', role: 'Sales'     },
  { name: 'Warehouse User',  email: 'warehouse@test.com', password: 'password123', role: 'Warehouse' },
  { name: 'Accounts User',   email: 'accounts@test.com',  password: 'password123', role: 'Accounts'  },
];

const seed = async () => {
  console.log(' Seeding demo users...');
  for (const user of users) {
    const hash = await bcrypt.hash(user.password, SALT_ROUNDS);
    await pool.query(
      `INSERT INTO users (name, email, password_hash, role)
       VALUES ($1, $2, $3, $4)
       ON CONFLICT (email) DO UPDATE SET password_hash = $3`,
      [user.name, user.email, hash, user.role]
    );
    console.log(`   ${user.role}: ${user.email}`);
  }
  console.log(' Seeding complete!');
  await pool.end();
};

seed().catch((err) => {
  console.error(' Seeding failed:', err.message);
  process.exit(1);
});
