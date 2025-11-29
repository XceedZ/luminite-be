import { defineConfig } from "drizzle-kit";
import { config } from "dotenv";

// Load environment variables
config();

// Parse connection string if DATABASE_URL is provided
const getDbCredentials = () => {
  if (process.env.DATABASE_URL) {
    const url = new URL(process.env.DATABASE_URL);
    return {
      host: url.hostname,
      port: parseInt(url.port) || 5432,
      user: url.username,
      password: url.password,
      database: url.pathname.slice(1), // Remove leading '/'
      ssl: true, // Supabase requires SSL
    };
  }
  
  // Fallback to individual env vars
  return {
    host: process.env.DB_HOST!,
    port: process.env.DB_PORT ? parseInt(process.env.DB_PORT) : 5432,
    user: process.env.DB_USER!,
    password: process.env.DB_PASSWORD!,
    database: process.env.DB_NAME!,
    ssl: process.env.DB_SSL === 'true' || process.env.DB_HOST?.includes('supabase.co'),
  };
};

export default defineConfig({
  dialect: "postgresql",
  schema: "./src/db/schema.ts",
  out: "./drizzle",
  dbCredentials: getDbCredentials(),
});