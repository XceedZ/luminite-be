import { drizzle } from 'drizzle-orm/postgres-js';
import postgres from 'postgres';
import * as schema from './schema';
import { config } from 'dotenv';

// Load environment variables
config();

// Supabase connection string format: postgresql://user:password@host:port/database
const connectionString = process.env.DATABASE_URL || 
  `postgresql://${process.env.DB_USER || 'postgres'}:${process.env.DB_PASSWORD || ''}@${process.env.DB_HOST || 'localhost'}:${process.env.DB_PORT || '5432'}/${process.env.DB_NAME || 'postgres'}`;

const queryClient = postgres(connectionString, {
  ssl: process.env.DB_SSL === 'true' || connectionString.includes('supabase.co') ? 'require' : false,
  max: 10, // Connection pool size
});

export const db = drizzle(queryClient, { schema });