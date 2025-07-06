'use client';

import { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { RefreshCw, AlertCircle, TrendingUp, TrendingDown, DollarSign, Calendar, Target, BarChart3 } from "lucide-react";
import { formatCurrency } from "@/components/analytics/types";
import { MonthlyTrendsChart } from "@/components/performance/MonthlyTrendsChart";
import LoadingOverlay from "@/components/performance/LoadingOverlay";
import { DatePicker } from "@/components/ui/date-picker";

type Period = 'month' | 'quarter' | 'year';

interface CommissionStats {
  period: Period;
  currentPeriod: {
    total: number;
    startDate: string;
    endDate: string;
  };
  previousPeriod: {
    total: number;
    startDate: string;
    endDate: string;
    percentageChange: number;
  };
  samePeriodLastYear: {
    total: number;
    startDate: string;
    endDate: string;
    percentageChange: number;
  };
}

interface Transaction {
  transaction: {
    id: string;
    entityId: string;
    month: string;
    amount: string;
    createdAt: Date;
    updatedAt: Date;
  };
  entity: {
    id: string;
    name: string;
    typeId: string;
    createdAt: Date;
    updatedAt: Date;
  };
  entityType: {
    id: string;
    name: string;
    createdAt: Date;
    updatedAt: Date;
  };
}

interface PerformanceData {
  transactions: Transaction[];
  commissionStats: CommissionStats;
  period: Period;
  customDate?: string | null;
}

interface PerformanceDashboardProps {
  initialData: PerformanceData;
}

export default function PerformanceDashboard({ initialData }: PerformanceDashboardProps) {
  const [period, setPeriod] = useState<Period>(initialData.period);
  const [data, setData] = useState<PerformanceData>(initialData);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [selectedDate, setSelectedDate] = useState<Date | undefined>(
    initialData.customDate ? new Date(initialData.customDate) : new Date()
  );

  const fetchData = async (selectedPeriod: Period, customDate?: Date) => {
    try {
      setLoading(true);
      setError(null);
      
      const params = new URLSearchParams({ period: selectedPeriod });
      if (customDate) {
        params.append('date', customDate.toISOString().split('T')[0]);
      }
      
      const response = await fetch(`/api/performance?${params}`);
      if (!response.ok) {
        throw new Error('Failed to fetch data');
      }
      
      const result = await response.json();
      setData(result);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load data');
    } finally {
      setLoading(false);
    }
  };

  const handlePeriodChange = (newPeriod: Period) => {
    if (newPeriod !== period) {
      setPeriod(newPeriod);
      fetchData(newPeriod, selectedDate);
    }
  };

  const handleDateChange = (date: Date | undefined) => {
    setSelectedDate(date);
    if (date) {
      fetchData(period, date);
    }
  };

  const handleRefresh = () => {
    fetchData(period, selectedDate);
  };

  const formatPercentage = (value: number) => {
    const sign = value >= 0 ? '+' : '';
    return `${sign}${value.toFixed(1)}%`;
  };

  const formatDateRange = (startDate: string, endDate: string) => {
    const start = new Date(startDate);
    const end = new Date(endDate);
    
    if (period === 'month') {
      return `${start.toLocaleDateString('en-US', { month: 'long', year: 'numeric' })}`;
    } else if (period === 'quarter') {
      const quarter = Math.ceil((start.getMonth() + 1) / 3);
      return `Q${quarter} ${start.getFullYear()}`;
    } else {
      return `FY ${start.getFullYear()}-${end.getFullYear()}`;
    }
  };

  const { transactions, commissionStats } = data;

  // Calculate performance metrics
  const totalCommissions = transactions.reduce((sum, t) => sum + parseFloat(t.transaction.amount), 0);
  const avgCommission = transactions.length > 0 ? totalCommissions / transactions.length : 0;
  const maxCommission = transactions.length > 0 ? Math.max(...transactions.map(t => parseFloat(t.transaction.amount))) : 0;
  const minCommission = transactions.length > 0 ? Math.min(...transactions.map(t => parseFloat(t.transaction.amount))) : 0;

  // Group by month for trend analysis
  const monthlyData = transactions.reduce((acc, t) => {
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
        {loading && <LoadingOverlay />}
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
                disabled={loading}
              >
                Month
              </Button>
              <Button 
                variant={period === 'quarter' ? 'default' : 'outline'} 
                size="sm"
                onClick={() => handlePeriodChange('quarter')}
                disabled={loading}
              >
                Quarter
              </Button>
              <Button 
                variant={period === 'year' ? 'default' : 'outline'} 
                size="sm"
                onClick={() => handlePeriodChange('year')}
                disabled={loading}
              >
                Year
              </Button>
              <DatePicker
                date={selectedDate}
                onDateChange={handleDateChange}
                placeholder={`Select ${period}`}
                disabled={loading}
              />
              <Button variant="outline" size="sm" onClick={handleRefresh} disabled={loading}>
                <RefreshCw className={`w-4 h-4 mr-2 ${loading ? 'animate-spin' : ''}`} />
                Refresh
              </Button>
            </div>
          </div>

          {/* Error Display */}
          {error && (
            <Alert>
              <AlertCircle className="h-4 w-4" />
              <AlertDescription>{error}</AlertDescription>
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
                      {formatCurrency(commissionStats.currentPeriod.total)}
                    </span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-sm font-medium">Previous {period.charAt(0).toUpperCase() + period.slice(1)}</span>
                    <span className="text-sm font-medium">
                      {formatCurrency(commissionStats.previousPeriod.total)}
                    </span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-sm font-medium">Growth vs Previous</span>
                    <span className={`text-sm font-medium ${commissionStats.previousPeriod.percentageChange >= 0
                      ? 'text-green-600'
                      : 'text-red-600'
                      }`}>
                      {formatPercentage(commissionStats.previousPeriod.percentageChange)}
                    </span>
                  </div>
                </div>
                <div className="space-y-4">
                  <div className="flex justify-between items-center">
                    <span className="text-sm font-medium">Same {period.charAt(0).toUpperCase() + period.slice(1)} Last Year</span>
                    <span className="text-sm font-medium">
                      {formatCurrency(commissionStats.samePeriodLastYear.total)}
                    </span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-sm font-medium">Year-over-Year Growth</span>
                    <span className={`text-sm font-medium ${commissionStats.samePeriodLastYear.percentageChange >= 0
                      ? 'text-green-600'
                      : 'text-red-600'
                      }`}>
                      {formatPercentage(commissionStats.samePeriodLastYear.percentageChange)}
                    </span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-sm font-medium">Period Range</span>
                    <span className="text-sm font-medium">
                      {formatDateRange(commissionStats.currentPeriod.startDate, commissionStats.currentPeriod.endDate)}
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