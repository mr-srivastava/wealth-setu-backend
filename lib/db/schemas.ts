import { z } from 'zod';

// Base schemas for database entities
export const UserSchema = z.object({
  id: z.string().uuid(),
  email: z.string().email(),
  name: z.string().min(1),
  createdAt: z.date(),
  updatedAt: z.date(),
});

export const ProfileSchema = z.object({
  id: z.string().uuid(),
  userId: z.string().uuid(),
  bio: z.string().nullable(),
  website: z.string().url().nullable(),
  location: z.string().nullable(),
  phone: z.string().nullable(),
  dateOfBirth: z.date().nullable(),
  createdAt: z.date(),
  updatedAt: z.date(),
});

export const AccountSchema = z.object({
  id: z.string().uuid(),
  userId: z.string().uuid(),
  name: z.string().min(1),
  type: z.enum(['checking', 'savings', 'credit', 'investment']),
  balance: z.string(),
  isActive: z.boolean(),
  createdAt: z.date(),
  updatedAt: z.date(),
});

export const TransactionSchema = z.object({
  id: z.string().uuid(),
  accountId: z.string().uuid(),
  type: z.enum(['income', 'expense']),
  amount: z.string(),
  description: z.string(),
  date: z.date(),
  category: z.string().nullable(),
  createdAt: z.date(),
  updatedAt: z.date(),
});

export const BudgetSchema = z.object({
  id: z.string().uuid(),
  userId: z.string().uuid(),
  name: z.string().min(1),
  amount: z.string(),
  period: z.enum(['monthly', 'yearly']),
  isActive: z.boolean(),
  createdAt: z.date(),
  updatedAt: z.date(),
});

export const GoalSchema = z.object({
  id: z.string().uuid(),
  userId: z.string().uuid(),
  name: z.string().min(1),
  targetAmount: z.string(),
  currentAmount: z.string(),
  deadline: z.date().nullable(),
  isActive: z.boolean(),
  createdAt: z.date(),
  updatedAt: z.date(),
});

// Analytics schemas
export const EntityTypeSchema = z.object({
  id: z.string().uuid(),
  name: z.string().min(1),
  createdAt: z.date(),
  updatedAt: z.date(),
});

export const EntitySchema = z.object({
  id: z.string().uuid(),
  name: z.string().min(1),
  typeId: z.string().uuid(),
  createdAt: z.date(),
  updatedAt: z.date(),
});

export const EntityTransactionSchema = z.object({
  id: z.string().uuid(),
  entityId: z.string().uuid(),
  month: z.string().regex(/^\d{4}-\d{2}-\d{2}$/), // YYYY-MM-DD format
  amount: z.string(),
  createdAt: z.date(),
  updatedAt: z.date(),
});

// API Response schemas with relations
export const EntityTypeWithRelationsSchema = EntityTypeSchema;

export const EntityWithRelationsSchema = z.object({
  entity: EntitySchema,
  entityType: EntityTypeSchema,
});

export const EntityTransactionWithRelationsSchema = z.object({
  transaction: EntityTransactionSchema,
  entity: EntitySchema,
  entityType: EntityTypeSchema,
});

// Statistics schemas
export const TransactionStatsSchema = z.object({
  totalAmount: z.number().nonnegative(),
  transactionCount: z.number().int().nonnegative(),
  averageAmount: z.number().nonnegative(),
  maxAmount: z.number().nonnegative(),
  minAmount: z.number().nonnegative(),
});

export const CommissionStatsSchema = z.object({
  totalCommissions: z.number().nonnegative(),
  currentFinancialYear: z.object({
    total: z.number().nonnegative(),
    percentageChange: z.number(),
  }),
  currentMonth: z.object({
    total: z.number().nonnegative(),
    percentageChange: z.number(),
  }),
  monthlyAverage: z.number().nonnegative(),
});

export const CommissionStatsByPeriodSchema = z.object({
  period: z.enum(['month', 'quarter', 'year']),
  currentPeriod: z.object({
    total: z.number().nonnegative(),
    startDate: z.date(),
    endDate: z.date(),
  }),
  previousPeriod: z.object({
    total: z.number().nonnegative(),
    startDate: z.date(),
    endDate: z.date(),
    percentageChange: z.number(),
  }),
  samePeriodLastYear: z.object({
    total: z.number().nonnegative(),
    startDate: z.date(),
    endDate: z.date(),
    percentageChange: z.number(),
  }),
});

export const EntityTypeTotalSchema = z.object({
  entityTypeId: z.string().uuid(),
  entityTypeName: z.string().min(1),
  currentFYTotal: z.number().nonnegative(),
  previousFYTotal: z.number().nonnegative(),
  percentageChange: z.number(),
});

export const RecentCommissionsDataSchema = z.object({
  transactions: z.array(EntityTransactionWithRelationsSchema),
  grandTotal: z.object({
    currentFYTotal: z.number().nonnegative(),
    previousFYTotal: z.number().nonnegative(),
    percentageChange: z.number(),
  }),
  entityTypeTotals: z.array(EntityTypeTotalSchema),
});

// Main API response schemas
export const AnalyticsApiResponseSchema = z.object({
  entityTypes: z.array(EntityTypeWithRelationsSchema),
  entities: z.array(EntityWithRelationsSchema),
  transactions: z.array(EntityTransactionWithRelationsSchema),
  stats: TransactionStatsSchema,
  commissionStats: CommissionStatsSchema,
  recentCommissionsData: RecentCommissionsDataSchema,
});

export const TransactionsApiResponseSchema = z.object({
  transactions: z.array(EntityTransactionWithRelationsSchema),
  stats: TransactionStatsSchema,
  commissionStats: CommissionStatsSchema,
  recentCommissionsData: RecentCommissionsDataSchema,
});

// Input schemas for API endpoints
export const CreateEntityTypeSchema = z.object({
  name: z.string().min(1).max(100),
});

export const CreateEntitySchema = z.object({
  name: z.string().min(1).max(100),
  typeId: z.string().uuid(),
});

export const CreateEntityTransactionSchema = z.object({
  entityId: z.string().uuid(),
  month: z.string().regex(/^\d{4}-\d{2}-\d{2}$/),
  amount: z.string().regex(/^\d+(\.\d{1,2})?$/), // Valid decimal number
});

// Query parameter schemas
export const PeriodSchema = z.enum(['month', 'quarter', 'year']);

export const DateRangeSchema = z.object({
  startDate: z.string().datetime().optional(),
  endDate: z.string().datetime().optional(),
});

// Error response schema
export const ErrorResponseSchema = z.object({
  error: z.string(),
  message: z.string(),
  statusCode: z.number().int().positive(),
});

// Success response schema
export const SuccessResponseSchema = z.object({
  success: z.boolean(),
  message: z.string(),
  data: z.unknown(),
});

// Utility schemas for validation
export const PaginationSchema = z.object({
  page: z.number().int().positive().default(1),
  limit: z.number().int().positive().max(100).default(20),
});

export const SortSchema = z.object({
  field: z.string(),
  direction: z.enum(['asc', 'desc']).default('desc'),
});

// Type exports for use in TypeScript
export type User = z.infer<typeof UserSchema>;
export type Profile = z.infer<typeof ProfileSchema>;
export type Account = z.infer<typeof AccountSchema>;
export type Transaction = z.infer<typeof TransactionSchema>;
export type Budget = z.infer<typeof BudgetSchema>;
export type Goal = z.infer<typeof GoalSchema>;
export type EntityType = z.infer<typeof EntityTypeSchema>;
export type Entity = z.infer<typeof EntitySchema>;
export type EntityTransaction = z.infer<typeof EntityTransactionSchema>;
export type EntityWithRelations = z.infer<typeof EntityWithRelationsSchema>;
export type EntityTransactionWithRelations = z.infer<typeof EntityTransactionWithRelationsSchema>;
export type TransactionStats = z.infer<typeof TransactionStatsSchema>;
export type CommissionStats = z.infer<typeof CommissionStatsSchema>;
export type CommissionStatsByPeriod = z.infer<typeof CommissionStatsByPeriodSchema>;
export type EntityTypeTotal = z.infer<typeof EntityTypeTotalSchema>;
export type RecentCommissionsData = z.infer<typeof RecentCommissionsDataSchema>;
export type AnalyticsApiResponse = z.infer<typeof AnalyticsApiResponseSchema>;
export type TransactionsApiResponse = z.infer<typeof TransactionsApiResponseSchema>;
export type CreateEntityType = z.infer<typeof CreateEntityTypeSchema>;
export type CreateEntity = z.infer<typeof CreateEntitySchema>;
export type CreateEntityTransaction = z.infer<typeof CreateEntityTransactionSchema>;
export type Period = z.infer<typeof PeriodSchema>;
export type DateRange = z.infer<typeof DateRangeSchema>;
export type ErrorResponse = z.infer<typeof ErrorResponseSchema>;
export type SuccessResponse = z.infer<typeof SuccessResponseSchema>;
export type Pagination = z.infer<typeof PaginationSchema>;
export type Sort = z.infer<typeof SortSchema>; 