import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { HoverCard, HoverCardContent, HoverCardTrigger } from "@/components/ui/hover-card";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { RecentCommissionsData } from "./types";
import { Building2, Calendar, DollarSign, TrendingUp, TrendingDown } from "lucide-react";

interface RecentCommissionsTableProps {
  recentCommissionsData: RecentCommissionsData;
}

export function RecentCommissionsTable({ recentCommissionsData }: RecentCommissionsTableProps) {
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

  const getInitials = (name: string) => {
    return name
      .split(' ')
      .map(word => word.charAt(0))
      .join('')
      .toUpperCase()
      .slice(0, 2);
  };

  return (
    <div className="space-y-6">
      {/* Financial Year Summary */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Calendar className="w-5 h-5" />
            Financial Year Summary
          </CardTitle>
          <CardDescription>Current vs Previous Financial Year Totals</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
            <div className="space-y-2">
              <p className="text-sm font-medium text-muted-foreground">Grand Total (Current FY)</p>
              <p className="text-2xl font-bold">{formatCurrency(recentCommissionsData.grandTotal.currentFYTotal)}</p>
            </div>
            <div className="space-y-2">
              <p className="text-sm font-medium text-muted-foreground">Grand Total (Previous FY)</p>
              <p className="text-2xl font-bold">{formatCurrency(recentCommissionsData.grandTotal.previousFYTotal)}</p>
            </div>
            <div className="space-y-2">
              <p className="text-sm font-medium text-muted-foreground">Percentage Change</p>
              <div className="flex items-center gap-2">
                {recentCommissionsData.grandTotal.percentageChange >= 0 ? (
                  <TrendingUp className="w-5 h-5 text-green-600" />
                ) : (
                  <TrendingDown className="w-5 h-5 text-red-600" />
                )}
                <p className={`text-2xl font-bold ${getPercentageColor(recentCommissionsData.grandTotal.percentageChange)}`}>
                  {formatPercentage(recentCommissionsData.grandTotal.percentageChange)}
                </p>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Entity Type Breakdown */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Building2 className="w-5 h-5" />
            Entity Type Breakdown
          </CardTitle>
          <CardDescription>Financial Year Totals by Product Type</CardDescription>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Product Type</TableHead>
                <TableHead>Current FY Total</TableHead>
                <TableHead>Previous FY Total</TableHead>
                <TableHead>Change</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {recentCommissionsData.entityTypeTotals.map((item) => (
                <TableRow key={item.entityTypeId}>
                  <TableCell>
                    <Badge variant="outline">{item.entityTypeName}</Badge>
                  </TableCell>
                  <TableCell className="font-medium text-green-600">
                    {formatCurrency(item.currentFYTotal)}
                  </TableCell>
                  <TableCell className="font-medium text-muted-foreground">
                    {formatCurrency(item.previousFYTotal)}
                  </TableCell>
                  <TableCell className={`font-medium ${getPercentageColor(item.percentageChange)}`}>
                    <div className="flex items-center gap-1">
                      {item.percentageChange >= 0 ? (
                        <TrendingUp className="w-3 h-3" />
                      ) : (
                        <TrendingDown className="w-3 h-3" />
                      )}
                      {formatPercentage(item.percentageChange)}
                    </div>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>

      {/* Recent Commissions Table */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <DollarSign className="w-5 h-5" />
            Recent Commissions
          </CardTitle>
          <CardDescription>Latest 10 commission entries</CardDescription>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Partner</TableHead>
                <TableHead>Product</TableHead>
                <TableHead>Month</TableHead>
                <TableHead>Commission</TableHead>
                <TableHead>Date</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {recentCommissionsData.transactions.map((item) => (
                <HoverCard key={item.transaction.id}>
                  <HoverCardTrigger asChild>
                    <TableRow className="cursor-pointer hover:bg-accent/50">
                      <TableCell className="font-medium">
                        <div className="flex items-center gap-2">
                          <Avatar className="h-6 w-6">
                            <AvatarFallback className="bg-primary/10 text-primary text-xs font-semibold">
                              {getInitials(item.entity.name)}
                            </AvatarFallback>
                          </Avatar>
                          {item.entity.name}
                        </div>
                      </TableCell>
                      <TableCell>
                        <Badge variant="outline">{item.entityType.name}</Badge>
                      </TableCell>
                      <TableCell className="text-sm">
                        {new Date(item.transaction.month).toLocaleDateString('en-IN', {
                          year: 'numeric',
                          month: 'short'
                        })}
                      </TableCell>
                      <TableCell className="font-medium text-green-600">
                        {formatCurrency(item.transaction.amount)}
                      </TableCell>
                      <TableCell className="text-sm text-muted-foreground">
                        {new Date(item.transaction.createdAt).toLocaleDateString()}
                      </TableCell>
                    </TableRow>
                  </HoverCardTrigger>
                  <HoverCardContent className="w-80">
                    <div className="space-y-3">
                      <div className="flex items-center gap-2">
                        <Avatar className="h-8 w-8">
                          <AvatarFallback className="bg-primary/10 text-primary font-semibold text-sm">
                            {getInitials(item.entity.name)}
                          </AvatarFallback>
                        </Avatar>
                        <div>
                          <h4 className="font-semibold">{item.entity.name}</h4>
                          <p className="text-sm text-muted-foreground">{item.entityType.name}</p>
                        </div>
                      </div>
                      
                      <div className="space-y-2">
                        <div className="flex justify-between text-sm">
                          <span>Commission Amount:</span>
                          <span className="font-medium text-green-600">
                            {formatCurrency(item.transaction.amount)}
                          </span>
                        </div>
                        <div className="flex justify-between text-sm">
                          <span>Month:</span>
                          <span className="font-medium">
                            {new Date(item.transaction.month).toLocaleDateString('en-IN', {
                              year: 'numeric',
                              month: 'long'
                            })}
                          </span>
                        </div>
                        <div className="flex justify-between text-sm">
                          <span>Entry Date:</span>
                          <span className="font-medium">
                            {new Date(item.transaction.createdAt).toLocaleDateString('en-IN', {
                              year: 'numeric',
                              month: 'long',
                              day: 'numeric'
                            })}
                          </span>
                        </div>
                      </div>
                      
                      <div className="text-xs text-muted-foreground">
                        Transaction ID: {item.transaction.id.slice(0, 8)}...
                      </div>
                    </div>
                  </HoverCardContent>
                </HoverCard>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  );
} 