import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Switch } from "@/components/ui/switch";
import { Progress } from "@/components/ui/progress";
import { EntityType, Entity, TransactionStats } from "./types";
import { BarChart3, Eye, EyeOff } from "lucide-react";
import { useState } from "react";

interface SummaryCardProps {
  entityTypes: EntityType[];
  entities: Entity[];
  stats: TransactionStats | null;
}

export function SummaryCard({ entityTypes, entities, stats }: SummaryCardProps) {
  const [showDetails, setShowDetails] = useState(false);
  const [showProgress, setShowProgress] = useState(true);

  const formatCurrency = (amount: number | string) => {
    const num = typeof amount === 'string' ? parseFloat(amount) : amount;
    return new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: 'INR',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(num);
  };

  const getProgressValue = (current: number, target: number) => {
    if (target === 0) return 0;
    return Math.min((current / target) * 100, 100);
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <BarChart3 className="w-5 h-5" />
          Commission Summary
        </CardTitle>
        <CardDescription>Quick overview with interactive controls</CardDescription>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          {/* Toggle Controls */}
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                {showDetails ? <Eye className="w-4 h-4" /> : <EyeOff className="w-4 h-4" />}
                <span className="text-sm font-medium">Show Details</span>
              </div>
              <Switch
                checked={showDetails}
                onCheckedChange={setShowDetails}
              />
            </div>
            <div className="flex items-center justify-between">
              <span className="text-sm font-medium">Show Progress Bars</span>
              <Switch
                checked={showProgress}
                onCheckedChange={setShowProgress}
              />
            </div>
          </div>

          <div className="space-y-3">
            <div className="flex justify-between items-center">
              <span className="text-sm">Product Types:</span>
              <Badge variant="default">{entityTypes.length}</Badge>
            </div>
            
            <div className="flex justify-between items-center">
              <span className="text-sm">Partners:</span>
              <Badge variant="default">{entities.length}</Badge>
            </div>
            
            <div className="flex justify-between items-center">
              <span className="text-sm">Commission Entries:</span>
              <Badge variant="default">{stats?.transactionCount || 0}</Badge>
            </div>
            
            <div className="flex justify-between items-center">
              <span className="text-sm">Total Earnings:</span>
              <Badge variant="default">
                {stats ? formatCurrency(stats.totalAmount) : '₹0'}
              </Badge>
            </div>
          </div>

          {showDetails && (
            <div className="space-y-3 pt-2 border-t">
              <div className="text-sm font-medium text-muted-foreground">Additional Details</div>
              
              <div className="space-y-2">
                <div className="flex justify-between text-xs">
                  <span>Average per Entry:</span>
                  <span className="font-medium">
                    {stats && stats.transactionCount > 0 
                      ? formatCurrency(stats.totalAmount / stats.transactionCount) 
                      : '₹0'}
                  </span>
                </div>
                
                <div className="flex justify-between text-xs">
                  <span>Average per Partner:</span>
                  <span className="font-medium">
                    {entities.length > 0 && stats 
                      ? formatCurrency(stats.totalAmount / entities.length) 
                      : '₹0'}
                  </span>
                </div>
                
                <div className="flex justify-between text-xs">
                  <span>Average per Product Type:</span>
                  <span className="font-medium">
                    {entityTypes.length > 0 && stats 
                      ? formatCurrency(stats.totalAmount / entityTypes.length) 
                      : '₹0'}
                  </span>
                </div>
              </div>
            </div>
          )}

          {showProgress && stats && (
            <div className="space-y-3 pt-2 border-t">
              <div className="text-sm font-medium text-muted-foreground">Progress Indicators</div>
              
              <div className="space-y-2">
                <div className="space-y-1">
                  <div className="flex justify-between text-xs">
                    <span>Commission Growth</span>
                    <span>{getProgressValue(stats.totalAmount, 1000000).toFixed(1)}%</span>
                  </div>
                  <Progress 
                    value={getProgressValue(stats.totalAmount, 1000000)} 
                    className="h-2"
                  />
                </div>
                
                <div className="space-y-1">
                  <div className="flex justify-between text-xs">
                    <span>Portfolio Diversity</span>
                    <span>{getProgressValue(entityTypes.length, 10).toFixed(1)}%</span>
                  </div>
                  <Progress 
                    value={getProgressValue(entityTypes.length, 10)} 
                    className="h-2"
                  />
                </div>
                
                <div className="space-y-1">
                                  <div className="flex justify-between text-xs">
                  <span>Partner Coverage</span>
                  <span>{getProgressValue(entities.length, 50).toFixed(1)}%</span>
                </div>
                  <Progress 
                    value={getProgressValue(entities.length, 50)} 
                    className="h-2"
                  />
                </div>
              </div>
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
} 