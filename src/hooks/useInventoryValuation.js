import { useCallback } from 'react';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { fetchInventoryValuation } from '../services/inventory/reports/inventoryValuationService';

const VALUATION_QUERY_KEY = ['inventory-valuation'];
const VALUATION_STALE_TIME = 5 * 60 * 1000;

const valuationQueryOptions = {
  queryKey: VALUATION_QUERY_KEY,
  queryFn: fetchInventoryValuation,
  staleTime: VALUATION_STALE_TIME,
};

export const useInventoryValuation = () => {
  const query = useQuery({
    ...valuationQueryOptions,
    // Catch changes made by the server-side expiry scheduler.
    refetchOnMount: 'always',
    refetchOnWindowFocus: 'always',
  });

  return {
    inventoryItems: query.data || [],
    isLoading: query.isLoading,
    error: query.error ? query.error.message : null,
    refetchInventoryValuation: query.refetch,
  };
};

export const useRefreshInventoryValuation = () => {
  const queryClient = useQueryClient();

  return useCallback(async () => {
    // Force Laravel to rebuild the cached report data after a stock change.
    await queryClient.invalidateQueries({
      queryKey: VALUATION_QUERY_KEY,
      refetchType: 'none',
    });

    return queryClient.fetchQuery(valuationQueryOptions);
  }, [queryClient]);
};
