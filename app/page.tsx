import { AnalyticsDashboardServer } from "@/components/analytics-dashboard";
import { getAnalyticsData } from "@/lib/db/analytics-server";

export default async function HomePage() {
  const data = await getAnalyticsData();
  
  return (
    <div className="flex min-h-screen flex-col items-center justify-center py-2">
      <div className="flex-1 w-full max-w-5xl px-3 py-10">
        <AnalyticsDashboardServer {...data} />
      </div>
    </div>
  );
}
