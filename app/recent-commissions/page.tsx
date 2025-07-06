import { Suspense } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { RecentCommissionsTable } from "@/components/analytics/recent-commissions-table";
import { getTransactions } from "@/lib/db/analytics-server";
import { RecentCommissionsData } from "@/components/analytics/types";
import { isDate } from "@/lib/db/types";

export default async function RecentCommissionsPage() {
  const transactionsData = await getTransactions();
  
  // Convert Date objects to strings to match the expected types
  const transactions = transactionsData.recentCommissionsData.transactions.map((item) => ({
    transaction: {
      ...item.transaction,
      createdAt: isDate(item.transaction.createdAt) ? item.transaction.createdAt.toISOString() : String(item.transaction.createdAt),
      updatedAt: isDate(item.transaction.updatedAt) ? item.transaction.updatedAt.toISOString() : String(item.transaction.updatedAt),
    },
    entity: {
      ...item.entity,
      createdAt: isDate(item.entity.createdAt) ? item.entity.createdAt.toISOString() : String(item.entity.createdAt),
      updatedAt: isDate(item.entity.updatedAt) ? item.entity.updatedAt.toISOString() : String(item.entity.updatedAt),
    },
    entityType: {
      ...item.entityType,
      createdAt: isDate(item.entityType.createdAt) ? item.entityType.createdAt.toISOString() : String(item.entityType.createdAt),
      updatedAt: isDate(item.entityType.updatedAt) ? item.entityType.updatedAt.toISOString() : String(item.entityType.updatedAt),
    },
  }));

  const recentCommissionsData: RecentCommissionsData = {
    transactions: transactions as unknown as RecentCommissionsData['transactions'], // Type assertion needed due to Date vs string mismatch
    grandTotal: transactionsData.recentCommissionsData.grandTotal,
    entityTypeTotals: transactionsData.recentCommissionsData.entityTypeTotals,
  };

  return (
    <div className="flex-1 flex flex-col gap-6 p-6 bg-background">
      <div className="flex flex-col gap-4">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Recent Commissions</h1>
          <p className="text-muted-foreground">
            Track your recent commission earnings and transactions.
          </p>
        </div>
        
        <Card>
          <CardHeader>
            <CardTitle>Recent Commission Transactions</CardTitle>
            <CardDescription>
              Latest commission transactions from your portfolio.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Suspense fallback={<div>Loading recent commissions...</div>}>
              <RecentCommissionsTable recentCommissionsData={recentCommissionsData} />
            </Suspense>
          </CardContent>
        </Card>
      </div>
    </div>
  );
} 