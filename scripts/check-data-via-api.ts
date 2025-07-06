import { config } from 'dotenv';
import type { 
  EntityTypeWithRelations, 
  EntityWithRelations, 
  EntityTransactionWithRelations,
  TransactionStats,
  CommissionStats,
  RecentCommissionsData
} from '../lib/db/types';
import { 
  safeValidateEntityTypeArray,
  safeValidateEntityArray,
  safeValidateTransactionsApiResponse
} from '../lib/validation';

config({ path: '.env.local' });

const API_BASE = 'http://localhost:3001/api/analytics';

async function fetchData<T>(endpoint: string): Promise<T | null> {
  try {
    const response = await fetch(`${API_BASE}${endpoint}`);
    if (!response.ok) {
      throw new Error(`HTTP ${response.status}: ${response.statusText}`);
    }
    return await response.json() as T;
  } catch (error) {
    console.error(`❌ Error fetching ${endpoint}:`, error);
    return null;
  }
}

async function main() {
  try {
    console.log('🔍 Checking data via API...');
    console.log(`📍 API Base: ${API_BASE}`);
    
    // Fetch all data with proper types and validation
    const [entityTypesData, entitiesData, transactionsData] = await Promise.all([
      fetchData<unknown>('/entity-types'),
      fetchData<unknown>('/entities'),
      fetchData<unknown>('/transactions')
    ]);
    
    if (!entityTypesData || !entitiesData || !transactionsData) {
      console.error('❌ Failed to fetch data from API');
      return;
    }

    // Validate the data using Zod schemas
    const entityTypes = safeValidateEntityTypeArray(entityTypesData);
    const entities = safeValidateEntityArray(entitiesData);
    const transactionsResponse = safeValidateTransactionsApiResponse(transactionsData);
    
    if (!entityTypes || !entities || !transactionsResponse) {
      console.error('❌ Data validation failed');
      return;
    }
    
    const { transactions, stats } = transactionsResponse;
    
    console.log(`📊 Data Summary:`);
    console.log(`   Entity Types: ${entityTypes.length}`);
    console.log(`   Entities: ${entities.length}`);
    console.log(`   Transactions: ${transactions.length}`);
    
    // Show sample transactions
    console.log('\n📋 Sample transactions:');
    transactions.slice(0, 5).forEach((t: EntityTransactionWithRelations) => {
      console.log(`   ${t.entity.name} (${t.entityType.name}): ₹${t.transaction.amount} - ${t.transaction.month}`);
    });
    
    // Show statistics
    if (stats) {
      console.log('\n💰 Statistics:');
      console.log(`   Total Amount: ₹${stats.totalAmount?.toLocaleString('en-IN') || 'N/A'}`);
      console.log(`   Transaction Count: ${stats.transactionCount || 0}`);
      console.log(`   Average Amount: ₹${stats.averageAmount?.toLocaleString('en-IN') || 'N/A'}`);
      console.log(`   Max Amount: ₹${stats.maxAmount?.toLocaleString('en-IN') || 'N/A'}`);
      console.log(`   Min Amount: ₹${stats.minAmount?.toLocaleString('en-IN') || 'N/A'}`);
      
      // Check if amounts seem reasonable
      if (stats.maxAmount && stats.maxAmount < 1000) {
        console.log('\n⚠️  WARNING: Maximum amount is very low. This suggests the data may be incorrect.');
        console.log('   Expected commission amounts should be in thousands or tens of thousands.');
      } else {
        console.log('\n✅ Amounts seem reasonable for commission data.');
      }
    }
    
    // Show entity types and their counts
    console.log('\n🏷️  Entity Types:');
    entityTypes.forEach((type: EntityTypeWithRelations) => {
      const count = entities.filter((e: EntityWithRelations) => e.entityType.name === type.name).length;
      console.log(`   ${type.name}: ${count} entities`);
    });
    
    // Show top entities by commission
    console.log('\n🏆 Top 5 Entities by Commission:');
    const entityTotals = entities.map((entity: EntityWithRelations) => {
      const entityTransactions = transactions.filter((t: EntityTransactionWithRelations) => t.transaction.entityId === entity.entity.id);
      const total = entityTransactions.reduce((sum: number, t: EntityTransactionWithRelations) => sum + parseFloat(t.transaction.amount), 0);
      return { entity, total };
    }).sort((a, b) => b.total - a.total);
    
    entityTotals.slice(0, 5).forEach((item, index: number) => {
      console.log(`   ${index + 1}. ${item.entity.entity.name}: ₹${item.total.toLocaleString('en-IN')}`);
    });
    
  } catch (error) {
    console.error('❌ Error:', error);
  }
}

main(); 