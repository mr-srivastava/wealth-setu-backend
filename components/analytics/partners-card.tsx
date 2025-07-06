import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { HoverCard, HoverCardContent, HoverCardTrigger } from "@/components/ui/hover-card";
import { Progress } from "@/components/ui/progress";
import { Entity, EntityTransaction } from "./types";
import { Building2 } from "lucide-react";

interface PartnersCardProps {
  entities: Entity[];
  transactions: EntityTransaction[];
}

export function PartnersCard({ entities, transactions }: PartnersCardProps) {
  const formatCurrency = (amount: number | string) => {
    const num = typeof amount === 'string' ? parseFloat(amount) : amount;
    return new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: 'INR',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(num);
  };

  const getEntityTransactionTotal = (entityId: string) => {
    return transactions
      .filter(t => t.transaction.entityId === entityId)
      .reduce((sum, t) => sum + parseFloat(t.transaction.amount), 0);
  };

  const getEntityTransactionCount = (entityId: string) => {
    return transactions.filter(t => t.transaction.entityId === entityId).length;
  };

  const getProgressValue = (total: number, maxTotal: number) => {
    if (maxTotal === 0) return 0;
    return Math.min((total / maxTotal) * 100, 100);
  };

  const maxTotal = Math.max(...entities.map(entity => getEntityTransactionTotal(entity.entity.id)));

  const getInitials = (name: string) => {
    return name
      .split(' ')
      .map(word => word.charAt(0))
      .join('')
      .toUpperCase()
      .slice(0, 2);
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Building2 className="w-5 h-5" />
          Partners / AMCs
        </CardTitle>
        <CardDescription>Companies paying commissions</CardDescription>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          {entities.length === 0 ? (
            <p className="text-muted-foreground text-center py-4">No partners found</p>
          ) : (
            entities.map((item) => {
              const totalCommissions = getEntityTransactionTotal(item.entity.id);
              const transactionCount = getEntityTransactionCount(item.entity.id);
              const progressValue = getProgressValue(totalCommissions, maxTotal);
              
              return (
                <HoverCard key={item.entity.id}>
                  <HoverCardTrigger asChild>
                    <div className="flex items-center justify-between p-3 border rounded-lg hover:bg-accent/50 transition-colors cursor-pointer">
                      <div className="flex items-center gap-3">
                        <Avatar className="h-10 w-10">
                          <AvatarFallback className="bg-primary/10 text-primary font-semibold">
                            {getInitials(item.entity.name)}
                          </AvatarFallback>
                        </Avatar>
                        <div>
                          <div className="font-medium">{item.entity.name}</div>
                          <div className="text-sm text-muted-foreground flex items-center gap-2">
                            <Badge variant="outline" className="text-xs">
                              {item.entityType.name}
                            </Badge>
                            <span>•</span>
                            <span>{transactionCount} entries</span>
                          </div>
                        </div>
                      </div>
                      <div className="text-right">
                        <div className="font-medium text-green-600">
                          {formatCurrency(totalCommissions)}
                        </div>
                        <div className="text-xs text-muted-foreground">
                          {progressValue.toFixed(1)}% of max
                        </div>
                      </div>
                    </div>
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
                          <span className="font-medium">{transactionCount}</span>
                        </div>
                        <div className="flex justify-between text-sm">
                          <span>Average per Transaction:</span>
                          <span className="font-medium">
                            {transactionCount > 0 ? formatCurrency(totalCommissions / transactionCount) : '₹0'}
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
                        Added on {new Date(item.entity.createdAt).toLocaleDateString()}
                      </div>
                    </div>
                  </HoverCardContent>
                </HoverCard>
              );
            })
          )}
        </div>
      </CardContent>
    </Card>
  );
} 