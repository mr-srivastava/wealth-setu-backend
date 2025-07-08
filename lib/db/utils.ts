import { db } from "./index";
import { users, profiles, accounts, transactions, budgets, goals, entityTypes, entities, entityTransactions } from "./schema/index";
import { eq, and, desc, asc, gte, lte, sql } from "drizzle-orm";
import type { UserInsert, ProfileInsert, AccountInsert, TransactionInsert, BudgetInsert, GoalInsert, EntityTypeInsert, EntityInsert, EntityTransactionInsert } from "./types";

// Cache management
const analyticsCache = new Map<string, { data: unknown; timestamp: number }>();
const CACHE_TTL = 5 * 60 * 1000; // 5 minutes

// Clear cache function
function clearAnalyticsCache(): void {
  analyticsCache.clear();
}

// Clear cache on module load to ensure no old string values
clearAnalyticsCache();

function getCachedData<T>(key: string): T | null {
  const cached = analyticsCache.get(key);
  if (cached && Date.now() - cached.timestamp < CACHE_TTL) {
    return cached.data as T;
  }
  return null;
}

function setCachedData<T>(key: string, data: T): void {
  analyticsCache.set(key, { data, timestamp: Date.now() });
}

// Type guard functions
export function isDate(value: unknown): value is Date {
  return value instanceof Date;
}

export function isObject(value: unknown): value is Record<string, unknown> {
  return typeof value === 'object' && value !== null && !Array.isArray(value);
}

export function isArray(value: unknown): value is unknown[] {
  return Array.isArray(value);
}

// User utilities
export async function getUserById(id: string) {
  const result = await db.select().from(users).where(eq(users.id, id)).limit(1);
  return result[0];
}

export async function getUserByEmail(email: string) {
  const result = await db.select().from(users).where(eq(users.email, email)).limit(1);
  return result[0];
}

export async function createUser(userData: UserInsert) {
  return await db.insert(users).values(userData).returning();
}

export async function updateUser(id: string, userData: Partial<UserInsert>) {
  return await db
    .update(users)
    .set({ ...userData, updatedAt: new Date() })
    .where(eq(users.id, id))
    .returning();
}

// Profile utilities
export async function getProfileByUserId(userId: string) {
  const result = await db.select().from(profiles).where(eq(profiles.userId, userId)).limit(1);
  return result[0];
}

export async function upsertProfile(profileData: ProfileInsert) {
  return await db
    .insert(profiles)
    .values(profileData)
    .onConflictDoUpdate({
      target: profiles.userId,
      set: {
        bio: profileData.bio,
        website: profileData.website,
        location: profileData.location,
        phone: profileData.phone,
        dateOfBirth: profileData.dateOfBirth,
        updatedAt: new Date(),
      },
    })
    .returning();
}

// Account utilities
export async function getAccountsByUserId(userId: string) {
  return await db
    .select()
    .from(accounts)
    .where(and(eq(accounts.userId, userId), eq(accounts.isActive, true)))
    .orderBy(asc(accounts.name));
}

export async function createAccount(accountData: AccountInsert) {
  return await db.insert(accounts).values(accountData).returning();
}

export async function updateAccount(id: string, accountData: Partial<AccountInsert>) {
  return await db
    .update(accounts)
    .set({ ...accountData, updatedAt: new Date() })
    .where(eq(accounts.id, id))
    .returning();
}

export async function deleteAccount(id: string) {
  return await db
    .update(accounts)
    .set({ isActive: false, updatedAt: new Date() })
    .where(eq(accounts.id, id))
    .returning();
}

// Transaction utilities
export async function getTransactionsByAccountId(accountId: string, limit = 50) {
  return await db
    .select()
    .from(transactions)
    .where(eq(transactions.accountId, accountId))
    .orderBy(desc(transactions.date))
    .limit(limit);
}

export async function getTransactionsByUserId(userId: string, limit = 50) {
  return await db
    .select({
      transaction: transactions,
      account: accounts,
    })
    .from(transactions)
    .innerJoin(accounts, eq(transactions.accountId, accounts.id))
    .where(eq(accounts.userId, userId))
    .orderBy(desc(transactions.date))
    .limit(limit);
}

export async function createTransaction(transactionData: TransactionInsert) {
  return await db.insert(transactions).values(transactionData).returning();
}

export async function getTransactionStats(userId: string, startDate?: Date, endDate?: Date) {
  const baseCondition = eq(accounts.userId, userId);
  
  if (startDate && endDate) {
    const dateCondition = and(gte(transactions.date, startDate), lte(transactions.date, endDate));
    const finalCondition = and(baseCondition, dateCondition);
    
    const result = await db
      .select({
        totalIncome: sql<string>`SUM(CASE WHEN ${transactions.type} = 'income' THEN ${transactions.amount} ELSE 0 END)`,
        totalExpense: sql<string>`SUM(CASE WHEN ${transactions.type} = 'expense' THEN ${transactions.amount} ELSE 0 END)`,
        transactionCount: sql<number>`COUNT(*)`,
      })
      .from(transactions)
      .innerJoin(accounts, eq(transactions.accountId, accounts.id))
      .where(finalCondition);

    const stats = result[0];
    return {
      totalIncome: parseFloat(stats.totalIncome),
      totalExpense: parseFloat(stats.totalExpense),
      transactionCount: stats.transactionCount
    };
  }

  const result = await db
    .select({
      totalIncome: sql<string>`SUM(CASE WHEN ${transactions.type} = 'income' THEN ${transactions.amount} ELSE 0 END)`,
      totalExpense: sql<string>`SUM(CASE WHEN ${transactions.type} = 'expense' THEN ${transactions.amount} ELSE 0 END)`,
      transactionCount: sql<number>`COUNT(*)`,
    })
    .from(transactions)
    .innerJoin(accounts, eq(transactions.accountId, accounts.id))
    .where(baseCondition);

  const stats = result[0];
  return {
    totalIncome: parseFloat(stats.totalIncome),
    totalExpense: parseFloat(stats.totalExpense),
    transactionCount: stats.transactionCount
  };
}

// Budget utilities
export async function getBudgetsByUserId(userId: string) {
  return await db
    .select()
    .from(budgets)
    .where(and(eq(budgets.userId, userId), eq(budgets.isActive, true)))
    .orderBy(asc(budgets.name));
}

export async function createBudget(budgetData: BudgetInsert) {
  return await db.insert(budgets).values(budgetData).returning();
}

// Goal utilities
export async function getGoalsByUserId(userId: string) {
  return await db
    .select()
    .from(goals)
    .where(and(eq(goals.userId, userId), eq(goals.isActive, true)))
    .orderBy(asc(goals.name));
}

export async function createGoal(goalData: GoalInsert) {
  return await db.insert(goals).values(goalData).returning();
}

export async function updateGoalProgress(id: string, currentAmount: number) {
  return await db
    .update(goals)
    .set({ currentAmount: currentAmount.toString(), updatedAt: new Date() })
    .where(eq(goals.id, id))
    .returning();
}

// Analytics utilities
export async function getAllEntityTypes() {
  return await db
    .select()
    .from(entityTypes)
    .orderBy(asc(entityTypes.name));
}

export async function createEntityType(entityTypeData: EntityTypeInsert) {
  return await db.insert(entityTypes).values(entityTypeData).returning();
}

export async function getAllEntities() {
  return await db
    .select({
      entity: entities,
      entityType: entityTypes,
    })
    .from(entities)
    .innerJoin(entityTypes, eq(entities.typeId, entityTypes.id))
    .orderBy(asc(entities.name));
}

export async function getEntitiesByTypeId(typeId: string) {
  return await db
    .select()
    .from(entities)
    .where(eq(entities.typeId, typeId))
    .orderBy(asc(entities.name));
}

export async function createEntity(entityData: EntityInsert) {
  return await db.insert(entities).values(entityData).returning();
}

export async function getEntityTransactionsByEntityId(entityId: string) {
  return await db
    .select()
    .from(entityTransactions)
    .where(eq(entityTransactions.entityId, entityId))
    .orderBy(desc(entityTransactions.month));
}

export async function getAllEntityTransactions() {
  return await db
    .select({
      transaction: entityTransactions,
      entity: entities,
      entityType: entityTypes,
    })
    .from(entityTransactions)
    .innerJoin(entities, eq(entityTransactions.entityId, entities.id))
    .innerJoin(entityTypes, eq(entities.typeId, entityTypes.id))
    .orderBy(desc(entityTransactions.month));
}

export async function getEntityTransactionStats() {
  const result = await db
    .select({
      totalAmount: sql<string>`COALESCE(SUM(${entityTransactions.amount}), '0')`,
      transactionCount: sql<number>`COUNT(*)`,
      averageAmount: sql<string>`COALESCE(AVG(${entityTransactions.amount}), '0')`,
      maxAmount: sql<string>`COALESCE(MAX(${entityTransactions.amount}), '0')`,
      minAmount: sql<string>`COALESCE(MIN(${entityTransactions.amount}), '0')`,
    })
    .from(entityTransactions);

  const stats = result[0];
  
  // Ensure all values are properly parsed as numbers
  const parsedStats = {
    totalAmount: Number(stats.totalAmount || 0),
    transactionCount: Number(stats.transactionCount || 0),
    averageAmount: Number(stats.averageAmount || 0),
    maxAmount: Number(stats.maxAmount || 0),
    minAmount: Number(stats.minAmount || 0)
  };
  
  return parsedStats;
}

export async function getCommissionStats() {
  // Check cache first
  const cacheKey = 'commission_stats';
  const cached = getCachedData(cacheKey);
  if (cached) {
    return cached;
  }

  const now = new Date();
  const currentYear = now.getFullYear();
  const currentMonth = now.getMonth() + 1; // 1-12
  
  // Indian financial year starts from April 1st
  const currentFinancialYearStart = new Date(currentYear, 2, 1); // April 1st
  const currentFinancialYearEnd = new Date(currentYear + 1, 1, 31); // March 31st next year
  
  // If current month is Jan-Mar, financial year is previous year
  if (currentMonth <= 3) {
    currentFinancialYearStart.setFullYear(currentYear - 1);
    currentFinancialYearEnd.setFullYear(currentYear);
  }
  
  const previousFinancialYearStart = new Date(currentFinancialYearStart);
  previousFinancialYearStart.setFullYear(currentFinancialYearStart.getFullYear() - 1);
  const previousFinancialYearEnd = new Date(currentFinancialYearEnd);
  previousFinancialYearEnd.setFullYear(currentFinancialYearEnd.getFullYear() - 1);
  
  // Current month start and end
  const currentMonthStart = new Date(currentYear, currentMonth - 1, 1);
  const currentMonthEnd = new Date(currentYear, currentMonth, 0); // Last day of current month
  
  // Same month last financial year
  const lastYearSameMonthStart = new Date(currentYear - 1, currentMonth - 1, 1);
  const lastYearSameMonthEnd = new Date(currentYear - 1, currentMonth, 0);

  // Format dates as YYYY-MM-DD strings for database comparison
  const formatDate = (date: Date) => date.toISOString().split('T')[0];

  // Single consolidated query with conditional aggregation
  const result = await db
    .select({
      totalCommissions: sql<string>`COALESCE(SUM(${entityTransactions.amount}), 0)`,
      currentFinancialYearTotal: sql<string>`COALESCE(SUM(CASE WHEN ${entityTransactions.month} >= ${formatDate(currentFinancialYearStart)} AND ${entityTransactions.month} <= ${formatDate(currentFinancialYearEnd)} THEN ${entityTransactions.amount} ELSE 0 END), 0)`,
      previousFinancialYearTotal: sql<string>`COALESCE(SUM(CASE WHEN ${entityTransactions.month} >= ${formatDate(previousFinancialYearStart)} AND ${entityTransactions.month} <= ${formatDate(previousFinancialYearEnd)} THEN ${entityTransactions.amount} ELSE 0 END), 0)`,
      currentMonthTotal: sql<string>`COALESCE(SUM(CASE WHEN ${entityTransactions.month} >= ${formatDate(currentMonthStart)} AND ${entityTransactions.month} <= ${formatDate(currentMonthEnd)} THEN ${entityTransactions.amount} ELSE 0 END), 0)`,
      lastYearSameMonthTotal: sql<string>`COALESCE(SUM(CASE WHEN ${entityTransactions.month} >= ${formatDate(lastYearSameMonthStart)} AND ${entityTransactions.month} <= ${formatDate(lastYearSameMonthEnd)} THEN ${entityTransactions.amount} ELSE 0 END), 0)`,
      currentFinancialYearMonths: sql<string>`COALESCE(COUNT(DISTINCT CASE WHEN ${entityTransactions.month} >= ${formatDate(currentFinancialYearStart)} AND ${entityTransactions.month} <= ${formatDate(currentFinancialYearEnd)} THEN DATE_TRUNC('month', ${entityTransactions.month}) END), 0)`
    })
    .from(entityTransactions);

  const stats = result[0];

  // Parse all results to numbers
  const totalCommissions = parseFloat(stats.totalCommissions);
  const currentFinancialYearTotal = parseFloat(stats.currentFinancialYearTotal);
  const previousFinancialYearTotal = parseFloat(stats.previousFinancialYearTotal);
  const currentMonthTotal = parseFloat(stats.currentMonthTotal);
  const lastYearSameMonthTotal = parseFloat(stats.lastYearSameMonthTotal);
  const currentFinancialYearMonths = parseInt(stats.currentFinancialYearMonths, 10) || 1;

  // Calculate percentage changes
  const financialYearPercentageChange = previousFinancialYearTotal > 0 
    ? ((currentFinancialYearTotal - previousFinancialYearTotal) / previousFinancialYearTotal) * 100 
    : 0;
    
  const currentMonthPercentageChange = lastYearSameMonthTotal > 0 
    ? ((currentMonthTotal - lastYearSameMonthTotal) / lastYearSameMonthTotal) * 100 
    : 0;

  // Calculate monthly average based on current financial year
  const monthlyAverage = currentFinancialYearTotal / currentFinancialYearMonths;

  const finalResult = {
    totalCommissions,
    currentFinancialYear: {
      total: currentFinancialYearTotal,
      percentageChange: financialYearPercentageChange
    },
    currentMonth: {
      total: currentMonthTotal,
      percentageChange: currentMonthPercentageChange
    },
    monthlyAverage
  };

  // Cache the result
  setCachedData(cacheKey, finalResult);
  return finalResult;
}

export async function getRecentCommissionsData() {
  const now = new Date();
  const currentYear = now.getFullYear();
  const currentMonth = now.getMonth() + 1; // 1-12
  
  // Indian financial year starts from April 1st
  const currentFinancialYearStart = new Date(currentYear, 2, 1); // April 1st
  const currentFinancialYearEnd = new Date(currentYear + 1, 1, 31); // March 31st next year
  
  // If current month is Jan-Mar, financial year is previous year
  if (currentMonth <= 3) {
    currentFinancialYearStart.setFullYear(currentYear - 1);
    currentFinancialYearEnd.setFullYear(currentYear);
  }
  
  const previousFinancialYearStart = new Date(currentFinancialYearStart);
  previousFinancialYearStart.setFullYear(currentFinancialYearStart.getFullYear() - 1);
  const previousFinancialYearEnd = new Date(currentFinancialYearEnd);
  previousFinancialYearEnd.setFullYear(currentFinancialYearEnd.getFullYear() - 1);

  // Format dates as YYYY-MM-DD strings for database comparison
  const formatDate = (date: Date) => date.toISOString().split('T')[0];

  // Execute queries in parallel: recent transactions + consolidated financial year data
  const [recentTransactions, financialYearData] = await Promise.all([
    // Get recent transactions (latest 10)
    db
      .select({
        transaction: entityTransactions,
        entity: entities,
        entityType: entityTypes,
      })
      .from(entityTransactions)
      .innerJoin(entities, eq(entityTransactions.entityId, entities.id))
      .innerJoin(entityTypes, eq(entities.typeId, entityTypes.id))
      .orderBy(desc(entityTransactions.createdAt))
      .limit(10),

    // Single query for all financial year data with conditional aggregation
    db
      .select({
        entityTypeId: entityTypes.id,
        entityTypeName: entityTypes.name,
        currentFYTotal: sql<string>`COALESCE(SUM(CASE WHEN ${entityTransactions.month} >= ${formatDate(currentFinancialYearStart)} AND ${entityTransactions.month} <= ${formatDate(currentFinancialYearEnd)} THEN ${entityTransactions.amount} ELSE 0 END), 0)`,
        previousFYTotal: sql<string>`COALESCE(SUM(CASE WHEN ${entityTransactions.month} >= ${formatDate(previousFinancialYearStart)} AND ${entityTransactions.month} <= ${formatDate(previousFinancialYearEnd)} THEN ${entityTransactions.amount} ELSE 0 END), 0)`,
        grandTotalCurrentFY: sql<string>`COALESCE(SUM(CASE WHEN ${entityTransactions.month} >= ${formatDate(currentFinancialYearStart)} AND ${entityTransactions.month} <= ${formatDate(currentFinancialYearEnd)} THEN ${entityTransactions.amount} ELSE 0 END), 0)`,
        grandTotalPreviousFY: sql<string>`COALESCE(SUM(CASE WHEN ${entityTransactions.month} >= ${formatDate(previousFinancialYearStart)} AND ${entityTransactions.month} <= ${formatDate(previousFinancialYearEnd)} THEN ${entityTransactions.amount} ELSE 0 END), 0)`
      })
      .from(entityTransactions)
      .innerJoin(entities, eq(entityTransactions.entityId, entities.id))
      .innerJoin(entityTypes, eq(entities.typeId, entityTypes.id))
      .groupBy(entityTypes.id, entityTypes.name)
  ]);

  // Calculate grand totals from the grouped data
  const grandTotalCurrentFY = financialYearData.reduce((sum, item) => sum + parseFloat(item.currentFYTotal), 0);
  const grandTotalPreviousFY = financialYearData.reduce((sum, item) => sum + parseFloat(item.previousFYTotal), 0);

  // Calculate grand total percentage change
  const grandTotalPercentageChange = grandTotalPreviousFY > 0 
    ? ((grandTotalCurrentFY - grandTotalPreviousFY) / grandTotalPreviousFY) * 100 
    : 0;

  // Create entity type totals with percentage changes
  const entityTypeTotals = financialYearData.map(item => {
    const currentFYTotal = parseFloat(item.currentFYTotal);
    const previousFYTotal = parseFloat(item.previousFYTotal);
    const percentageChange = previousFYTotal > 0 
      ? ((currentFYTotal - previousFYTotal) / previousFYTotal) * 100 
      : 0;

    return {
      entityTypeId: item.entityTypeId,
      entityTypeName: item.entityTypeName,
      currentFYTotal,
      previousFYTotal,
      percentageChange
    };
  });

  return {
    transactions: recentTransactions,
    grandTotal: {
      currentFYTotal: grandTotalCurrentFY,
      previousFYTotal: grandTotalPreviousFY,
      percentageChange: grandTotalPercentageChange
    },
    entityTypeTotals
  };
}

export async function createEntityTransaction(transactionData: EntityTransactionInsert) {
  return await db.insert(entityTransactions).values(transactionData).returning();
}

export async function getCommissionStatsByPeriod(period: 'month' | 'quarter' | 'year') {
  // Check cache first
  const cacheKey = `commission_stats_${period}`;
  const cached = getCachedData(cacheKey);
  if (cached) {
    return cached;
  }

  const now = new Date();
  const currentYear = now.getFullYear();
  const currentMonth = now.getMonth() + 1; // 1-12
  
  // Indian financial year starts from April 1st
  const currentFinancialYearStart = new Date(currentYear, 2, 1); // April 1st
  const currentFinancialYearEnd = new Date(currentYear + 1, 1, 31); // March 31st next year
  
  // If current month is Jan-Mar, financial year is previous year
  if (currentMonth <= 3) {
    currentFinancialYearStart.setFullYear(currentYear - 1);
    currentFinancialYearEnd.setFullYear(currentYear);
  }

  const formatDate = (date: Date) => date.toISOString().split('T')[0];

  let currentPeriodStart: Date;
  let currentPeriodEnd: Date;
  let previousPeriodStart: Date;
  let previousPeriodEnd: Date;
  let samePeriodLastYearStart: Date;
  let samePeriodLastYearEnd: Date;

  if (period === 'month') {
    // Current month
    currentPeriodStart = new Date(currentYear, currentMonth - 1, 1);
    currentPeriodEnd = new Date(currentYear, currentMonth, 0);
    
    // Previous month
    previousPeriodStart = new Date(currentYear, currentMonth - 2, 1);
    previousPeriodEnd = new Date(currentYear, currentMonth - 1, 0);
    
    // Same month last year
    samePeriodLastYearStart = new Date(currentYear - 1, currentMonth - 1, 1);
    samePeriodLastYearEnd = new Date(currentYear - 1, currentMonth, 0);
  } else if (period === 'quarter') {
    // Calculate current quarter
    const currentQuarter = Math.ceil(currentMonth / 3);
    const quarterStartMonth = (currentQuarter - 1) * 3;
    
    // Current quarter
    currentPeriodStart = new Date(currentYear, quarterStartMonth, 1);
    currentPeriodEnd = new Date(currentYear, quarterStartMonth + 3, 0);
    
    // Previous quarter
    const prevQuarterStartMonth = quarterStartMonth - 3;
    previousPeriodStart = new Date(currentYear, prevQuarterStartMonth, 1);
    previousPeriodEnd = new Date(currentYear, quarterStartMonth, 0);
    
    // Same quarter last year
    samePeriodLastYearStart = new Date(currentYear - 1, quarterStartMonth, 1);
    samePeriodLastYearEnd = new Date(currentYear - 1, quarterStartMonth + 3, 0);
  } else { // year
    // Current financial year
    currentPeriodStart = currentFinancialYearStart;
    currentPeriodEnd = currentFinancialYearEnd;
    
    // Previous financial year
    previousPeriodStart = new Date(currentFinancialYearStart);
    previousPeriodStart.setFullYear(currentFinancialYearStart.getFullYear() - 1);
    previousPeriodEnd = new Date(currentFinancialYearEnd);
    previousPeriodEnd.setFullYear(currentFinancialYearEnd.getFullYear() - 1);
    
    // Same period last year (not applicable for year comparison, but keeping for consistency)
    samePeriodLastYearStart = previousPeriodStart;
    samePeriodLastYearEnd = previousPeriodEnd;
  }

  // Single consolidated query with conditional aggregation
  const result = await db
    .select({
      totalCommissions: sql<string>`COALESCE(SUM(${entityTransactions.amount}), 0)`,
      currentPeriodTotal: sql<string>`COALESCE(SUM(CASE WHEN ${entityTransactions.month} >= ${formatDate(currentPeriodStart)} AND ${entityTransactions.month} <= ${formatDate(currentPeriodEnd)} THEN ${entityTransactions.amount} ELSE 0 END), 0)`,
      previousPeriodTotal: sql<string>`COALESCE(SUM(CASE WHEN ${entityTransactions.month} >= ${formatDate(previousPeriodStart)} AND ${entityTransactions.month} <= ${formatDate(previousPeriodEnd)} THEN ${entityTransactions.amount} ELSE 0 END), 0)`,
      samePeriodLastYearTotal: sql<string>`COALESCE(SUM(CASE WHEN ${entityTransactions.month} >= ${formatDate(samePeriodLastYearStart)} AND ${entityTransactions.month} <= ${formatDate(samePeriodLastYearEnd)} THEN ${entityTransactions.amount} ELSE 0 END), 0)`,
    })
    .from(entityTransactions);

  const stats = result[0];

  // Parse string results to numbers
  const currentPeriodTotal = parseFloat(stats.currentPeriodTotal);
  const previousPeriodTotal = parseFloat(stats.previousPeriodTotal);
  const samePeriodLastYearTotal = parseFloat(stats.samePeriodLastYearTotal);

  // Calculate percentage changes
  const previousPeriodPercentageChange = previousPeriodTotal > 0 
    ? ((currentPeriodTotal - previousPeriodTotal) / previousPeriodTotal) * 100 
    : 0;
    
  const samePeriodLastYearPercentageChange = samePeriodLastYearTotal > 0 
    ? ((currentPeriodTotal - samePeriodLastYearTotal) / samePeriodLastYearTotal) * 100 
    : 0;

  const finalResult = {
    period,
    currentPeriod: {
      total: currentPeriodTotal,
      startDate: currentPeriodStart,
      endDate: currentPeriodEnd
    },
    previousPeriod: {
      total: previousPeriodTotal,
      startDate: previousPeriodStart,
      endDate: previousPeriodEnd,
      percentageChange: previousPeriodPercentageChange
    },
    samePeriodLastYear: {
      total: samePeriodLastYearTotal,
      startDate: samePeriodLastYearStart,
      endDate: samePeriodLastYearEnd,
      percentageChange: samePeriodLastYearPercentageChange
    }
  };

  // Cache the result
  setCachedData(cacheKey, finalResult);
  return finalResult;
}

export async function getTransactionsByPeriod(period: 'month' | 'quarter' | 'year') {
  const now = new Date();
  const currentYear = now.getFullYear();
  const currentMonth = now.getMonth() + 1; // 1-12

  let periodStart: Date;
  let periodEnd: Date;

  if (period === 'month') {
    // Current month
    periodStart = new Date(currentYear, currentMonth - 1, 1);
    periodEnd = new Date(currentYear, currentMonth, 0);
  } else if (period === 'quarter') {
    // Calculate current quarter
    const currentQuarter = Math.ceil(currentMonth / 3);
    const quarterStartMonth = (currentQuarter - 1) * 3;
    
    periodStart = new Date(currentYear, quarterStartMonth, 1);
    periodEnd = new Date(currentYear, quarterStartMonth + 3, 0);
  } else { // year
    // Indian financial year starts from April 1st
    periodStart = new Date(currentYear, 2, 1); // April 1st
    periodEnd = new Date(currentYear + 1, 1, 31); // March 31st next year
    
    // If current month is Jan-Mar, financial year is previous year
    if (currentMonth <= 3) {
      periodStart.setFullYear(currentYear - 1);
      periodEnd.setFullYear(currentYear);
    }
  }

  const formatDate = (date: Date) => date.toISOString().split('T')[0];

  return await db
    .select({
      transaction: entityTransactions,
      entity: entities,
      entityType: entityTypes,
    })
    .from(entityTransactions)
    .innerJoin(entities, eq(entityTransactions.entityId, entities.id))
    .innerJoin(entityTypes, eq(entities.typeId, entityTypes.id))
    .where(
      and(
        gte(entityTransactions.month, formatDate(periodStart)),
        lte(entityTransactions.month, formatDate(periodEnd))
      )
    )
    .orderBy(desc(entityTransactions.month));
}

export async function getCommissionStatsByCustomPeriod(period: 'month' | 'quarter' | 'year', customDate: Date) {
  // Check cache first
  const cacheKey = `commission_stats_${period}_${customDate.toISOString().split('T')[0]}`;
  const cached = getCachedData(cacheKey);
  if (cached) {
    return cached;
  }

  const customYear = customDate.getFullYear();
  const customMonth = customDate.getMonth() + 1; // 1-12

  const formatDate = (date: Date) => date.toISOString().split('T')[0];

  let currentPeriodStart: Date;
  let currentPeriodEnd: Date;
  let previousPeriodStart: Date;
  let previousPeriodEnd: Date;
  let samePeriodLastYearStart: Date;
  let samePeriodLastYearEnd: Date;

  if (period === 'month') {
    // Custom month
    currentPeriodStart = new Date(customYear, customMonth - 1, 1);
    currentPeriodEnd = new Date(customYear, customMonth, 0);
    
    // Previous month
    previousPeriodStart = new Date(customYear, customMonth - 2, 1);
    previousPeriodEnd = new Date(customYear, customMonth - 1, 0);
    
    // Same month last year
    samePeriodLastYearStart = new Date(customYear - 1, customMonth - 1, 1);
    samePeriodLastYearEnd = new Date(customYear - 1, customMonth, 0);
  } else if (period === 'quarter') {
    // Calculate custom quarter
    const customQuarter = Math.ceil(customMonth / 3);
    const quarterStartMonth = (customQuarter - 1) * 3;
    
    // Custom quarter
    currentPeriodStart = new Date(customYear, quarterStartMonth, 1);
    currentPeriodEnd = new Date(customYear, quarterStartMonth + 3, 0);
    
    // Previous quarter
    const prevQuarterStartMonth = quarterStartMonth - 3;
    previousPeriodStart = new Date(customYear, prevQuarterStartMonth, 1);
    previousPeriodEnd = new Date(customYear, quarterStartMonth, 0);
    
    // Same quarter last year
    samePeriodLastYearStart = new Date(customYear - 1, quarterStartMonth, 1);
    samePeriodLastYearEnd = new Date(customYear - 1, quarterStartMonth + 3, 0);
  } else { // year
    // Custom financial year (Indian financial year starts from April 1st)
    const currentFinancialYearStart = new Date(customYear, 2, 1); // April 1st
    const currentFinancialYearEnd = new Date(customYear + 1, 1, 31); // March 31st next year
    
    // If custom month is Jan-Mar, financial year is previous year
    if (customMonth <= 3) {
      currentFinancialYearStart.setFullYear(customYear - 1);
      currentFinancialYearEnd.setFullYear(customYear);
    }
    
    // Custom financial year
    currentPeriodStart = currentFinancialYearStart;
    currentPeriodEnd = currentFinancialYearEnd;
    
    // Previous financial year
    previousPeriodStart = new Date(currentFinancialYearStart);
    previousPeriodStart.setFullYear(currentFinancialYearStart.getFullYear() - 1);
    previousPeriodEnd = new Date(currentFinancialYearEnd);
    previousPeriodEnd.setFullYear(currentFinancialYearEnd.getFullYear() - 1);
    
    // Same period last year (not applicable for year comparison, but keeping for consistency)
    samePeriodLastYearStart = previousPeriodStart;
    samePeriodLastYearEnd = previousPeriodEnd;
  }

  // Single consolidated query with conditional aggregation
  const result = await db
    .select({
      totalCommissions: sql<string>`COALESCE(SUM(${entityTransactions.amount}), 0)`,
      currentPeriodTotal: sql<string>`COALESCE(SUM(CASE WHEN ${entityTransactions.month} >= ${formatDate(currentPeriodStart)} AND ${entityTransactions.month} <= ${formatDate(currentPeriodEnd)} THEN ${entityTransactions.amount} ELSE 0 END), 0)`,
      previousPeriodTotal: sql<string>`COALESCE(SUM(CASE WHEN ${entityTransactions.month} >= ${formatDate(previousPeriodStart)} AND ${entityTransactions.month} <= ${formatDate(previousPeriodEnd)} THEN ${entityTransactions.amount} ELSE 0 END), 0)`,
      samePeriodLastYearTotal: sql<string>`COALESCE(SUM(CASE WHEN ${entityTransactions.month} >= ${formatDate(samePeriodLastYearStart)} AND ${entityTransactions.month} <= ${formatDate(samePeriodLastYearEnd)} THEN ${entityTransactions.amount} ELSE 0 END), 0)`,
    })
    .from(entityTransactions);

  const stats = result[0];

  // Parse string results to numbers
  const currentPeriodTotal = parseFloat(stats.currentPeriodTotal);
  const previousPeriodTotal = parseFloat(stats.previousPeriodTotal);
  const samePeriodLastYearTotal = parseFloat(stats.samePeriodLastYearTotal);
  
  const previousPeriodPercentageChange = previousPeriodTotal > 0 
    ? ((currentPeriodTotal - previousPeriodTotal) / previousPeriodTotal) * 100 
    : 0;
    
  const samePeriodLastYearPercentageChange = samePeriodLastYearTotal > 0 
    ? ((currentPeriodTotal - samePeriodLastYearTotal) / samePeriodLastYearTotal) * 100 
    : 0;

  const finalResult = {
    period,
    currentPeriod: {
      total: currentPeriodTotal,
      startDate: currentPeriodStart,
      endDate: currentPeriodEnd
    },
    previousPeriod: {
      total: previousPeriodTotal,
      startDate: previousPeriodStart,
      endDate: previousPeriodEnd,
      percentageChange: previousPeriodPercentageChange
    },
    samePeriodLastYear: {
      total: samePeriodLastYearTotal,
      startDate: samePeriodLastYearStart,
      endDate: samePeriodLastYearEnd,
      percentageChange: samePeriodLastYearPercentageChange
    }
  };

  // Cache the result
  setCachedData(cacheKey, finalResult);
  return finalResult;
}

export async function getTransactionsByCustomPeriod(period: 'month' | 'quarter' | 'year', customDate: Date) {
  const customYear = customDate.getFullYear();
  const customMonth = customDate.getMonth() + 1; // 1-12

  let periodStart: Date;
  let periodEnd: Date;

  if (period === 'month') {
    // Custom month
    periodStart = new Date(customYear, customMonth - 1, 1);
    periodEnd = new Date(customYear, customMonth, 0);
  } else if (period === 'quarter') {
    // Calculate custom quarter
    const customQuarter = Math.ceil(customMonth / 3);
    const quarterStartMonth = (customQuarter - 1) * 3;
    
    periodStart = new Date(customYear, quarterStartMonth, 1);
    periodEnd = new Date(customYear, quarterStartMonth + 3, 0);
  } else { // year
    // Custom financial year (Indian financial year starts from April 1st)
    periodStart = new Date(customYear, 2, 1); // April 1st
    periodEnd = new Date(customYear + 1, 1, 31); // March 31st next year
    
    // If custom month is Jan-Mar, financial year is previous year
    if (customMonth <= 3) {
      periodStart.setFullYear(customYear - 1);
      periodEnd.setFullYear(customYear);
    }
  }

  const formatDate = (date: Date) => date.toISOString().split('T')[0];

  return await db
    .select({
      transaction: entityTransactions,
      entity: entities,
      entityType: entityTypes,
    })
    .from(entityTransactions)
    .innerJoin(entities, eq(entityTransactions.entityId, entities.id))
    .innerJoin(entityTypes, eq(entities.typeId, entityTypes.id))
    .where(
      and(
        gte(entityTransactions.month, formatDate(periodStart)),
        lte(entityTransactions.month, formatDate(periodEnd))
      )
    )
    .orderBy(desc(entityTransactions.month));
} 

export async function getLandingPageSummaryStats() {
  // Total commissions, partners, product types, avg per transaction
  const [commissionResult, partnersResult, typesResult, countResult] = await Promise.all([
    db.select({ total: sql`COALESCE(SUM(${entityTransactions.amount}), 0)` }).from(entityTransactions),
    db.select({ count: sql`COUNT(*)` }).from(entities),
    db.select({ count: sql`COUNT(*)` }).from(entityTypes),
    db.select({ count: sql`COUNT(*)` }).from(entityTransactions)
  ]);
  const totalCommissions = parseFloat(commissionResult[0]?.total as string ?? '0');
  const totalPartners = parseInt(partnersResult[0]?.count as string ?? '0');
  const totalProductTypes = parseInt(typesResult[0]?.count as string ?? '0');
  const transactionCount = parseInt(countResult[0]?.count as string ?? '0');
  const avgCommissionPerTransaction = transactionCount > 0 ? totalCommissions / transactionCount : 0;
  return { totalCommissions, totalPartners, totalProductTypes, avgCommissionPerTransaction };
}

export async function getMonthlyCommissionTrend() {
  // Last 12 months commission totals in ascending order (oldest to newest)
  const result = await db.select({
    month: sql`DATE_TRUNC('month', ${entityTransactions.month})`,
    total: sql`SUM(${entityTransactions.amount})`
  })
    .from(entityTransactions)
    .groupBy(sql`DATE_TRUNC('month', ${entityTransactions.month})`)
    .orderBy(sql`DATE_TRUNC('month', ${entityTransactions.month}) DESC`)
    .limit(12);
  // Reverse to get ascending order (oldest to newest)
  return result.reverse().map(r => ({ month: r.month as string, total: parseFloat(r.total as string) }));
}

export async function getTopPartnersByCommission(limit = 5) {
  // Top N partners by total commission
  const result = await db.select({
    id: entities.id,
    name: entities.name,
    totalCommission: sql`SUM(${entityTransactions.amount})`
  })
    .from(entityTransactions)
    .innerJoin(entities, eq(entityTransactions.entityId, entities.id))
    .groupBy(entities.id, entities.name)
    .orderBy(sql`SUM(${entityTransactions.amount}) DESC`)
    .limit(limit);
  return result.map(r => ({ id: r.id, name: r.name, totalCommission: parseFloat(r.totalCommission as string) }));
}

export async function getRecentEntityTransactions(limit = 10) {
  // Most recent N entity transactions (with entity info)
  const result = await db.select({
    id: entityTransactions.id,
    entityId: entityTransactions.entityId,
    month: entityTransactions.month,
    amount: entityTransactions.amount,
    createdAt: entityTransactions.createdAt,
    entityName: entities.name,
    entityTypeId: entities.typeId
  })
    .from(entityTransactions)
    .innerJoin(entities, eq(entityTransactions.entityId, entities.id))
    .orderBy(entityTransactions.month)
    .limit(limit);
  return result;
} 

export async function getPartnerGrowthByMonth() {
  // Number of new partners added per month (last 12 months)
  const result = await db.select({
    month: sql`DATE_TRUNC('month', ${entities.createdAt})`,
    newPartners: sql`COUNT(*)`
  })
    .from(entities)
    .groupBy(sql`DATE_TRUNC('month', ${entities.createdAt})`)
    .orderBy(sql`DATE_TRUNC('month', ${entities.createdAt}) ASC`)
    .limit(12);
  return result.map(r => ({ month: r.month, newPartners: parseInt(r.newPartners as string) }));
}

export async function getProductTypeGrowthByMonth() {
  // Number of new product types added per month (last 12 months)
  const result = await db.select({
    month: sql`DATE_TRUNC('month', ${entityTypes.createdAt})`,
    newTypes: sql`COUNT(*)`
  })
    .from(entityTypes)
    .groupBy(sql`DATE_TRUNC('month', ${entityTypes.createdAt})`)
    .orderBy(sql`DATE_TRUNC('month', ${entityTypes.createdAt}) ASC`)
    .limit(12);
  return result.map(r => ({ month: r.month, newTypes: parseInt(r.newTypes as string) }));
} 