import { useQuery } from "@tanstack/react-query";
import { fetchPosManagement } from "../services/pos/posManagementService";

export const usePosManagement = (isOnline) => {
  const { data, isLoading, error, refetch } = useQuery({
    queryKey: ["pos-management"],
    queryFn: fetchPosManagement,
    staleTime: 5 * 60 * 1000,
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
