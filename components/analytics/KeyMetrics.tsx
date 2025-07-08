import React from "react";
import { Card, CardContent, CardTitle } from "../ui/card";

interface KeyMetricsProps {
  summaryStats: {
    totalCommissions: number;
    totalPartners: number;
    totalProductTypes: number;
    avgCommissionPerTransaction: number;
  };
}

const SUMMARY_DATA = new Map<string, { label: string; isCurrency: boolean }>([
  ["totalCommissions", { label: "Total Commissions", isCurrency: true }],
  ["totalPartners", { label: "Partners", isCurrency: false }],
  ["totalProductTypes", { label: "Product Types", isCurrency: false }],
  [
    "avgCommissionPerTransaction",
    { label: "Avg per Transaction", isCurrency: true },
  ],
]);

export function KeyMetrics({ summaryStats }: KeyMetricsProps) {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
      {Array.from(SUMMARY_DATA.entries()).map(
        ([key, { label, isCurrency }]) => {
          const value = summaryStats[key as keyof typeof summaryStats];
          return (
            <Card key={key} className="bg-card rounded-lg p-4">
              <CardTitle className="font-regular">{label}</CardTitle>
              <CardContent>
                <div className="text-3xl text-center font-bold">
                  {isCurrency ? (
                    <>
                      ₹
                      {Number(value).toLocaleString("en-IN", {
                        maximumFractionDigits: 0,
                      })}
                    </>
                  ) : (
                    value
                  )}
                </div>
              </CardContent>
            </Card>
          );
        }
      )}
    </div>
  );
}
