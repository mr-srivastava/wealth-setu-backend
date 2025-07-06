import { AnalyticsDashboardServer } from "@/components/analytics-dashboard";
import { getAnalyticsData } from "@/lib/db/analytics-server";

// Force dynamic rendering to prevent build-time database queries
export const dynamic = 'force-dynamic';

export default async function HomePage() {
  let data;
  
  try {
    data = await getAnalyticsData();
  } catch (error) {
    console.error("Error fetching analytics data:", error);
    // Return a loading state or error state instead of failing the build
    return (
      <div className="flex min-h-screen flex-col items-center justify-center py-2">
        <div className="flex-1 w-full max-w-5xl px-3 py-10">
          <div className="text-center">
            <h1 className="text-2xl font-bold mb-4">Wealth Setu</h1>
            <p className="text-gray-600">Loading analytics data...</p>
          </div>
        </div>
      </div>
    );
  }
  
  return (
    <div className="flex min-h-screen flex-col items-center justify-center py-2">
      <div className="flex-1 w-full max-w-5xl px-3 py-10">
        <AnalyticsDashboardServer {...data} />
      </div>
    </div>
  );
}
