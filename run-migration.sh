#!/bin/bash

# Run migration to Supabase
# This script will execute the SQL migration file directly to Supabase

DATABASE_URL="postgresql://postgres:lumi123@db.uydzmbzivxdcfefqdimx.supabase.co:5432/postgres"

echo "🔄 Running migration to Supabase..."

# Check if psql is available
if command -v psql &> /dev/null; then
    echo "Using psql..."
    PGPASSWORD=lumi123 psql "$DATABASE_URL" -f drizzle/0000_initial_users_table.sql
elif command -v bun &> /dev/null; then
    echo "Using bun to run migration..."
    # Create a simple migration runner
    cat > /tmp/run-migration.ts << 'EOF'
import postgres from 'postgres';
import { readFileSync } from 'fs';
import { join } from 'path';

const connectionString = process.env.DATABASE_URL || 
  'postgresql://postgres:lumi123@db.uydzmbzivxdcfefqdimx.supabase.co:5432/postgres';

const sql = postgres(connectionString, {
  ssl: 'require',
  max: 1
});

async function runMigration() {
  try {
    const migrationSQL = readFileSync(join(process.cwd(), 'drizzle/0000_initial_users_table.sql'), 'utf-8');
    console.log('📝 Executing migration...');
    await sql.unsafe(migrationSQL);
    console.log('✅ Migration completed successfully!');
    await sql.end();
  } catch (error: any) {
    console.error('❌ Migration failed:', error.message);
    await sql.end();
    process.exit(1);
  }
}

runMigration();
EOF
    bun run /tmp/run-migration.ts
else
    echo "❌ Neither psql nor bun found. Please install one of them."
    echo "Or manually run the SQL in drizzle/0000_initial_users_table.sql"
    exit 1
fi
