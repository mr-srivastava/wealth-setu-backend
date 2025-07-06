import { z } from 'zod';
import {
  AnalyticsApiResponseSchema,
  TransactionsApiResponseSchema,
  CreateEntityTypeSchema,
  CreateEntitySchema,
  CreateEntityTransactionSchema,
  PeriodSchema,
  DateRangeSchema,
  PaginationSchema,
  SortSchema,
  EntityTypeWithRelationsSchema,
  EntityWithRelationsSchema,
  EntityTransactionWithRelationsSchema,
  TransactionStatsSchema,
  CommissionStatsSchema,
  CommissionStatsByPeriodSchema,
  RecentCommissionsDataSchema,
} from './db/schemas';

// Generic validation function
export function validateData<T>(schema: z.ZodSchema<T>, data: unknown): T {
  try {
    return schema.parse(data);
  } catch (error) {
    if (error instanceof z.ZodError) {
      throw new Error(`Validation failed: ${error.errors.map(e => e.message).join(', ')}`);
    }
    throw error;
  }
}

// Safe validation function that returns null on failure
export function safeValidateData<T>(schema: z.ZodSchema<T>, data: unknown): T | null {
  try {
    return schema.parse(data);
  } catch {
    return null;
  }
}

// API Response validation
export const validateAnalyticsApiResponse = (data: unknown) => 
  validateData(AnalyticsApiResponseSchema, data);

export const validateTransactionsApiResponse = (data: unknown) => 
  validateData(TransactionsApiResponseSchema, data);

// Entity validation
export const validateEntityType = (data: unknown) => 
  validateData(EntityTypeWithRelationsSchema, data);

export const validateEntity = (data: unknown) => 
  validateData(EntityWithRelationsSchema, data);

export const validateEntityTransaction = (data: unknown) => 
  validateData(EntityTransactionWithRelationsSchema, data);

// Statistics validation
export const validateTransactionStats = (data: unknown) => 
  validateData(TransactionStatsSchema, data);

export const validateCommissionStats = (data: unknown) => 
  validateData(CommissionStatsSchema, data);

export const validateCommissionStatsByPeriod = (data: unknown) => 
  validateData(CommissionStatsByPeriodSchema, data);

export const validateRecentCommissionsData = (data: unknown) => 
  validateData(RecentCommissionsDataSchema, data);

// Input validation
export const validateCreateEntityType = (data: unknown) => 
  validateData(CreateEntityTypeSchema, data);

export const validateCreateEntity = (data: unknown) => 
  validateData(CreateEntitySchema, data);

export const validateCreateEntityTransaction = (data: unknown) => 
  validateData(CreateEntityTransactionSchema, data);

// Query parameter validation
export const validatePeriod = (data: unknown) => 
  validateData(PeriodSchema, data);

export const validateDateRange = (data: unknown) => 
  validateData(DateRangeSchema, data);

export const validatePagination = (data: unknown) => 
  validateData(PaginationSchema, data);

export const validateSort = (data: unknown) => 
  validateData(SortSchema, data);

// Array validation helpers
export const validateEntityTypeArray = (data: unknown) => 
  validateData(z.array(EntityTypeWithRelationsSchema), data);

export const validateEntityArray = (data: unknown) => 
  validateData(z.array(EntityWithRelationsSchema), data);

export const validateEntityTransactionArray = (data: unknown) => 
  validateData(z.array(EntityTransactionWithRelationsSchema), data);

// Safe validation helpers (return null on failure)
export const safeValidateAnalyticsApiResponse = (data: unknown) => 
  safeValidateData(AnalyticsApiResponseSchema, data);

export const safeValidateTransactionsApiResponse = (data: unknown) => 
  safeValidateData(TransactionsApiResponseSchema, data);

export const safeValidateEntityTypeArray = (data: unknown) => 
  safeValidateData(z.array(EntityTypeWithRelationsSchema), data);

export const safeValidateEntityArray = (data: unknown) => 
  safeValidateData(z.array(EntityWithRelationsSchema), data);

export const safeValidateEntityTransactionArray = (data: unknown) => 
  safeValidateData(z.array(EntityTransactionWithRelationsSchema), data);

// Error handling utilities
export function formatZodError(error: z.ZodError): string {
  return error.errors.map(e => {
    const path = e.path.join('.');
    return `${path}: ${e.message}`;
  }).join(', ');
}

export function createValidationError(message: string, errors?: z.ZodError): Error {
  const errorMessage = errors ? `${message}: ${formatZodError(errors)}` : message;
  return new Error(errorMessage);
}

// Type guards using Zod
export function isValidAnalyticsApiResponse(data: unknown): data is z.infer<typeof AnalyticsApiResponseSchema> {
  return AnalyticsApiResponseSchema.safeParse(data).success;
}

export function isValidTransactionsApiResponse(data: unknown): data is z.infer<typeof TransactionsApiResponseSchema> {
  return TransactionsApiResponseSchema.safeParse(data).success;
}

export function isValidEntityType(data: unknown): data is z.infer<typeof EntityTypeWithRelationsSchema> {
  return EntityTypeWithRelationsSchema.safeParse(data).success;
}

export function isValidEntity(data: unknown): data is z.infer<typeof EntityWithRelationsSchema> {
  return EntityWithRelationsSchema.safeParse(data).success;
}

export function isValidEntityTransaction(data: unknown): data is z.infer<typeof EntityTransactionWithRelationsSchema> {
  return EntityTransactionWithRelationsSchema.safeParse(data).success;
}

// Utility for validating API responses with error handling
export function validateApiResponse<T>(
  schema: z.ZodSchema<T>,
  data: unknown,
  context: string = 'API response'
): T {
  try {
    return schema.parse(data);
  } catch (error) {
    if (error instanceof z.ZodError) {
      throw createValidationError(`${context} validation failed`, error);
    }
    throw error;
  }
}

// Utility for validating request bodies
export function validateRequestBody<T>(
  schema: z.ZodSchema<T>,
  body: unknown,
  context: string = 'Request body'
): T {
  try {
    return schema.parse(body);
  } catch (error) {
    if (error instanceof z.ZodError) {
      throw createValidationError(`${context} validation failed`, error);
    }
    throw error;
  }
}

// Utility for validating query parameters
export function validateQueryParams<T>(
  schema: z.ZodSchema<T>,
  params: unknown,
  context: string = 'Query parameters'
): T {
  try {
    return schema.parse(params);
  } catch (error) {
    if (error instanceof z.ZodError) {
      throw createValidationError(`${context} validation failed`, error);
    }
    throw error;
  }
} 