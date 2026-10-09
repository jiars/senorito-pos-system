import { useCallback } from "react";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { fetchMenuManagement } from "@/services/menu/menuManagementService";
import { useRefreshPosManagement } from "@/hooks/usePosManagement";
import {
  markPOSRefreshRequired,
  completePOSRefresh,
} from "@/services/pos/posCacheService";

const MENU_MANAGEMENT_QUERY_KEY = ["menu-management"];

const menuManagementQueryOptions = {
  queryKey: MENU_MANAGEMENT_QUERY_KEY,
  queryFn: fetchMenuManagement,
  staleTime: 5 * 60 * 1000,
};

export const useMenuManagement = () => {
  const { data, isLoading, error, refetch } = useQuery({
    ...menuManagementQueryOptions,
  });
  const refreshPosManagement = useRefreshPosManagement();

  // Every Menu mutation already calls this refetch before its success toast.
  const refetchMenuAndPos = useCallback(async (options) => {
    const revision = await markPOSRefreshRequired();
    const result = await refetch(options);

    if (result.isError || result.error) {
      return result;
    }

    // Update both React Query and the offline catalog before allowing success.
    await refreshPosManagement();
    const completed = await completePOSRefresh(revision);
    if (!completed) {
      throw new Error("Menu changed again. Retry refresh to load the latest POS data.");
    }

    return result;
  }, [refetch, refreshPosManagement]);

  return {
    categories: data?.categories || [],
    menuItems: data?.items || [],
    addons: data?.addons || [],
    archivedMenuItems: data?.archivedMenuItems || [],
    archivedAddons: data?.archivedAddons || [],
    ingredients: data?.ingredients || [],
    isLoading,
    error: error ? error.message : null,
    refetch: refetchMenuAndPos,
  };
};

// Refresh Menu data after related Inventory changes.
export const useRefreshMenuManagement = () => {
  const queryClient = useQueryClient();

  return useCallback(async () => {
    await queryClient.invalidateQueries({
      queryKey: MENU_MANAGEMENT_QUERY_KEY,
      refetchType: "none",
    });

    return queryClient.fetchQuery(menuManagementQueryOptions);
  }, [queryClient]);
};
