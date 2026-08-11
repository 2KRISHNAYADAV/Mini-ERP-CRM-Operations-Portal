import fs from 'fs';
import path from 'path';
import { pool } from './db';

const initDb = async () => {
  console.log(' Initializing database schema...');
  const schemaPath = path.join(__dirname, '../schema.sql');
  const schemaSql = fs.readFileSync(schemaPath, 'utf8');

  try {
    // Run the schema queries
    await pool.query(schemaSql);
    console.log(' Database schema initialized successfully!');
  } catch (err: any) {
    console.error(' Failed to initialize schema:', err.message);
    process.exit(1);
  } finally {
    await pool.end();
  }
};

initDb();
