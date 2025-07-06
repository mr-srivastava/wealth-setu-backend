import { config } from 'dotenv';
import * as path from 'path';
import * as fs from 'fs';
import type { EntityTransactionWithRelations } from '../lib/db/types';

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

interface CSVTransaction {
  entityName: string;
  entityType: string;
  month: string;
  amount: number;
  originalAmount: string;
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

function analyzeCSVData(csvPath: string) {
  console.log('📖 Analyzing CSV file...');
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
  }> = [];
  
  let totalLines = 0;
  let validLines = 0;
  let zeroAmountLines = 0;
  let errorLines = 0;
  let skippedLines = 0;
  
  for (const line of dataLines) {
    totalLines++;
    if (!line.trim()) {
      skippedLines++;
      continue;
    }
    
    const columns = parseCSVLine(line);
    if (columns.length < 6) {
      errorLines++;
      continue;
    }
    
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
      skippedLines++;
      continue;
    }
    
    // Skip rows with invalid dates (like the 1899-1900 entries)
    if (row.Date.includes('1899')) {
      skippedLines++;
      continue;
    }
    
    // Map CSV entity type to database entity type
    const mappedType = ENTITY_TYPE_MAPPING[row.Type];
    if (!mappedType) {
      console.warn(`⚠️  Unknown entity type: ${row.Type}`);
      skippedLines++;
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
          originalAmount: row.Amount
        });
        validLines++;
      } catch (error) {
        console.warn(`⚠️  Skipping invalid date: ${row.Date} for ${row.Source}`);
        errorLines++;
      }
    } else {
      zeroAmountLines++;
    }
  }
  
  console.log(`📊 CSV Analysis Summary:`);
  console.log(`   📄 Total lines: ${totalLines}`);
  console.log(`   ✅ Valid transactions: ${validLines}`);
  console.log(`   🚫 Zero amounts: ${zeroAmountLines}`);
  console.log(`   ❌ Errors: ${errorLines}`);
  console.log(`   ⏭️  Skipped: ${skippedLines}`);
  
  return csvTransactions;
}

async function main() {
  try {
    console.log('🔍 Starting comprehensive import verification...');
    
    const csvPath = path.join(process.cwd(), 'Finances v2 - Master Data.csv');
    
    if (!fs.existsSync(csvPath)) {
      console.error('❌ CSV file not found:', csvPath);
      process.exit(1);
    }
    
    // 1. Analyze CSV data
    const csvTransactions = analyzeCSVData(csvPath);
    
    // 2. Fetch database data
    console.log('\n📥 Fetching database data...');
    const [entityTypes, entities, transactionsData] = await Promise.all([
      fetchData('/entity-types'),
      fetchData('/entities'),
      fetchData('/transactions')
    ]);
    
    if (!entityTypes || !entities || !transactionsData) {
      console.error('❌ Failed to fetch database data');
      return;
    }
    
    const { transactions, stats } = transactionsData;
    
    // 3. Compare counts
    console.log('\n📊 Count Comparison:');
    console.log(`   CSV Valid Transactions: ${csvTransactions.length}`);
    console.log(`   Database Transactions: ${transactions.length}`);
    console.log(`   Difference: ${csvTransactions.length - transactions.length}`);
    
    if (csvTransactions.length === transactions.length) {
      console.log('✅ Transaction counts match!');
    } else {
      console.log('❌ Transaction counts do not match!');
    }
    
    // 4. Compare amounts
    console.log('\n💰 Amount Comparison:');
    const csvTotal = csvTransactions.reduce((sum, t) => sum + t.amount, 0);
    const dbTotal = stats?.totalAmount || 0;
    
    console.log(`   CSV Total Amount: ₹${csvTotal.toLocaleString('en-IN')}`);
    console.log(`   Database Total Amount: ₹${dbTotal.toLocaleString('en-IN')}`);
    console.log(`   Difference: ₹${(csvTotal - dbTotal).toLocaleString('en-IN')}`);
    
    const amountDiff = Math.abs(csvTotal - dbTotal);
    const amountDiffPercent = (amountDiff / csvTotal) * 100;
    
    if (amountDiffPercent < 0.01) {
      console.log('✅ Amount totals match (within 0.01% tolerance)!');
    } else {
      console.log(`❌ Amount totals differ by ${amountDiffPercent.toFixed(2)}%`);
    }
    
    // 5. Sample verification
    console.log('\n📋 Sample Verification (first 5 transactions):');
    for (let i = 0; i < Math.min(5, csvTransactions.length); i++) {
      const csvT = csvTransactions[i];
      const dbT = transactions[i];
      
      if (dbT) {
        const csvAmount = csvT.amount;
        const dbAmount = parseFloat(dbT.transaction.amount);
        const amountMatch = Math.abs(csvAmount - dbAmount) < 0.01;
        
        console.log(`   ${i + 1}. ${csvT.entityName}:`);
        console.log(`      CSV: ${csvT.originalAmount} → ${csvAmount}`);
        console.log(`      DB:  ${dbAmount}`);
        console.log(`      Match: ${amountMatch ? '✅' : '❌'}`);
      }
    }
    
    // 6. Entity type distribution
    console.log('\n🏷️  Entity Type Distribution:');
    const csvTypeCounts: { [key: string]: number } = {};
    const dbTypeCounts: { [key: string]: number } = {};
    
    csvTransactions.forEach(t => {
      csvTypeCounts[t.entityType] = (csvTypeCounts[t.entityType] || 0) + 1;
    });
    
    transactions.forEach((t: EntityTransactionWithRelations) => {
      const typeName = t.entityType.name;
      dbTypeCounts[typeName] = (dbTypeCounts[typeName] || 0) + 1;
    });
    
    Object.keys(csvTypeCounts).forEach(type => {
      const csvCount = csvTypeCounts[type];
      const dbCount = dbTypeCounts[type] || 0;
      const match = csvCount === dbCount;
      console.log(`   ${type}: CSV=${csvCount}, DB=${dbCount} ${match ? '✅' : '❌'}`);
    });
    
    // 7. Overall verification result
    console.log('\n🎯 Overall Verification Result:');
    const countMatch = csvTransactions.length === transactions.length;
    const amountMatch = amountDiffPercent < 0.01;
    
    if (countMatch && amountMatch) {
      console.log('✅ SUCCESS: Import verification passed!');
      console.log('   - Transaction counts match');
      console.log('   - Amount totals match');
      console.log('   - Data integrity confirmed');
    } else {
      console.log('❌ FAILED: Import verification failed!');
      if (!countMatch) console.log('   - Transaction counts do not match');
      if (!amountMatch) console.log('   - Amount totals do not match');
    }
    
  } catch (error) {
    console.error('❌ Error during verification:', error);
  }
}

main(); 