// Re-export types from the database schema
export type {
  EntityTypeWithRelations as EntityType,
  EntityWithRelations as Entity,
  EntityTransactionWithRelations as EntityTransaction,
  TransactionStats,
  CommissionStats,
  EntityTypeTotal,
  RecentCommissionsData
} from '../../lib/db/types';

export const formatCurrency = (amount: number | string) => {
  const num = typeof amount === 'string' ? parseFloat(amount) : amount;
  return new Intl.NumberFormat('en-IN', {
    style: 'currency',
    currency: 'INR',
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(num);
}; 