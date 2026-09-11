import { useQuery } from '@tanstack/react-query';
import api from '../utils/axios/axiosInstance';

export const useInventoryManagement = () => {
  const { data, isLoading, error, refetch } = useQuery({
    queryKey: ['inventory-management'],
    queryFn: async () => {
      // One request supplies both active and archived Inventory pages.
      const response = await api.get('/inventory-management/init');
      return response.data;
    },
    staleTime: 5 * 60 * 1000,
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
