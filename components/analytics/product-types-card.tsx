import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion";
import { Progress } from "@/components/ui/progress";
import { EntityType, Entity } from "./types";
import { Package, ChevronDown } from "lucide-react";

interface ProductTypesCardProps {
  entityTypes: EntityType[];
  entities: Entity[];
}

export function ProductTypesCard({ entityTypes, entities }: ProductTypesCardProps) {
  const getEntityTypeCount = (typeName: string) => {
    return entities.filter(item => item.entityType.name === typeName).length;
  };

  // const getEntityTypeTotal = (typeId: string) => {
  //   return entities
  //     .filter(item => item.entityType.id === typeId)
  //     .length;
  // };

  const getProgressValue = (count: number, maxCount: number) => {
    if (maxCount === 0) return 0;
    return Math.min((count / maxCount) * 100, 100);
  };

  const maxCount = Math.max(...entityTypes.map(type => getEntityTypeCount(type.name)));

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Package className="w-5 h-5" />
          Product Types
        </CardTitle>
        <CardDescription>Financial products and their distribution</CardDescription>
      </CardHeader>
      <CardContent>
        {entityTypes.length === 0 ? (
          <p className="text-muted-foreground text-center py-4">No product types found</p>
        ) : (
          <Accordion type="single" collapsible className="w-full">
            {entityTypes.map((type) => {
              const count = getEntityTypeCount(type.name);
              const progressValue = getProgressValue(count, maxCount);
              
              return (
                <AccordionItem key={type.id} value={type.id}>
                  <AccordionTrigger className="hover:no-underline">
                    <div className="flex items-center justify-between w-full pr-4">
                      <div className="flex items-center gap-3">
                        <div className="flex items-center gap-2">
                          <span className="font-medium">{type.name}</span>
                          <Badge variant="secondary" className="text-xs">
                            {count}
                          </Badge>
                        </div>
                      </div>
                      <div className="flex items-center gap-2">
                        <div className="text-xs text-muted-foreground">
                          {progressValue.toFixed(1)}%
                        </div>
                        <ChevronDown className="h-4 w-4 text-muted-foreground transition-transform duration-200" />
                      </div>
                    </div>
                  </AccordionTrigger>
                  <AccordionContent>
                    <div className="space-y-3 pt-2">
                      <div className="space-y-2">
                        <div className="flex justify-between text-sm">
                          <span>Partners:</span>
                          <span className="font-medium">{count}</span>
                        </div>
                        <Progress value={progressValue} className="h-2" />
                      </div>
                      
                      <div className="text-xs text-muted-foreground">
                        <div className="flex justify-between">
                          <span>Distribution:</span>
                          <span>{((count / entities.length) * 100).toFixed(1)}% of total</span>
                        </div>
                      </div>
                      
                      {count > 0 && (
                        <div className="text-xs text-muted-foreground">
                          <div className="flex justify-between">
                            <span>Added:</span>
                            <span>{new Date(type.createdAt).toLocaleDateString()}</span>
                          </div>
                        </div>
                      )}
                    </div>
                  </AccordionContent>
                </AccordionItem>
              );
            })}
          </Accordion>
        )}
      </CardContent>
    </Card>
  );
} 