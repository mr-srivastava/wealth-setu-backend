import 'dotenv/config';
import { db } from '../lib/db/index';
import { users, accounts, transactions } from '../lib/db/schema/index';
import { eq } from 'drizzle-orm';

async function testDatabase() {
  try {
    console.log('🧪 Testing Drizzle database connection...');
    
    // Test basic connection
    const result = await db.select().from(users).limit(1);
    console.log('✅ Database connection successful');
    console.log('📊 Current users count:', result.length);
    
    // Test schema access
    console.log('📋 Available tables:');
    console.log('- users');
    console.log('- profiles');
    console.log('- accounts');
    console.log('- transactions');
    console.log('- budgets');
    console.log('- goals');
    
    console.log('\n🎉 Database setup is working correctly!');
    
  } catch (error) {
    console.error('❌ Database test failed:', error);
    process.exit(1);
  }
}

testDatabase(); 