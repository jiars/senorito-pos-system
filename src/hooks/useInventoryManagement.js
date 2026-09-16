import { useCallback } from "react";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { fetchInventoryManagement } from "@/services/inventory/inventoryManagementService";

const INVENTORY_MANAGEMENT_QUERY_KEY = ["inventory-management"];

const inventoryManagementQueryOptions = {
  queryKey: INVENTORY_MANAGEMENT_QUERY_KEY,
  queryFn: fetchInventoryManagement,
  staleTime: 5 * 60 * 1000,
};

export const useInventoryManagement = () => {
  const { data, isLoading, error, refetch } = useQuery({
    ...inventoryManagementQueryOptions,
  });

  return {
    inventoryItems: data?.items || [],
    archivedInventoryItems: data?.archivedItems || [],
    categories: data?.categories || [],
    units: data?.units || [],
    isLoading,
    error: error ? error.message : null,
    refetchInventoryManagement: refetch,
  };
};

export const useRefreshInventoryManagement = () => {
  const queryClient = useQueryClient();

  return useCallback(async () => {
    // Mark the old cache as outdated.
    await queryClient.invalidateQueries({
      queryKey: INVENTORY_MANAGEMENT_QUERY_KEY,
      refetchType: "none",
    });

    // Immediately load fresh Inventory data into the cache.
    return queryClient.fetchQuery(inventoryManagementQueryOptions);
  }, [queryClient]);
};
