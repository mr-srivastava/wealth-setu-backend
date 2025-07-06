import { config } from 'dotenv';
import * as path from 'path';
import * as fs from 'fs';
import type { 
  EntityTypeWithRelations, 
  EntityWithRelations, 
  EntityTransactionWithRelations 
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

function processCSVData(csvPath: string) {
  console.log('📖 Processing CSV file...');
  const csvContent = fs.readFileSync(csvPath, 'utf-8');
  const lines = csvContent.split('\n');
  
  // Skip header
  const dataLines = lines.slice(1);
  
  const csvTransactions: Array<{
    entityName: string;
    entityType: string;
    month: string;
    amount: number;
    originalAmount: string;
    csvLine: string;
  }> = [];
  
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
      continue;
    }
    
    // Map entity name if needed
    const mappedEntityName = ENTITY_NAME_MAPPING[row.Source] || row.Source;
    
    const amount = parseAmount(row.Amount);
    if (amount > 0) {
      try {
        const month = parseMonth(row.Date);
        csvTransactions.push({
          entityName: mappedEntityName,
          entityType: mappedType,
          month,
          amount,
          originalAmount: row.Amount,
          csvLine: line
        });
      } catch (error) {
        // Skip invalid dates
      }
    }
  }
  
  return csvTransactions;
}

async function main() {
  try {
    console.log('🔍 Finding missing transactions...');
    
    const csvPath = path.join(process.cwd(), 'Finances v2 - Master Data.csv');
    
    if (!fs.existsSync(csvPath)) {
      console.error('❌ CSV file not found:', csvPath);
      process.exit(1);
    }
    
    // Process CSV data
    const csvTransactions = processCSVData(csvPath);
    
    // Fetch database data
    console.log('📥 Fetching database data...');
    const [entityTypes, entities, transactionsData] = await Promise.all([
      fetchData('/entity-types'),
      fetchData('/entities'),
      fetchData('/transactions')
    ]);
    
    if (!entityTypes || !entities || !transactionsData) {
      console.error('❌ Failed to fetch database data');
      return;
    }
    
    const { transactions } = transactionsData;
    
    // Create maps for quick lookup
    const entityMap = new Map<string, any>();
    entities.forEach((entity: EntityWithRelations) => {
      entityMap.set(entity.entity.name, entity);
    });
    
    const typeMap = new Map<string, any>();
    entityTypes.forEach((type: EntityTypeWithRelations) => {
      typeMap.set(type.name, type);
    });
    
    // Create a set of existing transactions for comparison
    const existingTransactions = new Set<string>();
    transactions.forEach((t: EntityTransactionWithRelations) => {
      const key = `${t.entity.name}|${t.transaction.month}|${t.transaction.amount}`;
      existingTransactions.add(key);
    });
    
    // Find missing transactions
    const missingTransactions: Array<{
      entityName: string;
      entityType: string;
      month: string;
      amount: number;
      originalAmount: string;
      csvLine: string;
    }> = [];
    
    csvTransactions.forEach(csvT => {
      const key = `${csvT.entityName}|${csvT.month}|${csvT.amount}`;
      if (!existingTransactions.has(key)) {
        missingTransactions.push(csvT);
      }
    });
    
    console.log(`\n📊 Missing Transactions Analysis:`);
    console.log(`   CSV Transactions: ${csvTransactions.length}`);
    console.log(`   Database Transactions: ${transactions.length}`);
    console.log(`   Missing Transactions: ${missingTransactions.length}`);
    
    if (missingTransactions.length === 0) {
      console.log('✅ No missing transactions found!');
      return;
    }
    
    console.log('\n🔍 Missing Transactions Details:');
    missingTransactions.forEach((t, index) => {
      console.log(`\n   ${index + 1}. ${t.entityName} (${t.entityType})`);
      console.log(`      Month: ${t.month}`);
      console.log(`      Amount: ${t.originalAmount} → ${t.amount}`);
      console.log(`      CSV Line: ${t.csvLine}`);
    });
    
    // Generate SQL queries
    console.log('\n📝 SQL Queries to Insert Missing Transactions:');
    console.log('-- Copy and paste these queries into your database:');
    console.log('');
    
    missingTransactions.forEach((t, index) => {
      const entity = entityMap.get(t.entityName);
      const type = typeMap.get(t.entityType);
      
      if (!entity) {
        console.log(`-- ⚠️  Entity "${t.entityName}" not found in database`);
        console.log(`-- You may need to create this entity first`);
        console.log('');
        return;
      }
      
      if (!type) {
        console.log(`-- ⚠️  Entity type "${t.entityType}" not found in database`);
        console.log('');
        return;
      }
      
      console.log(`-- ${index + 1}. ${t.entityName} - ${t.month} - ${t.originalAmount}`);
      console.log(`INSERT INTO "entityTransactions" ("entityId", "month", "amount", "createdAt", "updatedAt")`);
      console.log(`VALUES ('${entity.entity.id}', '${t.month}', '${t.amount}', NOW(), NOW());`);
      console.log('');
    });
    
    // Summary
    console.log('📋 Summary:');
    console.log(`   Total missing transactions: ${missingTransactions.length}`);
    const totalMissingAmount = missingTransactions.reduce((sum, t) => sum + t.amount, 0);
    console.log(`   Total missing amount: ₹${totalMissingAmount.toLocaleString('en-IN')}`);
    
    if (missingTransactions.length > 0) {
      console.log('\n💡 Next Steps:');
      console.log('   1. Copy the SQL queries above');
      console.log('   2. Run them in your database');
      console.log('   3. Re-run the verification script to confirm');
    }
    
    console.log('\n📊 Database Summary:');
    console.log('\n🏷️  Entity Types:');
    entityTypes.forEach((type: EntityTypeWithRelations) => {
      const typeEntities = entities.filter((e: EntityWithRelations) => e.entityType.name === type.name);
      const typeTransactions = transactions.filter((t: EntityTransactionWithRelations) => t.entityType.name === type.name);
      const total = typeTransactions.reduce((sum: number, t: EntityTransactionWithRelations) => sum + parseFloat(t.transaction.amount), 0);
      console.log(`   ${type.name}: ${typeEntities.length} entities, ${typeTransactions.length} transactions, ₹${total.toLocaleString('en-IN')}`);
    });

    console.log('\n📋 Sample Transactions:');
    transactions.slice(0, 5).forEach((t: EntityTransactionWithRelations) => {
      console.log(`   ${t.entity.name} (${t.entityType.name}): ₹${t.transaction.amount} - ${t.transaction.month}`);
    });
    
  } catch (error) {
    console.error('❌ Error:', error);
  }
}

main(); 