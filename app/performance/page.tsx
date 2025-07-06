import { getTransactionsByPeriodData, getCommissionStatsByPeriodData } from "@/lib/db/analytics-server";
import PerformanceDashboard from "@/components/performance/PerformanceDashboard";

export default async function PerformancePage() {
  // Fetch initial data server-side (default to month)
  const [transactions, commissionStats] = await Promise.all([
    getTransactionsByPeriodData('month'),
    getCommissionStatsByPeriodData('month')
  ]);

  const initialData = {
    transactions,
    commissionStats,
    period: 'month' as const
  };

  return <PerformanceDashboard initialData={initialData} />;
} 