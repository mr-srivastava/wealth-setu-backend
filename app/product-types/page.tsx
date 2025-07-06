import { ProductTypesCard } from "@/components/analytics/product-types-card";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { RefreshCw, AlertCircle, Package, TrendingUp, BarChart3, Building2 } from "lucide-react";
import { getAnalyticsData } from "@/lib/db/analytics-server";
import { formatCurrency } from "@/components/analytics/types";
import type { EntityTypeWithRelations, EntityWithRelations } from "@/lib/db/types";

export default async function ProductTypesPage() {
  let entityTypes: EntityTypeWithRelations[] = [];
  let entities: EntityWithRelations[] = [];
  let error: string | null = null;

  try {
    const data = await getAnalyticsData();
    entityTypes = data.entityTypes || [];
    entities = data.entities || [];
  } catch (err) {
    error = err instanceof Error ? err.message : "Failed to load data";
  }

  if (error) {
    return (
      <div className="flex h-screen w-full">
        <div className="flex-1 p-6 w-full">
          <Alert>
            <AlertCircle className="h-4 w-4" />
            <AlertDescription>
              Error loading product types data. Please try again.
            </AlertDescription>
          </Alert>
        </div>
      </div>
    );
  }

  // Calculate summary stats
  const totalProductTypes = entityTypes.length;
  const totalEntities = entities.length;
  const avgEntitiesPerType = totalProductTypes > 0 ? totalEntities / totalProductTypes : 0;

  // Calculate entities by product type
  // const entitiesByType = (entityTypes as Array<{ id: string }>).map(type => {
  //   const typeEntities = (entities as Array<{ entity: { typeId: string } }>).filter(e => e.entity.typeId === type.id);
  //   const count = typeEntities.length;
  //   const percentage = totalEntities > 0 ? (count / totalEntities) * 100 : 0;
  //   
  //   return {
  //     ...type,
  //     entityCount: count,
  //     percentage
  //   };
  // }).sort((a, b) => b.entityCount - a.entityCount);

  return (
    <div className="flex h-screen w-full">
      <div className="flex-1 overflow-auto w-full">
        <div className="p-6 space-y-6">
          {/* Header */}
          <div className="flex justify-between items-center">
            <div>
              <h1 className="text-3xl font-bold">Product Types</h1>
              <p className="text-muted-foreground">
                Analyze commission performance by product type
              </p>
            </div>
            <div className="flex gap-2">
              <Button variant="default" size="sm">
                <Package className="w-4 h-4 mr-2" />
                Cards
              </Button>
              <Button variant="outline" size="sm">
                <BarChart3 className="w-4 h-4 mr-2" />
                Chart
              </Button>
              <Button variant="outline" size="sm">
                <RefreshCw className="w-4 h-4 mr-2" />
                Refresh
              </Button>
            </div>
          </div>

          {/* Summary Cards */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Total Product Types</CardTitle>
                <Package className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{totalProductTypes}</div>
                <p className="text-xs text-muted-foreground">
                  Different product categories
                </p>
              </CardContent>
            </Card>
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Total Partners</CardTitle>
                <Building2 className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">
                  {totalEntities.toLocaleString('en-IN')}
                </div>
                <p className="text-xs text-muted-foreground">
                  Across all product types
                </p>
              </CardContent>
            </Card>
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Avg per Type</CardTitle>
                <TrendingUp className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">
                  {avgEntitiesPerType.toLocaleString('en-IN', { maximumFractionDigits: 0 })}
                </div>
                <p className="text-xs text-muted-foreground">
                  Average partners per product type
                </p>
              </CardContent>
            </Card>
          </div>

          {/* Product Types Data */}
          {entityTypes.length > 0 ? (
            <ProductTypesCard entityTypes={entityTypes} entities={entities} />
          ) : (
            <Alert>
              <AlertCircle className="h-4 w-4" />
              <AlertDescription>
                No product types data available.
              </AlertDescription>
            </Alert>
          )}
        </div>
      </div>
    </div>
  );
} 