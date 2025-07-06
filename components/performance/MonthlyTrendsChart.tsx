"use client";

import { ChartContainer } from "@/components/ui/chart";
import { BarChart, CartesianGrid, XAxis, YAxis, Bar, Line, ReferenceLine, Tooltip as RechartsTooltip } from "recharts";

interface MonthlyTrendsChartProps {
  data: Array<{ month: string; total: number; count: number }>;
}

export function MonthlyTrendsChart({ data }: MonthlyTrendsChartProps) {
  const average = data.length > 0 ? data.reduce((sum, d) => sum + d.total, 0) / data.length : 0;
  const formattedAverage = new Intl.NumberFormat('en-IN', {
    style: 'currency',
    currency: 'INR',
    maximumFractionDigits: 0,
    minimumFractionDigits: 0,
  }).format(average);
  return (
    <ChartContainer
      config={{
        total: { label: "Commission", color: "var(--chart-1)" },
        count: { label: "Transactions", color: "var(--chart-3)" },
      }}
      className="min-h-[320px] w-full"
    >
      <BarChart data={data}>
        <CartesianGrid vertical={false} />
        <XAxis
          dataKey="month"
          tickLine={false}
          axisLine={false}
          tickMargin={8}
          minTickGap={32}
          tickFormatter={(value) => {
            const date = new Date(value + "-01");
            return date.toLocaleDateString("en-US", { month: "short", year: "2-digit" });
          }}
        />
        <YAxis
          yAxisId="left"
          orientation="left"
          tickFormatter={(value) =>
            new Intl.NumberFormat('en-IN', { maximumFractionDigits: 0 }).format(value)
          }
          width={60}
        />
        <YAxis
          yAxisId="right"
          orientation="right"
          tickFormatter={(value) => value}
          width={40}
        />
        <RechartsTooltip
          content={({ active, payload, label }) => {
            if (!active || !payload || payload.length === 0) return null;
            const commission = payload.find((p) => p.dataKey === 'total');
            const count = payload.find((p) => p.dataKey === 'count');
            return (
              <div className="rounded-lg border bg-background p-3 shadow-xl text-xs min-w-[8rem]">
                <div className="font-medium mb-1">{label && new Date(label + "-01").toLocaleDateString("en-US", { month: "short", year: "2-digit" })}</div>
                {commission && (
                  <div className="flex items-center justify-between">
                    <span>Commission</span>
                    <span className="font-mono font-medium">{new Intl.NumberFormat('en-IN', { style: 'currency', currency: 'INR', maximumFractionDigits: 0, minimumFractionDigits: 0 }).format(commission.value)}</span>
                  </div>
                )}
                {count && (
                  <div className="flex items-center justify-between">
                    <span>Transactions</span>
                    <span className="font-mono font-medium">{count.value}</span>
                  </div>
                )}
              </div>
            );
          }}
        />
        <Bar yAxisId="left" dataKey="total" fill="var(--chart-1)" radius={4} name="Commission" />
        <Line yAxisId="right" type="monotone" dataKey="count" stroke="var(--chart-3)" strokeWidth={2} dot={{ r: 3 }} name="Transactions" />
        <ReferenceLine
          y={average}
          stroke="white"
          strokeDasharray="6 6"
          label={{ value: formattedAverage, position: "top", fill: "white", fontSize: 12 }}
        />
      </BarChart>
    </ChartContainer>
  );
} 