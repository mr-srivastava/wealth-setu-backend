'use client';

import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { RefreshCw, AlertCircle, TrendingUp, TrendingDown, DollarSign, Calendar, Target, BarChart3 } from "lucide-react";
import { formatCurrency } from "@/components/analytics/types";
import { MonthlyTrendsChart } from "@/components/performance/MonthlyTrendsChart";
import LoadingOverlay from "@/components/performance/LoadingOverlay";
import { DatePicker } from "@/components/ui/date-picker";
import type { EntityTransactionWithRelations, CommissionStatsByPeriod } from '@/lib/db/types';

type Period = 'month' | 'quarter' | 'year';

interface PerformanceData {
  transactions: EntityTransactionWithRelations[];
  commissionStats: CommissionStatsByPeriod;
  period: Period;
  customDate?: string | null;
}

interface PerformanceDashboardProps {
  initialData: PerformanceData;
}

export default function PerformanceDashboard({ initialData }: PerformanceDashboardProps) {
  const [period, setPeriod] = useState<Period>(initialData.period);
  const [selectedDate, setSelectedDate] = useState<Date | undefined>(
    initialData.customDate ? new Date(initialData.customDate) : new Date()
  );

  const queryKey = ["performance-data", period, selectedDate?.toISOString()];
  const { data, isLoading, error, refetch } = useQuery<PerformanceData>({
    queryKey,
    queryFn: async () => {
      const params = new URLSearchParams({ period });
      if (selectedDate) {
        params.append('date', selectedDate.toISOString().split('T')[0]);
      }
      const response = await fetch(`/api/performance?${params}`);
      if (!response.ok) throw new Error('Failed to fetch data');
      return response.json();
    },
    initialData: initialData,
  });

  const handlePeriodChange = (newPeriod: Period) => {
    if (newPeriod !== period) {
      setPeriod(newPeriod);
    }
  };

  const handleDateChange = (date: Date | undefined) => {
    setSelectedDate(date);
  };

  const handleRefresh = () => {
    refetch();
  };

  const formatPercentage = (value: number) => {
    const sign = value >= 0 ? '+' : '';
    return `${sign}${value.toFixed(1)}%`;
  };

  const formatDateRange = (startDate: string | Date, endDate: string | Date) => {
    const start = typeof startDate === 'string' ? new Date(startDate) : startDate;
    const end = typeof endDate === 'string' ? new Date(endDate) : endDate;
    return `${start.toLocaleDateString()} - ${end.toLocaleDateString()}`;
  };

  const transactions = data?.transactions || [];
  const commissionStats = data?.commissionStats;

  // Calculate performance metrics
  const totalCommissions = transactions.reduce((sum: number, t: EntityTransactionWithRelations) => sum + parseFloat(t.transaction.amount), 0);
  const avgCommission = transactions.length > 0 ? totalCommissions / transactions.length : 0;
  const maxCommission = transactions.length > 0 ? Math.max(...transactions.map((t: EntityTransactionWithRelations) => parseFloat(t.transaction.amount))) : 0;
  const minCommission = transactions.length > 0 ? Math.min(...transactions.map((t: EntityTransactionWithRelations) => parseFloat(t.transaction.amount))) : 0;

  // Group by month for trend analysis
  const monthlyData = transactions.reduce((acc: Record<string, { total: number; count: number }>, t: EntityTransactionWithRelations) => {
    const month = new Date(t.transaction.month).toISOString().slice(0, 7);
    if (!acc[month]) {
      acc[month] = { total: 0, count: 0 };
    }
    acc[month].total += parseFloat(t.transaction.amount);
    acc[month].count += 1;
    return acc;
  }, {} as Record<string, { total: number; count: number }>);

  const monthlyTrends = Object.entries(monthlyData)
    .sort(([a], [b]) => a.localeCompare(b))
    .map(([month, data]) => {
      const d = data as { total: number; count: number };
      return {
        month,
        total: d.total,
        count: d.count,
        average: d.count > 0 ? d.total / d.count : 0
      };
    });

  return (
    <div className="flex h-screen w-full">
      <div className="flex-1 overflow-auto w-full relative">
        {isLoading && <LoadingOverlay />}
        <div className="p-6 space-y-6">
          {/* Header */}
          <div className="flex justify-between items-center">
            <div>
              <h1 className="text-3xl font-bold">Performance</h1>
              <p className="text-muted-foreground">
                Track your commission performance and trends
              </p>
            </div>
            <div className="flex gap-2 items-center">
              <Button 
                variant={period === 'month' ? 'default' : 'outline'} 
                size="sm"
                onClick={() => handlePeriodChange('month')}
                disabled={isLoading}
              >
                Month
              </Button>
              <Button 
                variant={period === 'quarter' ? 'default' : 'outline'} 
                size="sm"
                onClick={() => handlePeriodChange('quarter')}
                disabled={isLoading}
              >
                Quarter
              </Button>
              <Button 
                variant={period === 'year' ? 'default' : 'outline'} 
                size="sm"
                onClick={() => handlePeriodChange('year')}
                disabled={isLoading}
              >
                Year
              </Button>
              <DatePicker
                date={selectedDate instanceof Date ? selectedDate : undefined}
                onDateChange={handleDateChange}
                placeholder={`Select ${period}`}
                disabled={isLoading}
              />
              <Button variant="outline" size="sm" onClick={handleRefresh} disabled={isLoading}>
                <RefreshCw className={`w-4 h-4 mr-2 ${isLoading ? 'animate-spin' : ''}`} />
                Refresh
              </Button>
            </div>
          </div>

          {/* Error Display */}
          {error && (
            <Alert>
              <AlertCircle className="h-4 w-4" />
              <AlertDescription>{error instanceof Error ? error.message : error}</AlertDescription>
            </Alert>
          )}

          {/* Key Performance Indicators */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Total Commissions</CardTitle>
                <DollarSign className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{formatCurrency(totalCommissions)}</div>
                <p className="text-xs text-muted-foreground">
                  {transactions.length} transactions
                </p>
              </CardContent>
            </Card>
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Average Commission</CardTitle>
                <Target className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{formatCurrency(avgCommission)}</div>
                <p className="text-xs text-muted-foreground">
                  Per transaction
                </p>
              </CardContent>
            </Card>
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Highest Commission</CardTitle>
                <TrendingUp className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{formatCurrency(maxCommission)}</div>
                <p className="text-xs text-muted-foreground">
                  Peak performance
                </p>
              </CardContent>
            </Card>
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Lowest Commission</CardTitle>
                <TrendingDown className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{formatCurrency(minCommission)}</div>
                <p className="text-xs text-muted-foreground">
                  Minimum recorded
                </p>
              </CardContent>
            </Card>
          </div>

          {/* Period Comparison */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Calendar className="w-5 h-5" />
                {period.charAt(0).toUpperCase() + period.slice(1)} Performance Comparison
              </CardTitle>
              <CardDescription>
                Current {period} vs Previous {period} and Same {period} Last Year
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-4">
                  <div className="flex justify-between items-center">
                    <span className="text-sm font-medium">Current {period.charAt(0).toUpperCase() + period.slice(1)}</span>
                    <span className="text-sm font-medium">
                      {formatCurrency(commissionStats?.currentPeriod.total)}
                    </span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-sm font-medium">Previous {period.charAt(0).toUpperCase() + period.slice(1)}</span>
                    <span className="text-sm font-medium">
                      {formatCurrency(commissionStats?.previousPeriod.total)}
                    </span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-sm font-medium">Growth vs Previous</span>
                    <span className={`text-sm font-medium ${commissionStats?.previousPeriod.percentageChange >= 0
                      ? 'text-green-600'
                      : 'text-red-600'
                      }`}>
                      {formatPercentage(commissionStats?.previousPeriod.percentageChange)}
                    </span>
                  </div>
                </div>
                <div className="space-y-4">
                  <div className="flex justify-between items-center">
                    <span className="text-sm font-medium">Same {period.charAt(0).toUpperCase() + period.slice(1)} Last Year</span>
                    <span className="text-sm font-medium">
                      {formatCurrency(commissionStats?.samePeriodLastYear.total)}
                    </span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-sm font-medium">Year-over-Year Growth</span>
                    <span className={`text-sm font-medium ${commissionStats?.samePeriodLastYear.percentageChange >= 0
                      ? 'text-green-600'
                      : 'text-red-600'
                      }`}>
                      {formatPercentage(commissionStats?.samePeriodLastYear.percentageChange)}
                    </span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-sm font-medium">Period Range</span>
                    <span className="text-sm font-medium">
                      {commissionStats?.currentPeriod && commissionStats?.currentPeriod.startDate && commissionStats?.currentPeriod.endDate
                        ? formatDateRange(commissionStats.currentPeriod.startDate, commissionStats.currentPeriod.endDate)
                        : ''}
                    </span>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Monthly Trends */}
          {monthlyTrends.length > 0 && (
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <BarChart3 className="w-5 h-5" />
                  Monthly Trends
                </CardTitle>
                <CardDescription>
                  Commission performance over the selected period
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="mb-6">
                  <MonthlyTrendsChart data={monthlyTrends.slice(-12)} />
                </div>
              </CardContent>
            </Card>
          )}
        </div>
      </div>
    </div>
  );
} 