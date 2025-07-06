import { config } from 'dotenv';
config({ path: '.env.local' });

import { db } from '../lib/db/index';
import { entityTransactions, entities, entityTypes } from '../lib/db/schema/index';
import { eq } from 'drizzle-orm';

async function main() {
  try {
    console.log('🔍 Checking current database data...');
    
    // Get total count
    const allTransactions = await db.select().from(entityTransactions);
    console.log(`📊 Total transactions in database: ${allTransactions.length}`);
    
    // Get some sample transactions
    const sampleTransactions = allTransactions.slice(0, 10);
    console.log('\n📋 Sample transactions:');
    sampleTransactions.forEach(t => {
      console.log(`   Amount: ₹${t.amount} | Month: ${t.month} | Entity ID: ${t.entityId}`);
    });
    
    // Get entity details for sample transactions
    console.log('\n🏢 Entity details for sample transactions:');
    for (const transaction of sampleTransactions) {
      const entity = await db.select().from(entities).where(eq(entities.id, transaction.entityId)).limit(1);
      if (entity.length > 0) {
        const entityType = await db.select().from(entityTypes).where(eq(entityTypes.id, entity[0].typeId)).limit(1);
        console.log(`   ${entity[0].name} (${entityType[0]?.name || 'Unknown'}): ₹${transaction.amount}`);
      }
    }
    
    // Check amount ranges
    const amounts = allTransactions.map(t => parseFloat(t.amount));
    const maxAmount = Math.max(...amounts);
    const minAmount = Math.min(...amounts.filter(a => a > 0));
    const avgAmount = amounts.reduce((sum, a) => sum + a, 0) / amounts.length;
    const totalAmount = amounts.reduce((sum, a) => sum + a, 0);
    
    console.log('\n💰 Amount Statistics:');
    console.log(`   Total amount: ₹${totalAmount.toLocaleString('en-IN')}`);
    console.log(`   Average amount: ₹${avgAmount.toLocaleString('en-IN')}`);
    console.log(`   Maximum amount: ₹${maxAmount.toLocaleString('en-IN')}`);
    console.log(`   Minimum amount (non-zero): ₹${minAmount.toLocaleString('en-IN')}`);
    
    // Check if amounts seem reasonable
    if (maxAmount < 1000) {
      console.log('\n⚠️  WARNING: Maximum amount is very low. This suggests the data may be incorrect.');
      console.log('   Expected commission amounts should be in thousands or tens of thousands.');
    } else {
      console.log('\n✅ Amounts seem reasonable for commission data.');
    }
    
  } catch (error) {
    console.error('❌ Error checking data:', error);
  }
}

main(); 