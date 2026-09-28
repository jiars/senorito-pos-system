import { useCallback } from "react";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { fetchMenuManagement } from "@/services/menu/menuManagementService";

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

  return {
    categories: data?.categories || [],
    menuItems: data?.items || [],
    addons: data?.addons || [],
    archivedMenuItems: data?.archivedMenuItems || [],
    archivedAddons: data?.archivedAddons || [],
    ingredients: data?.ingredients || [],
    isLoading,
    error: error ? error.message : null,
    refetch,
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
