import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { HoverCard, HoverCardContent, HoverCardTrigger } from "@/components/ui/hover-card";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Progress } from "@/components/ui/progress";
import { Entity, EntityTransaction } from "./types";
import { Building2, Calendar } from "lucide-react";

interface PartnerDetailsTableProps {
  entities: Entity[];
  transactions: EntityTransaction[];
}

export function PartnerDetailsTable({ entities, transactions }: PartnerDetailsTableProps) {
  const formatCurrency = (amount: number | string) => {
    const num = typeof amount === 'string' ? parseFloat(amount) : amount;
    return new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: 'INR',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(num);
  };

  const getInitials = (name: string) => {
    return name
      .split(' ')
      .map(word => word.charAt(0))
      .join('')
      .toUpperCase()
      .slice(0, 2);
  };

  const getProgressValue = (total: number, maxTotal: number) => {
    if (maxTotal === 0) return 0;
    return Math.min((total / maxTotal) * 100, 100);
  };

  const maxTotal = Math.max(...entities.map(entity => {
    const partnerTransactions = transactions.filter(t => t.transaction.entityId === entity.entity.id);
    return partnerTransactions.reduce((sum, t) => sum + parseFloat(t.transaction.amount), 0);
  }));

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Building2 className="w-5 h-5" />
          Partner Details
        </CardTitle>
        <CardDescription>Complete list with commission totals and performance metrics</CardDescription>
      </CardHeader>
      <CardContent>
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Partner</TableHead>
              <TableHead>Product Type</TableHead>
              <TableHead>Total Commissions</TableHead>
              <TableHead>Commission Entries</TableHead>
              <TableHead>Performance</TableHead>
              <TableHead>Added</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {entities.map((item) => {
              const partnerTransactions = transactions.filter(t => t.transaction.entityId === item.entity.id);
              const totalCommissions = partnerTransactions.reduce((sum, t) => sum + parseFloat(t.transaction.amount), 0);
              const progressValue = getProgressValue(totalCommissions, maxTotal);
              
              return (
                <HoverCard key={item.entity.id}>
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
                      <TableCell className="font-medium text-green-600">
                        {formatCurrency(totalCommissions)}
                      </TableCell>
                      <TableCell>
                        <Badge variant="secondary">{partnerTransactions.length}</Badge>
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center gap-2">
                          <Progress value={progressValue} className="h-2 w-16" />
                          <span className="text-xs text-muted-foreground">
                            {progressValue.toFixed(1)}%
                          </span>
                        </div>
                      </TableCell>
                      <TableCell className="text-sm text-muted-foreground">
                        <div className="flex items-center gap-1">
                          <Calendar className="w-3 h-3" />
                          {new Date(item.entity.createdAt).toLocaleDateString()}
                        </div>
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
                          <span>Total Commissions:</span>
                          <span className="font-medium text-green-600">
                            {formatCurrency(totalCommissions)}
                          </span>
                        </div>
                        <div className="flex justify-between text-sm">
                          <span>Transaction Count:</span>
                          <span className="font-medium">{partnerTransactions.length}</span>
                        </div>
                        <div className="flex justify-between text-sm">
                          <span>Average per Transaction:</span>
                          <span className="font-medium">
                            {partnerTransactions.length > 0 
                              ? formatCurrency(totalCommissions / partnerTransactions.length) 
                              : '₹0'}
                          </span>
                        </div>
                        <div className="flex justify-between text-sm">
                          <span>Performance Rank:</span>
                          <span className="font-medium">
                            {progressValue.toFixed(1)}% of top performer
                          </span>
                        </div>
                      </div>
                      
                      <div className="space-y-1">
                        <div className="flex justify-between text-xs text-muted-foreground">
                          <span>Commission Progress</span>
                          <span>{progressValue.toFixed(1)}%</span>
                        </div>
                        <Progress value={progressValue} className="h-2" />
                      </div>
                      
                      <div className="text-xs text-muted-foreground">
                        <div className="flex items-center gap-1">
                          <Calendar className="w-3 h-3" />
                          Added on {new Date(item.entity.createdAt).toLocaleDateString('en-IN', {
                            year: 'numeric',
                            month: 'long',
                            day: 'numeric'
                          })}
                        </div>
                      </div>
                    </div>
                  </HoverCardContent>
                </HoverCard>
              );
            })}
          </TableBody>
        </Table>
      </CardContent>
    </Card>
  );
} 