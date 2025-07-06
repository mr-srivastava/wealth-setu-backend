import { getTransactionsByPeriodData, getCommissionStatsByPeriodData } from "@/lib/db/analytics-server";
import PerformanceDashboard from "@/components/performance/PerformanceDashboard";

export default async function PerformancePage() {
  // Fetch initial data server-side (default to month)
  const [transactions, commissionStats] = await Promise.all([
    getTransactionsByPeriodData('month'),
    getCommissionStatsByPeriodData('month')
  ]);

  // Convert Date objects to strings for the component
  const commissionStatsWithStringDates = {
    ...commissionStats,
    currentPeriod: {
      ...commissionStats.currentPeriod,
      startDate: commissionStats.currentPeriod.startDate.toISOString(),
      endDate: commissionStats.currentPeriod.endDate.toISOString(),
    },
    previousPeriod: {
      ...commissionStats.previousPeriod,
      startDate: commissionStats.previousPeriod.startDate.toISOString(),
      endDate: commissionStats.previousPeriod.endDate.toISOString(),
    },
    samePeriodLastYear: {
      ...commissionStats.samePeriodLastYear,
      startDate: commissionStats.samePeriodLastYear.startDate.toISOString(),
      endDate: commissionStats.samePeriodLastYear.endDate.toISOString(),
    },
  };

  const initialData = {
    transactions,
    commissionStats: commissionStatsWithStringDates,
    period: 'month' as const
  };

  return <PerformanceDashboard initialData={initialData} />;
} 