import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";
import { CommissionStats } from "./types";
import { TrendingUp, TrendingDown, Info } from "lucide-react";

interface OverviewCardsProps {
  commissionStats: CommissionStats | null;
}

interface CardData {
  title: string;
  tooltip: string;
  badgeVariant: "default" | "secondary" | "outline" | "destructive";
  getValue: (commissionStats: CommissionStats | null) => string;
  getSubtitle: () => string;
  showTrend?: boolean;
  getTrendData?: (commissionStats: CommissionStats | null) => {
    percentageChange: number;
    label: string;
  } | null;
}

export function OverviewCards({ commissionStats }: OverviewCardsProps) {
  const formatCurrency = (amount: number | string) => {
    const num = typeof amount === 'string' ? parseFloat(amount) : amount;
    return new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: 'INR',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(num);
  };

  const formatPercentage = (value: number) => {
    const sign = value >= 0 ? '+' : '';
    return `${sign}${value.toFixed(1)}%`;
  };

  const getPercentageColor = (value: number) => {
    if (value >= 0) return 'text-green-600';
    return 'text-red-600';
  };

  const cardData: CardData[] = [
    {
      title: "Total Commissions",
      tooltip: "Total commissions earned since the beginning",
      badgeVariant: "default",
      getValue: (commissionStats) => commissionStats ? formatCurrency(commissionStats.totalCommissions) : '₹0',
      getSubtitle: () => "Till date"
    },
    {
      title: "This Financial Year",
      tooltip: "Commissions earned in the current financial year",
      badgeVariant: "secondary",
      getValue: (commissionStats) => commissionStats ? formatCurrency(commissionStats.currentFinancialYear.total) : '₹0',
      getSubtitle: () => "",
      showTrend: true,
      getTrendData: (commissionStats) => commissionStats ? {
        percentageChange: commissionStats.currentFinancialYear.percentageChange,
        label: "from last FY"
      } : null
    },
    {
      title: "This Month",
      tooltip: "Commissions earned in the current month",
      badgeVariant: "outline",
      getValue: (commissionStats) => commissionStats ? formatCurrency(commissionStats.currentMonth.total) : '₹0',
      getSubtitle: () => "",
      showTrend: true,
      getTrendData: (commissionStats) => commissionStats ? {
        percentageChange: commissionStats.currentMonth.percentageChange,
        label: "from last year"
      } : null
    },
    {
      title: "Monthly Average",
      tooltip: "Average monthly commission based on current FY",
      badgeVariant: "destructive",
      getValue: (commissionStats) => commissionStats ? formatCurrency(commissionStats.monthlyAverage) : '₹0',
      getSubtitle: () => "Based on current FY"
    }
  ];

  return (
    <TooltipProvider>
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        {cardData.map((card, index) => (
          <Card key={index}>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">{card.title}</CardTitle>
              <Tooltip>
                <TooltipTrigger asChild>
                  <Badge variant={card.badgeVariant} className="cursor-help">
                    <Info className="w-2 h-2" />
                  </Badge>
                </TooltipTrigger>
                <TooltipContent>
                  <p>{card.tooltip}</p>
                </TooltipContent>
              </Tooltip>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">
                {card.getValue(commissionStats)}
              </div>
              {card.showTrend && card.getTrendData ? (
                <div className="flex items-center mt-2">
                  {(() => {
                    const trendData = card.getTrendData!(commissionStats);
                    if (!trendData) return null;

                    return (
                      <>
                        {trendData.percentageChange >= 0 ? (
                          <TrendingUp className="w-4 h-4 text-green-600 mr-1" />
                        ) : (
                          <TrendingDown className="w-4 h-4 text-red-600 mr-1" />
                        )}
                        <p className={`text-xs ${getPercentageColor(trendData.percentageChange)}`}>
                          {formatPercentage(trendData.percentageChange)} {trendData.label}
                        </p>
                      </>
                    );
                  })()}
                </div>
              ) : (
                <p className="text-xs text-muted-foreground mt-2">
                  {card.getSubtitle()}
                </p>
              )}
            </CardContent>
          </Card>
        ))}
      </div>
    </TooltipProvider>
  );
} 