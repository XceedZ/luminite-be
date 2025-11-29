/**
 * Migration Script untuk Supabase
 * Jalankan dengan: bun run migrate-to-supabase.ts
 */

import postgres from 'postgres';
import { readFileSync } from 'fs';
import { join } from 'path';
import { config } from 'dotenv';

// Load .env file
config();

// Try transaction pooler first, then fallback to direct connection
const poolerUrl = process.env.DATABASE_POOLER_URL || 
  'postgresql://postgres.uydzmbzivxdcfefqdimx:lumi123@aws-1-ap-south-1.pooler.supabase.com:6543/postgres';
const directUrl = process.env.DATABASE_URL?.replace(/^["']|["']$/g, '') || 
  'postgresql://postgres:lumi123@db.uydzmbzivxdcfefqdimx.supabase.co:5432/postgres';

// Remove placeholder and use pooler URL
const connectionString = poolerUrl.replace('[YOUR-PASSWORD]', 'lumi123').replace('[YOUR_PASSWORD]', 'lumi123');

const sql = postgres(connectionString, {
  ssl: 'require',
  max: 1,
  idle_timeout: 20,
  connect_timeout: 10
});

async function runMigration() {
  try {
    console.log('🔄 Connecting to Supabase...');
    
    // Read migration file
    const migrationSQL = readFileSync(join(process.cwd(), 'drizzle/0000_initial_users_table.sql'), 'utf-8');
    
    console.log('📝 Executing migration...');
    await sql.unsafe(migrationSQL);
    
    console.log('✅ Migration completed successfully!');
    console.log('📊 Table "users" created with username field');
    
    await sql.end();
    process.exit(0);
  } catch (error: any) {
    console.error('❌ Migration failed:', error.message);
    if (error.code === '42P07') {
      console.log('ℹ️  Table already exists. Skipping...');
    } else {
      console.error('Full error:', error);
    }
    await sql.end();
    process.exit(1);
  }
}

runMigration();
