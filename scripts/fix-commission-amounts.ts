import { config } from 'dotenv';
import * as path from 'path';
import * as fs from 'fs';

// Load environment variables from .env.local
config({ path: '.env.local' });

import { db } from '../lib/db/index';
import { entityTypes, entities, entityTransactions } from '../lib/db/schema/index';
import { eq } from 'drizzle-orm';

interface CSVRow {
  Source: string;
  Type: string;
  Date: string;
  Amount: string;
  Month: string;
  'Financial Year': string;
}

// Mapping from CSV entity types to database entity types
const ENTITY_TYPE_MAPPING: { [key: string]: string } = {
  'Mutual Fund': 'Mutual Funds',
  'Life Insurance': 'Life Insurance',
  'Health Insurance': 'Health Insurance',
  'General Insurance': 'General Insurance'
};

// Mapping from CSV entity names to database entity names
const ENTITY_NAME_MAPPING: { [key: string]: string } = {
  'ICICI Mutual Fund': 'ICICI Mutual Funds',
  'Kotak': 'Kotak Mutual Funds',
  'LIC': 'L.I.C.',
  // Add more mappings as needed
};

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

function parseMonth(dateStr: string): string {
  // Convert "Apr/2018" to "2018-04-01"
  const [month, year] = dateStr.split('/');
  const monthMap: { [key: string]: string } = {
    'Jan': '01', 'Feb': '02', 'Mar': '03', 'Apr': '04',
    'May': '05', 'Jun': '06', 'Jul': '07', 'Aug': '08',
    'Sep': '09', 'Oct': '10', 'Nov': '11', 'Dec': '12'
  };
  
  const monthNum = monthMap[month];
  if (!monthNum) {
    throw new Error(`Invalid month: ${month}`);
  }
  
  return `${year}-${monthNum}-01`;
}

function processCSVData(csvPath: string): Array<{
  entityName: string;
  month: string;
  amount: number;
  originalAmount: string;
}> {
  console.log('📖 Reading CSV file...');
  const csvContent = fs.readFileSync(csvPath, 'utf-8');
  const lines = csvContent.split('\n');
  
  // Skip header
  const dataLines = lines.slice(1);
  
  const transactions: Array<{
    entityName: string;
    month: string;
    amount: number;
    originalAmount: string;
  }> = [];
  
  let processedCount = 0;
  let zeroAmountCount = 0;
  let errorCount = 0;
  
  for (const line of dataLines) {
    if (!line.trim()) continue;
    
    const columns = line.split(',');
    if (columns.length < 6) continue;
    
    const row: CSVRow = {
      Source: columns[0]?.trim() || '',
      Type: columns[1]?.trim() || '',
      Date: columns[2]?.trim() || '',
      Amount: columns[3]?.trim() || '',
      Month: columns[4]?.trim() || '',
      'Financial Year': columns[5]?.trim() || ''
    };
    
    // Skip empty or invalid rows
    if (!row.Source || !row.Type || !row.Date || row.Source === '') {
      continue;
    }
    
    // Skip rows with invalid dates (like the 1899-1900 entries)
    if (row.Date.includes('1899')) {
      continue;
    }
    
    // Map CSV entity type to database entity type
    const mappedType = ENTITY_TYPE_MAPPING[row.Type];
    if (!mappedType) {
      console.warn(`⚠️  Unknown entity type: ${row.Type}`);
      continue;
    }
    
    // Map entity name if needed
    const mappedEntityName = ENTITY_NAME_MAPPING[row.Source] || row.Source;
    
    const amount = parseAmount(row.Amount);
    if (amount > 0) { // Only add non-zero transactions
      try {
        const month = parseMonth(row.Date);
        transactions.push({
          entityName: mappedEntityName,
          month,
          amount,
          originalAmount: row.Amount
        });
        processedCount++;
      } catch (error) {
        console.warn(`⚠️  Skipping invalid date: ${row.Date} for ${row.Source}`);
        errorCount++;
      }
    } else {
      zeroAmountCount++;
      console.log(`💰 Zero amount: ${row.Amount} for ${row.Source} in ${row.Date}`);
    }
  }
  
  console.log(`📊 CSV Processing Summary:`);
  console.log(`   ✅ Processed: ${processedCount} transactions`);
  console.log(`   🚫 Zero amounts: ${zeroAmountCount}`);
  console.log(`   ❌ Errors: ${errorCount}`);
  
  return transactions;
}

async function clearExistingData(): Promise<void> {
  console.log('🗑️  Clearing existing data...');
  
  // Delete all entity transactions
  await db.delete(entityTransactions);
  console.log('✅ Deleted all entity transactions');
  
  // Delete all entities
  await db.delete(entities);
  console.log('✅ Deleted all entities');
  
  // Delete all entity types
  await db.delete(entityTypes);
  console.log('✅ Deleted all entity types');
}

async function createEntityTypes(): Promise<Map<string, string>> {
  console.log('🏷️  Creating entity types...');
  const typeMap = new Map<string, string>();
  
  const types = ['Mutual Funds', 'Life Insurance', 'Health Insurance', 'General Insurance'];
  
  for (const typeName of types) {
    const [newType] = await db
      .insert(entityTypes)
      .values({ name: typeName })
      .returning();
    
    typeMap.set(typeName, newType.id);
    console.log(`✅ Created entity type: "${typeName}" (${newType.id})`);
  }
  
  return typeMap;
}

async function createEntities(
  transactions: Array<{ entityName: string; month: string; amount: number; originalAmount: string }>,
  typeMap: Map<string, string>
): Promise<Map<string, string>> {
  console.log('🏢 Creating entities...');
  const entityMap = new Map<string, string>();
  
  // Get unique entities from transactions
  const uniqueEntities = new Map<string, string>();
  
  for (const transaction of transactions) {
    // Determine entity type based on the transaction data
    // This is a simplified approach - you might want to enhance this logic
    let entityType = 'Mutual Funds'; // default
    
    // You can add logic here to determine the correct type based on entity name
    // For now, we'll use the default
    
    uniqueEntities.set(transaction.entityName, entityType);
  }
  
  for (const [entityName, typeName] of uniqueEntities) {
    const typeId = typeMap.get(typeName);
    if (!typeId) {
      console.warn(`⚠️  Type "${typeName}" not found for entity "${entityName}"`);
      continue;
    }
    
    const [newEntity] = await db
      .insert(entities)
      .values({ name: entityName, typeId })
      .returning();
    
    entityMap.set(entityName, newEntity.id);
    console.log(`✅ Created entity: "${entityName}" (${typeName})`);
  }
  
  return entityMap;
}

async function createEntityTransactions(
  transactions: Array<{ entityName: string; month: string; amount: number; originalAmount: string }>,
  entityMap: Map<string, string>
): Promise<void> {
  console.log('💰 Creating entity transactions...');
  
  let createdCount = 0;
  let skippedCount = 0;
  
  for (const transaction of transactions) {
    const entityId = entityMap.get(transaction.entityName);
    if (!entityId) {
      console.warn(`⚠️  Entity "${transaction.entityName}" not found`);
      skippedCount++;
      continue;
    }
    
    await db
      .insert(entityTransactions)
      .values({
        entityId,
        month: transaction.month,
        amount: transaction.amount.toString()
      });
    
    createdCount++;
    
    if (createdCount % 100 === 0) {
      console.log(`   Created ${createdCount} transactions...`);
    }
  }
  
  console.log(`📊 Transaction Summary: ${createdCount} created, ${skippedCount} skipped`);
}

async function main() {
  try {
    console.log('🚀 Starting commission data fix...');
    
    const csvPath = path.join(process.cwd(), 'Finances v2 - Master Data.csv');
    
    if (!fs.existsSync(csvPath)) {
      console.error('❌ CSV file not found:', csvPath);
      process.exit(1);
    }
    
    // Process CSV data
    const transactions = processCSVData(csvPath);
    
    if (transactions.length === 0) {
      console.error('❌ No valid transactions found in CSV');
      process.exit(1);
    }
    
    // Clear existing data
    await clearExistingData();
    
    // Create entity types
    const typeMap = await createEntityTypes();
    
    // Create entities
    const entityMap = await createEntities(transactions, typeMap);
    
    // Create transactions
    await createEntityTransactions(transactions, entityMap);
    
    console.log('✅ Commission data fix completed successfully!');
    
    // Show some sample data for verification
    console.log('\n📋 Sample transactions:');
    transactions.slice(0, 5).forEach(t => {
      console.log(`   ${t.entityName}: ${t.originalAmount} → ${t.amount}`);
    });
    
  } catch (error) {
    console.error('❌ Error during commission data fix:', error);
    process.exit(1);
  }
}

main(); 