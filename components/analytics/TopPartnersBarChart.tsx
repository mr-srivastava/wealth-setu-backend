import React from "react";
import { ChartContainer } from "@/components/ui/chart";
import { BarChart, Bar, CartesianGrid, XAxis, YAxis, Tooltip as RechartsTooltip, Legend } from "recharts";
import { CustomTooltip } from "../analytics-dashboard";

interface TopPartnersBarChartProps {
  topPartners: { id: string; name: string; totalCommission: number }[];
}

export function TopPartnersBarChart({ topPartners }: TopPartnersBarChartProps) {
  return (
    <div>
      <h3 className="text-xl font-semibold mb-2">Top Partners</h3>
      <ChartContainer
        config={{ totalCommission: { label: "Commission", color: "var(--chart-1)" } }}
        className="min-h-[320px] w-full"
      >
        <BarChart data={topPartners} layout="vertical">
          <CartesianGrid vertical={false} />
          <XAxis
            type="number"
            tickFormatter={(value) => `₹${Number(value).toLocaleString('en-IN')}`}
            width={100}
          />
          <YAxis
            dataKey="name"
            type="category"
            tickLine={false}
            axisLine={false}
            width={100}
          />
          <RechartsTooltip
            content={props => (
              <CustomTooltip
                {...props}
                valueFormatter={(v: number) => `₹${Number(v).toLocaleString('en-IN')}`}
              />
            )}
          />
          <Legend />
          <Bar dataKey="totalCommission" fill="var(--chart-1)" radius={4} name="Commission" />
        </BarChart>
      </ChartContainer>
    </div>
  );
} 