import * as path from 'path';
import * as fs from 'fs';

interface CSVRow {
  Source: string;
  Type: string;
  Date: string;
  Amount: string;
  Month: string;
  'Financial Year': string;
}

function parseAmount(amountStr: string): number {
  if (!amountStr || amountStr.trim() === '') return 0;
  
  console.log(`🔍 Parsing amount: "${amountStr}"`);
  
  // Remove ₹ symbol, quotes, and commas, handle negative values
  let cleanAmount = amountStr.replace(/[₹,"]/g, '').trim();
  console.log(`   After removing symbols: "${cleanAmount}"`);
  
  // Handle negative amounts (like "-₹31.43")
  const isNegative = cleanAmount.startsWith('-');
  if (isNegative) {
    cleanAmount = cleanAmount.substring(1);
    console.log(`   After handling negative: "${cleanAmount}"`);
  }
  
  if (cleanAmount === '' || cleanAmount === '0.00' || cleanAmount === '0' || cleanAmount === '0.0') {
    console.log(`   Result: 0 (empty/zero)`);
    return 0;
  }
  
  const amount = parseFloat(cleanAmount);
  console.log(`   Parsed as float: ${amount}`);
  
  // Return 0 for NaN or very small amounts (less than 0.01)
  if (isNaN(amount) || amount < 0.01) {
    console.log(`   Result: 0 (NaN or too small)`);
    return 0;
  }
  
  const result = isNegative ? -amount : amount;
  console.log(`   Final result: ${result}`);
  return result;
}

function processCSVData(csvPath: string) {
  console.log('📖 Reading CSV file...');
  const csvContent = fs.readFileSync(csvPath, 'utf-8');
  const lines = csvContent.split('\n');
  
  // Skip header
  const dataLines = lines.slice(1);
  
  console.log(`📊 Total lines: ${dataLines.length}`);
  
  // Look at first few lines
  for (let i = 0; i < 5; i++) {
    const line = dataLines[i];
    if (!line.trim()) continue;
    
    console.log(`\n📝 Line ${i + 1}: "${line}"`);
    
    const columns = line.split(',');
    console.log(`   Split into ${columns.length} columns:`);
    columns.forEach((col, idx) => {
      console.log(`     [${idx}]: "${col}"`);
    });
    
    if (columns.length >= 4) {
      const row: CSVRow = {
        Source: columns[0]?.trim() || '',
        Type: columns[1]?.trim() || '',
        Date: columns[2]?.trim() || '',
        Amount: columns[3]?.trim() || '',
        Month: columns[4]?.trim() || '',
        'Financial Year': columns[5]?.trim() || ''
      };
      
      console.log(`   Parsed row:`);
      console.log(`     Source: "${row.Source}"`);
      console.log(`     Type: "${row.Type}"`);
      console.log(`     Date: "${row.Date}"`);
      console.log(`     Amount: "${row.Amount}"`);
      console.log(`     Month: "${row.Month}"`);
      console.log(`     Financial Year: "${row['Financial Year']}"`);
      
      // Parse amount
      const amount = parseAmount(row.Amount);
      console.log(`   Parsed amount: ${amount}`);
    }
  }
  
  // Look for specific problematic lines
  console.log('\n🔍 Looking for ICICI Mutual Fund entries...');
  for (let i = 0; i < dataLines.length; i++) {
    const line = dataLines[i];
    if (line.includes('ICICI Mutual Fund')) {
      console.log(`\n📝 ICICI line ${i + 1}: "${line}"`);
      const columns = line.split(',');
      if (columns.length >= 4) {
        console.log(`   Amount column: "${columns[3]}"`);
        const amount = parseAmount(columns[3]);
        console.log(`   Parsed amount: ${amount}`);
      }
      break;
    }
  }
}

async function main() {
  try {
    console.log('🚀 Starting CSV parsing debug...');
    
    const csvPath = path.join(process.cwd(), 'Finances v2 - Master Data.csv');
    
    if (!fs.existsSync(csvPath)) {
      console.error('❌ CSV file not found:', csvPath);
      process.exit(1);
    }
    
    processCSVData(csvPath);
    
  } catch (error) {
    console.error('❌ Error:', error);
  }
}

main(); 