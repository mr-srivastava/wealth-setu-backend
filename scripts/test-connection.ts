import { config } from 'dotenv';
import postgres from 'postgres';

// Load environment variables from .env.local
config({ path: '.env.local' });

async function testConnection() {
  try {
    console.log('🔍 Testing database connection...');
    console.log('📡 DATABASE_URL:', process.env.DATABASE_URL ? 'Set' : 'Not set');
    
    if (!process.env.DATABASE_URL) {
      console.error('❌ DATABASE_URL not found in environment variables');
      return;
    }
    
    // Test basic connection
    const client = postgres(process.env.DATABASE_URL, { 
      prepare: false,
      max: 1,
      timeout: 10 // 10 second timeout
    });
    
    console.log('🔌 Attempting to connect...');
    const result = await client`SELECT 1 as test`;
    console.log('✅ Connection successful!');
    console.log('📊 Test query result:', result);
    
    await client.end();
    
  } catch (error) {
    console.error('❌ Connection failed:', error);
    
    if (error instanceof Error) {
      console.error('🔍 Error details:');
      console.error('- Message:', error.message);
      console.error('- Code:', (error as { code?: string }).code);
      console.error('- Cause:', error.cause);
    }
  }
}

testConnection(); 