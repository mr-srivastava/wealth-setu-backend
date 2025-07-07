"use client";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { RefreshCw, AlertCircle, BarChart3, PieChart, TrendingUp, DollarSign, Building2, Package } from "lucide-react";
import { getAnalyticsData, isEmptyAnalyticsData } from "@/lib/db/analytics-server";
import { formatCurrency } from "@/components/analytics/types";
import { AnalyticsDashboardClient } from "@/components/analytics-dashboard";
import type { EntityType, EntityWithRelations, EntityTransactionWithRelations, CommissionStats } from "@/lib/db/types";

export default async function AnalyticsPage() {
  let entityTypesData: EntityType[] = [];
  let entitiesData: EntityWithRelations[] = [];
  let transactionsData: EntityTransactionWithRelations[] = [];
  let commissionStats: CommissionStats | null = null;
  let data = null;
  let error: string | null = null;

  // Timeout utility
  async function fetchWithTimeout<T>(promise: Promise<T>, ms: number): Promise<T> {
    const timeout = new Promise<never>((_, reject) =>
      setTimeout(() => reject(new Error("Timeout")), ms)
    );
    return Promise.race([promise, timeout]);
  }

  try {
    data = await fetchWithTimeout(getAnalyticsData(), 5000); // 5s timeout
    entityTypesData = data.entityTypes || [];
    entitiesData = data.entities || [];
    transactionsData = data.transactions || [];
    commissionStats = data.commissionStats || null;
  } catch (err) {
    error = err instanceof Error ? err.message : "Failed to load data";
    data = null;
  }

  if (error) {
    return (
      <div className="flex h-screen w-full">
        <div className="flex-1 p-6 w-full">
          <Alert>
            <AlertCircle className="h-4 w-4" />
            <AlertDescription>
              Error loading analytics data. Please try again.
            </AlertDescription>
          </Alert>
        </div>
      </div>
    );
  }

  // If data is empty (build-time or timeout), fetch on client
  if (!data || isEmptyAnalyticsData(data)) {
    return <AnalyticsDashboardClient />;
  }

  // Calculate analytics metrics
  const totalCommissions = transactionsData.reduce((sum, t) => sum + parseFloat(t.transaction.amount), 0);
  const totalPartners = entitiesData.length;
  const totalProductTypes = entityTypesData.length;
  const avgCommissionPerTransaction = transactionsData.length > 0 ? totalCommissions / transactionsData.length : 0;

  // Top performing partners
  const partnerPerformance = entitiesData.map(entity => {
    const entityTransactions = transactionsData.filter(t => t.transaction.entityId === entity.entity.id);
    const total = entityTransactions.reduce((sum, t) => sum + parseFloat(t.transaction.amount), 0);
    const count = entityTransactions.length;
    const average = count > 0 ? total / count : 0;

    return {
      ...entity,
      totalCommissions: total,
      transactionCount: count,
      averageCommission: average
    };
  }).sort((a, b) => b.totalCommissions - a.totalCommissions).slice(0, 5);

  // Product type analysis
  const productTypeAnalysis = entityTypesData.map(type => {
    const typeEntities = entitiesData.filter(e => e.entity.typeId === type.id);
    const typeTransactions = transactionsData.filter(t =>
      typeEntities.some(e => e.entity.id === t.transaction.entityId)
    );
    const total = typeTransactions.reduce((sum, t) => sum + parseFloat(t.transaction.amount), 0);
    const count = typeTransactions.length;

    return {
      ...type,
      totalCommissions: total,
      transactionCount: count,
      partnerCount: typeEntities.length,
      averagePerTransaction: count > 0 ? total / count : 0
    };
  }).sort((a, b) => b.totalCommissions - a.totalCommissions);

  const formatPercentage = (value: number) => {
    return `${value.toFixed(1)}%`;
  };

  return (
    <div className="flex h-screen w-full">
      <div className="flex-1 overflow-auto w-full">
        <div className="p-6 space-y-6">
          {/* Header */}
          <div className="flex justify-between items-center">
            <div>
              <h1 className="text-3xl font-bold">Analytics</h1>
              <p className="text-muted-foreground">
                Comprehensive commission analytics and insights
              </p>
            </div>
            <div className="flex gap-2">
              <Button variant="default" size="sm">
                <BarChart3 className="w-4 h-4 mr-2" />
                Overview
              </Button>
              <Button variant="outline" size="sm">
                <PieChart className="w-4 h-4 mr-2" />
                Detailed
              </Button>
              <Button variant="outline" size="sm">
                <TrendingUp className="w-4 h-4 mr-2" />
                Comparison
              </Button>
              <Button variant="outline" size="sm">
                <RefreshCw className="w-4 h-4 mr-2" />
                Refresh
              </Button>
            </div>
          </div>

          {/* Key Metrics */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Total Commissions</CardTitle>
                <DollarSign className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{formatCurrency(totalCommissions)}</div>
                <p className="text-xs text-muted-foreground">
                  {transactionsData.length} transactions
                </p>
              </CardContent>
            </Card>
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Partners</CardTitle>
                <Building2 className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{totalPartners}</div>
                <p className="text-xs text-muted-foreground">
                  Active partners
                </p>
              </CardContent>
            </Card>
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Product Types</CardTitle>
                <Package className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{totalProductTypes}</div>
                <p className="text-xs text-muted-foreground">
                  Categories
                </p>
              </CardContent>
            </Card>
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Avg per Transaction</CardTitle>
                <TrendingUp className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{formatCurrency(avgCommissionPerTransaction)}</div>
                <p className="text-xs text-muted-foreground">
                  Per commission entry
                </p>
              </CardContent>
            </Card>
          </div>

          {/* Top Performing Partners */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <TrendingUp className="w-5 h-5" />
                Top Performing Partners
              </CardTitle>
              <CardDescription>
                Partners with highest commission totals
              </CardDescription>
            </CardHeader>
            <CardContent>
              {partnerPerformance.length > 0 ? (
                <div className="space-y-4">
                  {partnerPerformance.map((partner, index) => (
                    <div key={partner.entity.id} className="flex items-center justify-between p-3 border rounded-lg">
                      <div className="flex items-center gap-3">
                        <div className="w-8 h-8 bg-primary/10 rounded-full flex items-center justify-center">
                          <span className="text-sm font-semibold text-primary">{index + 1}</span>
                        </div>
                        <div>
                          <p className="font-medium">{partner.entity.name}</p>
                          <p className="text-sm text-muted-foreground">
                            {partner.entityType.name} • {partner.transactionCount} transactions
                          </p>
                        </div>
                      </div>
                      <div className="text-right">
                        <p className="font-medium text-green-600">
                          {formatCurrency(partner.totalCommissions)}
                        </p>
                        <p className="text-sm text-muted-foreground">
                          Avg: {formatCurrency(partner.averageCommission)}
                        </p>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <p className="text-muted-foreground text-center py-4">
                  No partner data available
                </p>
              )}
            </CardContent>
          </Card>

          {/* Product Type Analysis */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <PieChart className="w-5 h-5" />
                Product Type Analysis
              </CardTitle>
              <CardDescription>
                Commission distribution by product type
              </CardDescription>
            </CardHeader>
            <CardContent>
              {productTypeAnalysis.length > 0 ? (
                <div className="space-y-4">
                  {productTypeAnalysis.map((type) => (
                    <div key={type.id} className="space-y-2">
                      <div className="flex justify-between items-center">
                        <div className="flex items-center gap-2">
                          <Package className="w-4 h-4 text-muted-foreground" />
                          <span className="font-medium">{type.name}</span>
                        </div>
                        <div className="text-right">
                          <div className="font-medium text-green-600">
                            {formatCurrency(type.totalCommissions)}
                          </div>
                          <div className="text-xs text-muted-foreground">
                            {type.partnerCount} partners
                          </div>
                        </div>
                      </div>
                      <div className="w-full bg-gray-200 rounded-full h-2">
                        <div
                          className="bg-primary h-2 rounded-full transition-all duration-300"
                          style={{
                            width: `${totalCommissions > 0 ? (type.totalCommissions / totalCommissions) * 100 : 0}%`
                          }}
                        ></div>
                      </div>
                      <div className="flex justify-between text-xs text-muted-foreground">
                        <span>{type.transactionCount} transactions</span>
                        <span>{formatPercentage(totalCommissions > 0 ? (type.totalCommissions / totalCommissions) * 100 : 0)} of total</span>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <p className="text-muted-foreground text-center py-4">
                  No product type data available
                </p>
              )}
            </CardContent>
          </Card>

          {/* Financial Year Insights */}
          {commissionStats && (
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <BarChart3 className="w-5 h-5" />
                  Financial Year Insights
                </CardTitle>
                <CardDescription>
                  Key insights from financial year performance
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="space-y-4">
                    <div className="flex justify-between items-center">
                      <span className="text-sm font-medium">Current FY vs Previous FY</span>
                      <span className={`text-sm font-medium ${commissionStats.currentFinancialYear.percentageChange >= 0
                          ? 'text-green-600'
                          : 'text-red-600'
                        }`}>
                        {commissionStats.currentFinancialYear.percentageChange >= 0 ? '+' : ''}
                        {commissionStats.currentFinancialYear.percentageChange.toFixed(1)}%
                      </span>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-sm font-medium">Current Month vs Previous Month</span>
                      <span className={`text-sm font-medium ${commissionStats.currentMonth.percentageChange >= 0
                          ? 'text-green-600'
                          : 'text-red-600'
                        }`}>
                        {commissionStats.currentMonth.percentageChange >= 0 ? '+' : ''}
                        {commissionStats.currentMonth.percentageChange.toFixed(1)}%
                      </span>
                    </div>
                  </div>
                  <div className="space-y-4">
                    <div className="flex justify-between items-center">
                      <span className="text-sm font-medium">Monthly Average</span>
                      <span className="text-sm font-medium">
                        {formatCurrency(commissionStats.monthlyAverage)}
                      </span>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-sm font-medium">Current Month Total</span>
                      <span className="text-sm font-medium">
                        {formatCurrency(commissionStats.currentMonth.total)}
                      </span>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          )}
        </div>
      </div>
    </div>
  );
} 