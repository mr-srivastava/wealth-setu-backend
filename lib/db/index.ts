import { drizzle } from 'drizzle-orm/postgres-js';
import postgres from 'postgres';
import * as schema from './schema/index';

// Always use the Supabase pooler port (6543) for DATABASE_URL
// This avoids exhausting direct connection limits, especially in serverless/multi-process environments
const getDatabaseUrl = () => {
  return process.env.DATABASE_URL!;
};

// Create connection with proper configuration for Supabase
const client = postgres(getDatabaseUrl(), { 
  prepare: false, // Disable prepared statements for Supabase transaction pool mode
  max: 10, // Connection pool size
  idle_timeout: 20, // Use idle_timeout instead of timeout
  connect_timeout: 30, // Increase connection timeout
});

// Create drizzle instance with schema
export const db = drizzle(client, { schema });

// Export schema for type safety
export * from './schema/index'; 