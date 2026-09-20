import { useQuery } from "@tanstack/react-query";
import { fetchMenuManagement } from "@/services/menu/menuManagementService";

export const useMenuManagement = () => {
  const { data, isLoading, error, refetch } = useQuery({
    queryKey: ["menu-management"],
    queryFn: fetchMenuManagement,
    staleTime: 5 * 60 * 1000,
  });

  return {
    categories: data?.categories || [],
    menuItems: data?.items || [],
    addons: data?.addons || [],
    archivedMenuItems: data?.archivedMenuItems || [],
    archivedAddons: data?.archivedAddons || [],
    isLoading,
    error: error ? error.message : null,
    refetch,
  };
};
