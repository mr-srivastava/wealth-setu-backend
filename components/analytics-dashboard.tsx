"use client";
import { useQuery } from "@tanstack/react-query";
import React from "react";
import { KeyMetrics } from "./analytics/KeyMetrics";
import { MonthlyCommissionTrendChart } from "./analytics/MonthlyCommissionTrendChart";
import { TopPartnersBarChart } from "./analytics/TopPartnersBarChart";
import { RecentTransactionsTable } from "./analytics/RecentTransactionsTable";
import { Card, CardContent } from "./ui/card";
import type { RecentTransaction } from './analytics/RecentTransactionsTable';

// Custom tooltip for charts
export interface CustomTooltipProps {
  active?: boolean;
  payload?: Array<{ value: number; name: string; dataKey: string }>;
  label?: string | number;
  valueFormatter?: (value: number) => string | number;
}
export function CustomTooltip({
  active,
  payload,
  label,
  valueFormatter,
}: CustomTooltipProps) {
  const labelDate = label ? new Date(label) : null;
  if (!active || !payload || payload.length === 0 || !labelDate) return null;
  return (
    <Card className="rounded-lg border bg-background p-3 shadow-xl text-xs min-w-[8rem]">
      <div className="font-medium mb-1">
        {labelDate.toLocaleDateString("en-US", {
          month: "short",
          year: "2-digit",
        })}
      </div>
      <CardContent>
        {payload.map((item) => (
          <div key={item.dataKey} className="flex items-center justify-between">
            <span className="font-mono font-medium">
              {valueFormatter ? valueFormatter(item.value) : item.value}
            </span>
          </div>
        ))}
      </CardContent>
    </Card>
  );
}

export interface AnalyticsDashboardServerProps {
  summaryStats: {
    totalCommissions: number;
    totalPartners: number;
    totalProductTypes: number;
    avgCommissionPerTransaction: number;
  };
  monthlyTrend: { month: string; total: number }[];
  topPartners: { id: string; name: string; totalCommission: number }[];
  recentTransactions: unknown[];
}

export function AnalyticsDashboardServer({
  summaryStats,
  monthlyTrend,
  topPartners,
  recentTransactions,
}: AnalyticsDashboardServerProps) {
  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-2xl font-bold">Analytics Overview</h2>
          <p className="text-muted-foreground">
            Key metrics and recent activity
          </p>
        </div>
      </div>
      {/* Key Metrics */}
      <KeyMetrics summaryStats={summaryStats} />
      {/* Monthly Commission Trend (Line Chart) */}
      <MonthlyCommissionTrendChart monthlyTrend={monthlyTrend} />
      {/* Top Partners (Bar Chart) */}
      <TopPartnersBarChart topPartners={topPartners} />
      {/* Recent Transactions */}
      <RecentTransactionsTable recentTransactions={recentTransactions as RecentTransaction[]} />
    </div>
  );
}

export function AnalyticsDashboardClient() {
  const { data, isLoading, error } = useQuery<AnalyticsDashboardServerProps>({
    queryKey: ["analytics-data"],
    queryFn: async () => {
      const res = await fetch("/api/analytics/entities");
      if (!res.ok) throw new Error("Failed to fetch analytics data");
      const json = await res.json();
      return json.data;
    },
  });

  if (isLoading) {
    return <div className="text-center py-10">Loading analytics data...</div>;
  }
  if (error) {
    return (
      <div className="text-center py-10 text-red-500">
        {(error as Error).message}
      </div>
    );
  }
  if (!data) {
    return (
      <div className="text-center py-10">No analytics data available.</div>
    );
  }
  // Use the new optimized analytics fields
  return <AnalyticsDashboardServer {...data} />;
}
