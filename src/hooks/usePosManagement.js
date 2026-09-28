import { useCallback } from "react";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { fetchPosManagement } from "../services/pos/posManagementService";
import { savePosManagementCache } from "../services/pos/posCacheService";

const POS_MANAGEMENT_QUERY_KEY = ["pos-management"];

const posManagementQueryOptions = {
  queryKey: POS_MANAGEMENT_QUERY_KEY,
  queryFn: fetchPosManagement,
  staleTime: 5 * 60 * 1000,
};

export const usePosManagement = (isOnline) => {
  const { data, isLoading, error, refetch } = useQuery({
    ...posManagementQueryOptions,
    enabled: isOnline,
  });

  return {
    menuItems: data?.items || [],
    addons: data?.addons || [],
    categories: data?.categories || [],
    inventoryStock: data?.inventory_stock || [],
    isLoading,
    error: error ? error.message : null,
    refetchPosManagement: refetch,
  };
};

// Load fresh POS data into the React Query cache.
export const useRefreshPosManagement = () => {
  const queryClient = useQueryClient();

  return useCallback(async () => {
    await queryClient.invalidateQueries({
      queryKey: POS_MANAGEMENT_QUERY_KEY,
      refetchType: "none",
    });

    const freshData = await queryClient.fetchQuery(posManagementQueryOptions);

    await savePosManagementCache(freshData);

    return freshData;
  }, [queryClient]);
};
