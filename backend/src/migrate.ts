import fs from 'fs';
import path from 'path';
import { pool } from './db';

const runMigration = async () => {
  try {
    console.log(' Reading schema.sql...');
    const schemaPath = path.join(__dirname, '../schema.sql');
    const sql = fs.readFileSync(schemaPath, 'utf8');

    console.log(' Connecting to database and running schema...');
    await pool.query(sql);
    console.log('✅ Database schema applied successfully!');
  } catch (err: any) {
    console.error('❌ Migration failed:', err.message);
  } finally {
    await pool.end();
  }
};

runMigration();
