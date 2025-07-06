import { Alert, AlertDescription } from "@/components/ui/alert";
import { Separator } from "@/components/ui/separator";
import { AlertCircle } from "lucide-react";
import { OverviewCards } from "./analytics/overview-cards";
import { RecentCommissionsTable } from "./analytics/recent-commissions-table";
import { TransactionStats, CommissionStats, RecentCommissionsData, EntityType, Entity, EntityTransaction } from "./analytics/types";

interface AnalyticsDashboardServerProps {
  entityTypes: EntityType[];
  entities: Entity[];
  transactions: EntityTransaction[];
  stats: TransactionStats;
  commissionStats: CommissionStats;
  recentCommissionsData: RecentCommissionsData;
}

export function AnalyticsDashboardServer({
  commissionStats,
  recentCommissionsData,
}: AnalyticsDashboardServerProps) {
  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-2xl font-bold">Analytics Overview</h2>
          <p className="text-muted-foreground">Key metrics and recent activity</p>
        </div>
      </div>

      {/* Commission Overview Cards */}
      <OverviewCards commissionStats={commissionStats} />

      <Separator />

      {/* Recent Commissions */}
      <div className="space-y-4">
        <div>
          <h3 className="text-xl font-semibold">Recent Commissions</h3>
          <p className="text-muted-foreground">Latest commission entries and trends</p>
        </div>
        {recentCommissionsData && recentCommissionsData.transactions.length > 0 ? (
          <RecentCommissionsTable recentCommissionsData={recentCommissionsData} />
        ) : (
          <Alert>
            <AlertCircle className="h-4 w-4" />
            <AlertDescription>
              No recent commission data available.
            </AlertDescription>
          </Alert>
        )}
      </div>
    </div>
  );
} 