import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { RefreshCw, AlertCircle, Download, FileText, Calendar, TrendingUp, BarChart3, PieChart } from "lucide-react";
import { getAnalyticsData } from "@/lib/db/analytics-server";
import { formatCurrency } from "@/components/analytics/types";
import type { AnalyticsApiResponse, EntityWithRelations, EntityTransactionWithRelations } from "@/lib/db/types";

export default async function ReportsPage() {
  let entitiesData: EntityWithRelations[] = [];
  let transactionsData: EntityTransactionWithRelations[] = [];
  let error: string | null = null;
  let data: AnalyticsApiResponse | null = null;

  try {
    data = await getAnalyticsData();
    entitiesData = data.entities || [];
    transactionsData = data.transactions || [];
  } catch (err) {
    error = err instanceof Error ? err.message : "Failed to load data";
  }

  if (error) {
    return (
      <div className="flex h-screen w-full">
        <div className="flex-1 p-6">
          <Alert>
            <AlertCircle className="h-4 w-4" />
            <AlertDescription>
              Error loading reports data. Please try again.
            </AlertDescription>
          </Alert>
        </div>
      </div>
    );
  }

  const reports = [
    {
      id: 'commission-summary',
      title: 'Commission Summary Report',
      description: 'Overview of all commission data with totals and averages',
      icon: FileText,
      category: 'Summary'
    },
    {
      id: 'partner-performance',
      title: 'Partner Performance Report',
      description: 'Detailed analysis of partner performance and rankings',
      icon: TrendingUp,
      category: 'Performance'
    },
    {
      id: 'product-type-analysis',
      title: 'Product Type Analysis Report',
      description: 'Breakdown of commissions by product type and category',
      icon: PieChart,
      category: 'Analysis'
    },
    {
      id: 'monthly-trends',
      title: 'Monthly Trends Report',
      description: 'Commission trends and patterns over time',
      icon: Calendar,
      category: 'Trends'
    },
    {
      id: 'financial-year-comparison',
      title: 'Financial Year Comparison',
      description: 'Year-over-year comparison of commission performance',
      icon: BarChart3,
      category: 'Comparison'
    },
    {
      id: 'detailed-transactions',
      title: 'Detailed Transactions Report',
      description: 'Complete list of all commission transactions',
      icon: FileText,
      category: 'Detailed'
    }
  ];

  return (
    <div className="flex h-screen w-full">
      <div className="flex-1 overflow-auto w-full">
        <div className="p-6 space-y-6">
          {/* Header */}
          <div className="flex justify-between items-center">
            <div>
              <h1 className="text-3xl font-bold">Reports</h1>
              <p className="text-muted-foreground">
                Generate and export custom commission reports
              </p>
            </div>
            <Button variant="outline" size="sm">
              <RefreshCw className="w-4 h-4 mr-2" />
              Refresh
            </Button>
          </div>

          {/* Quick Stats */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Total Reports</CardTitle>
                <FileText className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{reports.length}</div>
                <p className="text-xs text-muted-foreground">
                  Available reports
                </p>
              </CardContent>
            </Card>
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Total Transactions</CardTitle>
                <FileText className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{transactionsData.length}</div>
                <p className="text-xs text-muted-foreground">
                  Commission entries
                </p>
              </CardContent>
            </Card>
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Partners</CardTitle>
                <TrendingUp className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{entitiesData.length}</div>
                <p className="text-xs text-muted-foreground">
                  Active partners
                </p>
              </CardContent>
            </Card>
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Total Commissions</CardTitle>
                <BarChart3 className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">
                  {formatCurrency(transactionsData.reduce((sum, t) => sum + parseFloat(t.transaction.amount), 0))}
                </div>
                <p className="text-xs text-muted-foreground">
                  Total earnings
                </p>
              </CardContent>
            </Card>
          </div>

          {/* Available Reports */}
          <div className="space-y-4">
            <div>
              <h2 className="text-xl font-semibold">Available Reports</h2>
              <p className="text-muted-foreground">Select a report to generate and export</p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {reports.map((report) => {
                const Icon = report.icon;
                return (
                  <Card key={report.id} className="hover:shadow-md transition-shadow">
                    <CardHeader>
                      <div className="flex items-center gap-2">
                        <Icon className="w-5 h-5 text-primary" />
                        <CardTitle className="text-lg">{report.title}</CardTitle>
                      </div>
                      <CardDescription>{report.description}</CardDescription>
                    </CardHeader>
                    <CardContent>
                      <div className="flex justify-between items-center">
                        <span className="text-xs text-muted-foreground bg-muted px-2 py-1 rounded">
                          {report.category}
                        </span>
                        <Button size="sm" variant="outline">
                          <Download className="w-4 h-4 mr-2" />
                          Export
                        </Button>
                      </div>
                    </CardContent>
                  </Card>
                );
              })}
            </div>
          </div>

          {/* Report Categories */}
          <div className="space-y-4">
            <div>
              <h2 className="text-xl font-semibold">Report Categories</h2>
              <p className="text-muted-foreground">Browse reports by category</p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
              {['Summary', 'Performance', 'Analysis', 'Trends', 'Comparison', 'Detailed'].map((category) => {
                const categoryReports = reports.filter(r => r.category === category);
                return (
                  <Card key={category} className="hover:shadow-md transition-shadow">
                    <CardHeader>
                      <CardTitle className="text-lg">{category}</CardTitle>
                      <CardDescription>
                        {categoryReports.length} report{categoryReports.length !== 1 ? 's' : ''}
                      </CardDescription>
                    </CardHeader>
                    <CardContent>
                      <div className="space-y-2">
                        {categoryReports.map((report) => (
                          <div key={report.id} className="flex items-center justify-between">
                            <span className="text-sm">{report.title}</span>
                            <Button size="sm" variant="ghost">
                              <Download className="w-3 h-3" />
                            </Button>
                          </div>
                        ))}
                      </div>
                    </CardContent>
                  </Card>
                );
              })}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
} 