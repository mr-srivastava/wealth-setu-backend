import type { InferSelectModel, InferInsertModel } from 'drizzle-orm';
import { 
  users, 
  profiles, 
  accounts, 
  transactions, 
  budgets, 
  goals,
  entityTypes,
  entities,
  entityTransactions
} from './schema';

// Database schema types (inferred from Drizzle)
export type User = InferSelectModel<typeof users>;
export type UserInsert = InferInsertModel<typeof users>;
export type Profile = InferSelectModel<typeof profiles>;
export type ProfileInsert = InferInsertModel<typeof profiles>;
export type Account = InferSelectModel<typeof accounts>;
export type AccountInsert = InferInsertModel<typeof accounts>;
export type Transaction = InferSelectModel<typeof transactions>;
export type TransactionInsert = InferInsertModel<typeof transactions>;
export type Budget = InferSelectModel<typeof budgets>;
export type BudgetInsert = InferInsertModel<typeof budgets>;
export type Goal = InferSelectModel<typeof goals>;
export type GoalInsert = InferInsertModel<typeof goals>;
export type EntityType = InferSelectModel<typeof entityTypes>;
export type EntityTypeInsert = InferInsertModel<typeof entityTypes>;
export type Entity = InferSelectModel<typeof entities>;
export type EntityInsert = InferInsertModel<typeof entities>;
export type EntityTransaction = InferSelectModel<typeof entityTransactions>;
export type EntityTransactionInsert = InferInsertModel<typeof entityTransactions>;

// Re-export Zod-inferred types for runtime validation
export type {
  User as ZodUser,
  Profile as ZodProfile,
  Account as ZodAccount,
  Transaction as ZodTransaction,
  Budget as ZodBudget,
  Goal as ZodGoal,
  EntityType as ZodEntityType,
  Entity as ZodEntity,
  EntityTransaction as ZodEntityTransaction,
  EntityWithRelations,
  EntityTransactionWithRelations,
  TransactionStats,
  CommissionStats,
  CommissionStatsByPeriod,
  EntityTypeTotal,
  RecentCommissionsData,
  AnalyticsApiResponse,
  TransactionsApiResponse,
  CreateEntityType,
  CreateEntity,
  CreateEntityTransaction,
  Period,
  DateRange,
  ErrorResponse,
  SuccessResponse,
  Pagination,
  Sort
} from './schemas';

// API response types with relations (using Zod-inferred types)
export type EntityTypeWithRelations = EntityType;

// Utility type for date conversion
export type DateConverted<T> = {
  [K in keyof T]: T[K] extends Date 
    ? string 
    : T[K] extends (infer U)[]
      ? DateConverted<U>[]
      : T[K] extends object
        ? DateConverted<T[K]>
        : T[K];
};

// Type guard for checking if a value is a Date
export function isDate(value: unknown): value is Date {
  return value instanceof Date;
}

// Type guard for checking if a value is an object
export function isObject(value: unknown): value is Record<string, unknown> {
  return typeof value === 'object' && value !== null && !Array.isArray(value);
}

// Type guard for checking if a value is an array
export function isArray(value: unknown): value is unknown[] {
  return Array.isArray(value);
} 