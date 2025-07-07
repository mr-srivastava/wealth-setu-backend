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
  const json = await response.json();
  // If the response has a 'data' property with 'entities', return that
  if (json && json.data && Array.isArray(json.data.entities)) {
    return json.data.entities;
  }
  // fallback: if the response is already an array
  if (Array.isArray(json)) {
    return json;
  }
  return [];
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