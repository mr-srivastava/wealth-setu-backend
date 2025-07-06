import { config } from 'dotenv';
import * as path from 'path';
import * as fs from 'fs';

// Load environment variables from .env.local
config({ path: '.env.local' });

import { db } from '../lib/db/index';
import { entityTypes, entities, entityTransactions } from '../lib/db/schema/index';
import { eq, and } from 'drizzle-orm';

interface CSVRow {
  Source: string;
  Type: string;
  Date: string;
  Amount: string;
  Month: string;
  'Financial Year': string;
}

interface ProcessedData {
  entityTypes: Set<string>;
  entities: Map<string, string>; // entityName -> entityType
  transactions: Array<{
    entityName: string;
    month: string;
    amount: number;
  }>;
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

function processCSVData(csvPath: string): ProcessedData {
  console.log('📖 Reading CSV file...');
  const csvContent = fs.readFileSync(csvPath, 'utf-8');
  const lines = csvContent.split('\n');
  
  // Skip header
  const dataLines = lines.slice(1);
  
  const entityTypes = new Set<string>();
  const entities = new Map<string, string>();
  const transactions: Array<{
    entityName: string;
    month: string;
    amount: number;
  }> = [];
  
  let zeroAmountCount = 0;
  
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
    
    entityTypes.add(mappedType);
    
    // Map entity name if needed
    const mappedEntityName = ENTITY_NAME_MAPPING[row.Source] || row.Source;
    entities.set(mappedEntityName, mappedType);
    
    const amount = parseAmount(row.Amount);
    if (amount > 0) { // Only add non-zero transactions
      try {
        const month = parseMonth(row.Date);
        transactions.push({
          entityName: mappedEntityName,
          month,
          amount
        });
      } catch (error) {
        console.warn(`⚠️  Skipping invalid date: ${row.Date} for ${row.Source}`);
      }
    } else {
      zeroAmountCount++;
    }
  }
  
  console.log(`🚫 Filtered out ${zeroAmountCount} zero-amount transactions during CSV processing`);
  return { entityTypes, entities, transactions };
}

async function getExistingEntityTypes(): Promise<Map<string, string>> {
  console.log('🏷️  Fetching existing entity types...');
  const existingTypes = await db.select().from(entityTypes);
  const typeMap = new Map<string, string>();
  
  for (const type of existingTypes) {
    typeMap.set(type.name, type.id);
    console.log(`✅ Found entity type: "${type.name}" (${type.id})`);
  }
  
  return typeMap;
}

async function createEntities(
  entityData: Map<string, string>,
  typeMap: Map<string, string>
): Promise<Map<string, string>> {
  console.log('🏢 Processing entities...');
  const entityMap = new Map<string, string>();
  
  let createdCount = 0;
  let existingCount = 0;
  
  for (const [entityName, typeName] of entityData) {
    const typeId = typeMap.get(typeName);
    if (!typeId) {
      console.warn(`⚠️  Type "${typeName}" not found for entity "${entityName}"`);
      continue;
    }
    
    // Check if entity already exists
    const existing = await db
      .select()
      .from(entities)
      .where(eq(entities.name, entityName))
      .limit(1);
    
    if (existing.length > 0) {
      entityMap.set(entityName, existing[0].id);
      existingCount++;
      console.log(`✅ Entity "${entityName}" already exists`);
    } else {
      const [newEntity] = await db
        .insert(entities)
        .values({ name: entityName, typeId })
        .returning();
      
      entityMap.set(entityName, newEntity.id);
      createdCount++;
      console.log(`✅ Created entity: "${entityName}" (${typeName})`);
    }
  }
  
  console.log(`📊 Entities summary: ${createdCount} created, ${existingCount} already existed`);
  return entityMap;
}

async function createEntityTransactions(
  transactions: Array<{ entityName: string; month: string; amount: number }>,
  entityMap: Map<string, string>
): Promise<void> {
  console.log('💰 Creating entity transactions...');
  
  let createdCount = 0;
  let skippedCount = 0;
  let zeroAmountCount = 0;
  
  for (const transaction of transactions) {
    // Additional validation to ensure no zero-amount transactions are created
    if (transaction.amount <= 0) {
      zeroAmountCount++;
      continue;
    }
    
    const entityId = entityMap.get(transaction.entityName);
    if (!entityId) {
      console.warn(`⚠️  Entity "${transaction.entityName}" not found`);
      skippedCount++;
      continue;
    }
    
    // Check if transaction already exists
    const existing = await db
      .select()
      .from(entityTransactions)
      .where(
        and(
          eq(entityTransactions.entityId, entityId),
          eq(entityTransactions.month, transaction.month)
        )
      )
      .limit(1);
    
    if (existing.length > 0) {
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
      console.log(`📊 Created ${createdCount} transactions...`);
    }
  }
  
  console.log(`✅ Created ${createdCount} new transactions`);
  console.log(`⏭️  Skipped ${skippedCount} existing transactions`);
  console.log(`🚫 Filtered out ${zeroAmountCount} zero-amount transactions`);
}

async function main() {
  try {
    console.log('🚀 Starting financial data import...');
    
    const csvPath = path.join(process.cwd(), 'Finances v2 - Master Data.csv');
    
    if (!fs.existsSync(csvPath)) {
      throw new Error(`CSV file not found at: ${csvPath}`);
    }
    
    // Process CSV data
    const { entityTypes: typeSet, entities: entityData, transactions } = processCSVData(csvPath);
    
    console.log(`📊 Found ${typeSet.size} entity types in CSV`);
    console.log(`🏢 Found ${entityData.size} entities in CSV`);
    console.log(`💰 Found ${transactions.length} transactions in CSV`);
    
    // Get existing entity types
    const typeMap = await getExistingEntityTypes();
    
    // Verify all required entity types exist
    for (const typeName of typeSet) {
      if (!typeMap.has(typeName)) {
        console.warn(`⚠️  Entity type "${typeName}" not found in database`);
      }
    }
    
    // Create entities
    const entityMap = await createEntities(entityData, typeMap);
    
    // Create entity transactions
    await createEntityTransactions(transactions, entityMap);
    
    console.log('\n🎉 Financial data import completed successfully!');
    
    // Print summary
    console.log('\n📋 Summary:');
    console.log(`- Entity Types in CSV: ${typeSet.size}`);
    console.log(`- Entities in CSV: ${entityData.size}`);
    console.log(`- Transactions in CSV: ${transactions.length}`);
    console.log(`- Entities in Database: ${entityMap.size}`);
    
  } catch (error) {
    console.error('❌ Import failed:', error);
    process.exit(1);
  }
}

main(); 