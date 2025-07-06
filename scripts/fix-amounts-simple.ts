import { config } from 'dotenv';
import * as path from 'path';
import * as fs from 'fs';

// Load environment variables from .env.local
config({ path: '.env.local' });

import { db } from '../lib/db/index';
import { entityTransactions } from '../lib/db/schema/index';

function parseAmount(amountStr: string): number {
  if (!amountStr || amountStr.trim() === '') return 0;
  
  // Remove ₹ symbol, quotes, and commas, handle negative values
  let cleanAmount = amountStr.replace(/[₹,"]/g, '').trim();
  
  // Handle negative amounts (like "-₹31.43")
  const isNegative = cleanAmount.startsWith('-');
  if (isNegative) {
    cleanAmount = cleanAmount.substring(1);
  }
  
  if (cleanAmount === '' || cleanAmount === '0.00' || cleanAmount === '0' || cleanAmount === '0.0') {
    return 0;
  }
  
  const amount = parseFloat(cleanAmount);
  
  // Return 0 for NaN or very small amounts (less than 0.01)
  if (isNaN(amount) || amount < 0.01) {
    return 0;
  }
  
  return isNegative ? -amount : amount;
}

async function main() {
  try {
    console.log('🚀 Starting commission amount fix...');
    
    // Get all transactions
    const allTransactions = await db.select().from(entityTransactions);
    console.log(`📊 Found ${allTransactions.length} transactions to check`);
    
    let fixedCount = 0;
    let totalAmount = 0;
    
    for (const transaction of allTransactions) {
      const currentAmount = parseFloat(transaction.amount);
      
      // Check if the amount seems too small (less than 1000 for commission data)
      if (currentAmount < 1000 && currentAmount > 0) {
        console.log(`⚠️  Suspiciously small amount: ${transaction.amount} for transaction ${transaction.id}`);
        
        // You can add logic here to fix specific amounts if needed
        // For now, we'll just log them
      }
      
      totalAmount += currentAmount;
    }
    
    console.log(`📊 Total amount in database: ₹${totalAmount.toLocaleString('en-IN')}`);
    console.log(`📊 Average amount: ₹${(totalAmount / allTransactions.length).toLocaleString('en-IN')}`);
    
    // Show some sample transactions
    console.log('\n📋 Sample transactions:');
    allTransactions.slice(0, 5).forEach(t => {
      console.log(`   Transaction ${t.id}: ₹${t.amount} (${t.month})`);
    });
    
    console.log('\n✅ Commission amount check completed!');
    console.log('💡 If amounts seem too low, run the full fix script: npx tsx scripts/fix-commission-amounts.ts');
    
  } catch (error) {
    console.error('❌ Error during commission amount check:', error);
    process.exit(1);
  }
}

main(); 