import {
  getAllEntityTypes,
  getAllEntities,
  getAllEntityTransactions,
  getEntityTransactionStats,
  getCommissionStats,
  getRecentCommissionsData,
  getCommissionStatsByPeriod,
  getTransactionsByPeriod,
  getCommissionStatsByCustomPeriod,
  getTransactionsByCustomPeriod,
  getRecentEntityTransactions,
  getTopPartnersByCommission,
  getMonthlyCommissionTrend,
  getLandingPageSummaryStats,
} from "./utils";
import type {
  EntityTypeWithRelations,
  EntityWithRelations,
  EntityTransactionWithRelations,
  AnalyticsApiResponse,
  TransactionsApiResponse,
  CommissionStatsByPeriod
} from "./types";
import {
  validateEntityTypeArray,
  validateEntityArray,
  validateEntityTransactionArray,
  validateTransactionStats,
  validateCommissionStats,
  validateCommissionStatsByPeriod,
  validateRecentCommissionsData,
  validateAnalyticsApiResponse,
  validateTransactionsApiResponse
} from "../validation";

export async function getEntityTypes(): Promise<EntityTypeWithRelations[]> {
  try {
    const data = await getAllEntityTypes();
    return validateEntityTypeArray(data);
  } catch (error) {
    console.error("Error fetching entity types:", error);
    throw new Error("Failed to fetch entity types");
  }
}

export async function getEntities(): Promise<EntityWithRelations[]> {
  try {
    const data = await getAllEntities();
    return validateEntityArray(data);
  } catch (error) {
    console.error("Error fetching entities:", error);
    throw new Error("Failed to fetch entities");
  }
}

export async function getTransactions(): Promise<TransactionsApiResponse> {
  try {
    const [
      transactions,
      stats,
      commissionStats,
      recentCommissionsData
    ] = await Promise.all([
      getAllEntityTransactions(),
      getEntityTransactionStats(),
      getCommissionStats(),
      getRecentCommissionsData()
    ]);

    const response = {
      transactions: validateEntityTransactionArray(transactions),
      stats: validateTransactionStats(stats),
      commissionStats: validateCommissionStats(commissionStats),
      recentCommissionsData: validateRecentCommissionsData(recentCommissionsData)
    };

    return validateTransactionsApiResponse(response);
  } catch (error) {
    console.error("Error fetching transactions:", error);
    throw new Error("Failed to fetch transactions");
  }
}

export async function getAnalyticsData(): Promise<AnalyticsApiResponse> {

  try {
    const [entityTypes, entities, transactionsData] = await Promise.all([
      getEntityTypes(),
      getEntities(),
      getTransactions(),
    ]);

    const response = {
      entityTypes,
      entities,
      transactions: transactionsData.transactions,
      stats: transactionsData.stats,
      commissionStats: transactionsData.commissionStats,
      recentCommissionsData: transactionsData.recentCommissionsData,
    };

    return validateAnalyticsApiResponse(response);
  } catch (error) {
    console.error("Error fetching analytics data:", error);
    throw new Error("Failed to fetch analytics data");
  }
}

export async function getTransactionsByPeriodData(period: 'month' | 'quarter' | 'year'): Promise<EntityTransactionWithRelations[]> {
  try {
    const data = await getTransactionsByPeriod(period);
    return validateEntityTransactionArray(data);
  } catch (error) {
    console.error(`Error fetching transactions for ${period}:`, error);
    throw new Error(`Failed to fetch transactions for ${period}`);
  }
}

export async function getCommissionStatsByPeriodData(period: 'month' | 'quarter' | 'year'): Promise<CommissionStatsByPeriod> {
  try {
    const data = await getCommissionStatsByPeriod(period);
    return validateCommissionStatsByPeriod(data);
  } catch (error) {
    console.error(`Error fetching commission stats for ${period}:`, error);
    throw new Error(`Failed to fetch commission stats for ${period}`);
  }
}

export async function getCommissionStatsByCustomPeriodData(period: 'month' | 'quarter' | 'year', customDate: Date): Promise<CommissionStatsByPeriod> {
  try {
    const data = await getCommissionStatsByCustomPeriod(period, customDate);
    return validateCommissionStatsByPeriod(data);
  } catch (error) {
    console.error(`Error fetching commission stats for ${period} with custom date:`, error);
    throw new Error(`Error fetching commission stats for ${period} with custom date`);
  }
}

export async function getTransactionsByCustomPeriodData(period: 'month' | 'quarter' | 'year', customDate: Date): Promise<EntityTransactionWithRelations[]> {
  try {
    const data = await getTransactionsByCustomPeriod(period, customDate);
    return validateEntityTransactionArray(data);
  } catch (error) {
    console.error(`Error fetching transactions for ${period} with custom date:`, error);
    throw new Error(`Error fetching transactions for ${period} with custom date`);
  }
}

export function isEmptyAnalyticsData(data: AnalyticsApiResponse): boolean {
  return (
    data.entityTypes.length === 0 &&
    data.entities.length === 0 &&
    data.transactions.length === 0 &&
    data.stats.totalAmount === 0 &&
    data.stats.transactionCount === 0 &&
    data.commissionStats.totalCommissions === 0
  );
}

// Optimized analytics for landing page
export async function getLandingPageAnalytics() {
  try {
    // Fetch summary stats in parallel
    const [
      summaryStats,
      monthlyTrend,
      topPartners,
      recentTransactions,
    ] = await Promise.all([
      getLandingPageSummaryStats(),
      getMonthlyCommissionTrend(),
      getTopPartnersByCommission(5),
      getRecentEntityTransactions(10),
    ]);

    return {
      summaryStats,           // { totalCommissions, totalPartners, totalProductTypes, avgCommissionPerTransaction }
      monthlyTrend,           // [{ month, total }]
      topPartners,            // [{ id, name, totalCommission }]
      recentTransactions,     // [{ ...transaction }]
    };
  } catch (error) {
    console.error("Error fetching landing page analytics:", error);
    throw new Error("Failed to fetch landing page analytics");
  }
} 