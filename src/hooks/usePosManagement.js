import { useCallback } from "react";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { fetchPosManagement } from "../services/pos/posManagementService";
import { savePosManagementCache } from "../services/pos/posCacheService";

const POS_MANAGEMENT_QUERY_KEY = ["pos-management"];
const EMPTY_POS_RECORDS = [];

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
    menuItems: data?.items || EMPTY_POS_RECORDS,
    addons: data?.addons || EMPTY_POS_RECORDS,
    categories: data?.categories || EMPTY_POS_RECORDS,
    inventoryStock: data?.inventory_stock || EMPTY_POS_RECORDS,
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
