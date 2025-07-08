import React from "react";
import { ChartContainer } from "@/components/ui/chart";
import {
  LineChart,
  Line,
  CartesianGrid,
  XAxis,
  YAxis,
  Tooltip as RechartsTooltip,
  Legend,
} from "recharts";
import { CustomTooltip } from "../analytics-dashboard";
import { Card, CardContent, CardTitle } from "../ui/card";

interface MonthlyCommissionTrendChartProps {
  monthlyTrend: { month: string; total: number }[];
}

export function MonthlyCommissionTrendChart({
  monthlyTrend,
}: MonthlyCommissionTrendChartProps) {
  return (
    <Card className="p-8">
      <CardTitle>
        <h3 className="text-xl font-semibold mb-2">Monthly Commission Trend</h3>
      </CardTitle>
      <CardContent>
        <ChartContainer
          config={{ total: { label: "Commission", color: "var(--chart-1)" } }}
          className="min-h-[320px] w-full"
        >
          <LineChart data={monthlyTrend}>
            <CartesianGrid vertical={false} />
            <XAxis
              dataKey="month"
              tickLine={false}
              axisLine={false}
              tickMargin={8}
              minTickGap={32}
              tickFormatter={(value) => {
                const date = new Date(value);
                return date.toLocaleDateString("en-US", {
                  month: "short",
                  year: "2-digit",
                });
              }}
            />
            <YAxis
              tickFormatter={(value) =>
                new Intl.NumberFormat("en-IN", {
                  maximumFractionDigits: 0,
                }).format(value)
              }
              width={60}
              domain={[
                (dataMin: number) => Math.floor((dataMin * 0.95) / 5000) * 5000,
                (dataMax: number) => Math.ceil((dataMax * 1.1) / 5000) * 5000,
              ]}
            />
            <RechartsTooltip
              content={({ active, payload, label }) => (
                <CustomTooltip
                  active={active}
                  payload={payload}
                  label={label}
                  valueFormatter={(v: number) =>
                    `₹${Number(v).toLocaleString("en-IN")}`
                  }
                />
              )}
            />
            <Legend />
            <Line
              type="monotone"
              dataKey="total"
              stroke="var(--chart-1)"
              strokeWidth={2}
              dot={{ r: 4 }}
              name="Commission"
            />
          </LineChart>
        </ChartContainer>
      </CardContent>
    </Card>
  );
}
