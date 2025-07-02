import { pool } from './index';
import fs from 'fs';
import path from 'path';

async function setup() {
  const schemaPath = path.join(__dirname, '../../database/schema.sql');
  const schema = fs.readFileSync(schemaPath, 'utf-8');
  await pool.query(schema);
  console.log('База данных инициализирована!');
  process.exit(0);
}

setup().catch(e => {
  console.error(e);
  process.exit(1);
}); 