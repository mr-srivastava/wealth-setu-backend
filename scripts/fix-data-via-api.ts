import { config } from 'dotenv';
import * as path from 'path';
import * as fs from 'fs';
import type { 
  EntityTypeWithRelations, 
  EntityWithRelations 
} from '../lib/db/types';

config({ path: '.env.local' });

const API_BASE = 'http://localhost:3001/api/analytics';

interface CSVRow {
  Source: string;
  Type: string;
  Date: string;
  Amount: string;
  Month: string;
  'Financial Year': string;
}

interface ApiResponse {
  id: string;
  [key: string]: string | number | boolean | null;
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

// Simple CSV parser that handles quoted fields
function parseCSVLine(line: string): string[] {
  const result: string[] = [];
  let current = '';
  let inQuotes = false;
  
  for (let i = 0; i < line.length; i++) {
    const char = line[i];
    
    if (char === '"') {
      inQuotes = !inQuotes;
    } else if (char === ',' && !inQuotes) {
      result.push(current.trim());
      current = '';
    } else {
      current += char;
    }
  }
  
  // Add the last field
  result.push(current.trim());
  
  return result;
}

async function fetchData(endpoint: string) {
  try {
    const response = await fetch(`${API_BASE}${endpoint}`);
    if (!response.ok) {
      throw new Error(`HTTP ${response.status}: ${response.statusText}`);
    }
    return await response.json();
  } catch (error) {
    console.error(`❌ Error fetching ${endpoint}:`, error);
    return null;
  }
}

async function postData<T>(endpoint: string, data: Record<string, unknown>): Promise<T | null> {
  try {
    const response = await fetch(`${API_BASE}${endpoint}`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(data),
    });
    
    if (!response.ok) {
      throw new Error(`HTTP ${response.status}: ${response.statusText}`);
    }
    
    return await response.json() as T;
  } catch (error) {
    console.error(`❌ Error posting to ${endpoint}:`, error);
    return null;
  }
}

function processCSVData(csvPath: string): Array<{
  entityName: string;
  entityType: string;
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
    entityType: string;
    month: string;
    amount: number;
    originalAmount: string;
  }> = [];
  
  let processedCount = 0;
  let zeroAmountCount = 0;
  let errorCount = 0;
  
  for (const line of dataLines) {
    if (!line.trim()) continue;
    
    const columns = parseCSVLine(line);
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
          entityType: mappedType,
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
    }
  }
  
  console.log(`📊 CSV Processing Summary:`);
  console.log(`   ✅ Processed: ${processedCount} transactions`);
  console.log(`   🚫 Zero amounts: ${zeroAmountCount}`);
  console.log(`   ❌ Errors: ${errorCount}`);
  
  return transactions;
}

async function createEntityType(typeName: string) {
  console.log(`🏷️  Creating entity type: ${typeName}`);
  const result = await postData<ApiResponse>('/entity-types', { name: typeName });
  return result?.id;
}

async function createEntity(entityName: string, typeId: string) {
  console.log(`🏢 Creating entity: ${entityName}`);
  const result = await postData<ApiResponse>('/entities', { name: entityName, typeId });
  return result?.id;
}

async function createTransaction(entityId: string, month: string, amount: number) {
  const result = await postData<ApiResponse>('/entity-transactions', { 
    entityId, 
    month, 
    amount: amount.toString() 
  });
  return result;
}

async function main() {
  try {
    console.log('🚀 Starting commission data fix via API...');
    
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
    
    // Get existing data
    console.log('📥 Fetching existing data...');
    const [existingEntityTypes, existingEntities] = await Promise.all([
      fetchData('/entity-types'),
      fetchData('/entities')
    ]);
    
    if (!existingEntityTypes || !existingEntities) {
      console.error('❌ Failed to fetch existing data');
      return;
    }
    
    // Create entity types if they don't exist
    const typeMap = new Map<string, string>();
    for (const type of existingEntityTypes) {
      typeMap.set(type.name, type.id);
    }
    
    const uniqueTypes = [...new Set(transactions.map(t => t.entityType))];
    for (const typeName of uniqueTypes) {
      if (!typeMap.has(typeName)) {
        const typeId = await createEntityType(typeName);
        if (typeId) {
          typeMap.set(typeName, typeId);
        }
      }
    }
    
    // Create entities if they don't exist
    const entityMap = new Map<string, string>();
    for (const entity of existingEntities) {
      entityMap.set(entity.entity.name, entity.entity.id);
    }
    
    const uniqueEntities = [...new Set(transactions.map(t => ({ name: t.entityName, type: t.entityType })))];
    for (const { name, type } of uniqueEntities) {
      if (!entityMap.has(name)) {
        const typeId = typeMap.get(type);
        if (typeId) {
          const entityId = await createEntity(name, typeId);
          if (entityId) {
            entityMap.set(name, entityId);
          }
        }
      }
    }
    
    // Create transactions
    console.log('💰 Creating transactions...');
    let createdCount = 0;
    let skippedCount = 0;
    
    for (const transaction of transactions) {
      const entityId = entityMap.get(transaction.entityName);
      if (!entityId) {
        console.warn(`⚠️  Entity "${transaction.entityName}" not found`);
        skippedCount++;
        continue;
      }
      
      const result = await createTransaction(entityId, transaction.month, transaction.amount);
      if (result) {
        createdCount++;
        if (createdCount % 50 === 0) {
          console.log(`   Created ${createdCount} transactions...`);
        }
      } else {
        skippedCount++;
      }
    }
    
    console.log(`📊 Transaction Summary: ${createdCount} created, ${skippedCount} skipped`);
    
    // Show sample data for verification
    console.log('\n📋 Sample transactions:');
    transactions.slice(0, 5).forEach(t => {
      console.log(`   ${t.entityName}: ${t.originalAmount} → ${t.amount}`);
    });
    
    console.log('✅ Commission data fix completed successfully!');
    
  } catch (error) {
    console.error('❌ Error during commission data fix:', error);
    process.exit(1);
  }
}

main(); 