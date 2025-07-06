import { useQuery } from "@tanstack/react-query";
import { EntityType, Entity, EntityTransaction, TransactionStats, CommissionStats, RecentCommissionsData } from "@/components/analytics/types";

// API functions
const fetchEntityTypes = async (): Promise<EntityType[]> => {
  const response = await fetch('/api/analytics/entity-types');
  if (!response.ok) {
    throw new Error('Failed to fetch entity types');
  }
  return response.json();
};

const fetchEntities = async (): Promise<Entity[]> => {
  const response = await fetch('/api/analytics/entities');
  if (!response.ok) {
    throw new Error('Failed to fetch entities');
  }
  return response.json();
};

const fetchTransactions = async (): Promise<{
  transactions: EntityTransaction[];
  stats: TransactionStats;
  commissionStats: CommissionStats;
  recentCommissionsData: RecentCommissionsData;
}> => {
  const response = await fetch('/api/analytics/transactions');
  if (!response.ok) {
    throw new Error('Failed to fetch transactions');
  }
  return response.json();
};

// Custom hooks
export function useEntityTypes() {
  return useQuery({
    queryKey: ['entityTypes'],
    queryFn: fetchEntityTypes,
  });
}

export function useEntities() {
  return useQuery({
    queryKey: ['entities'],
    queryFn: fetchEntities,
  });
}

export function useTransactions() {
  return useQuery({
    queryKey: ['transactions'],
    queryFn: fetchTransactions,
  });
}

// Combined hook for all analytics data
export function useAnalyticsData() {
  const entityTypes = useEntityTypes();
  const entities = useEntities();
  const transactions = useTransactions();

  return {
    entityTypes,
    entities,
    transactions,
    isLoading: entityTypes.isLoading || entities.isLoading || transactions.isLoading,
    isError: entityTypes.isError || entities.isError || transactions.isError,
    error: entityTypes.error || entities.error || transactions.error,
  };
} 