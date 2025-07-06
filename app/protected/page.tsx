import { AnalyticsDashboardServer } from "@/components/analytics-dashboard";
import { getAnalyticsData } from "@/lib/db/analytics-server";
import type { 
  AnalyticsApiResponse, 
  DateConverted
} from "@/lib/db/types";
import { isDate, isObject, isArray } from "@/lib/db/types";

// Inline the prop type here using the database types
type AnalyticsDashboardServerProps = DateConverted<AnalyticsApiResponse>;

function convertDates<T>(obj: T): DateConverted<T> {
  if (isArray(obj)) {
    return obj.map(convertDates) as DateConverted<T>;
  } else if (isObject(obj)) {
    const newObj: Record<string, unknown> = {};
    for (const key in obj) {
      const value = obj[key];
      if (isDate(value)) {
        newObj[key] = value.toISOString();
      } else {
        newObj[key] = convertDates(value);
      }
    }
    return newObj as DateConverted<T>;
  }
  return obj as DateConverted<T>;
}

export default async function ProtectedPage() {
  const data = await getAnalyticsData();
  const dataWithStringDates = convertDates(data);
  
  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold">Dashboard Overview</h1>
          <p className="text-muted-foreground">
            Welcome! Here&apos;s your commission analytics overview.
          </p>
        </div>
      </div>
      <AnalyticsDashboardServer {...(dataWithStringDates as AnalyticsDashboardServerProps)} />
    </div>
  );
}
