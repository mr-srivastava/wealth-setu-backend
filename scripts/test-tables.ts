import { config } from 'dotenv';
import { db } from '../lib/db/index';
import { sql } from 'drizzle-orm';

// Load environment variables from .env.local
config({ path: '.env.local' });

async function testTables() {
  try {
    console.log('🔍 Testing database tables...');
    
    // Test if entity_types table exists
    console.log('📋 Testing entity_types table...');
    const entityTypes = await db.execute(sql`SELECT COUNT(*) FROM entity_types`);
    console.log('✅ entity_types table accessible');
    console.log('📊 Row count:', entityTypes);
    
    // Test if entities table exists
    console.log('📋 Testing entities table...');
    const entities = await db.execute(sql`SELECT COUNT(*) FROM entities`);
    console.log('✅ entities table accessible');
    console.log('📊 Row count:', entities);
    
    // Test if entity_transactions table exists
    console.log('📋 Testing entity_transactions table...');
    const entityTransactions = await db.execute(sql`SELECT COUNT(*) FROM entity_transactions`);
    console.log('✅ entity_transactions table accessible');
    console.log('📊 Row count:', entityTransactions);
    
  } catch (error) {
    console.error('❌ Table test failed:', error);
    
    if (error instanceof Error) {
      console.error('🔍 Error details:');
      console.error('- Message:', error.message);
      console.error('- Code:', (error as { code?: string }).code);
    }
  }
}

testTables(); 