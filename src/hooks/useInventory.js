import { useQuery } from '@tanstack/react-query';
import api from '../utils/axios/axiosInstance';
import { fetchUnits } from '../services/inventory/inventoryItemsService';

export const useInventory = () => {
  const { data, isLoading, error, refetch } = useQuery({
    queryKey: ['inventory-management'],
    queryFn: async () => {
      // 1. Fetch categories and items from our new Laravel Orchestrator!
      const response = await api.get('/inventory-management/init');

      // 2. Temporarily fetch units from Supabase until we migrate ENUMs
      const unitsData = await fetchUnits();

      return {
        ...response.data,
        units: unitsData
      };
    },
    staleTime: 5 * 60 * 1000,
  });

  return {
    inventoryItems: data?.items || [],
    categories: data?.categories || [],
    units: data?.units || [],
    isLoading,
    error: error ? error.message : null,
    refetchInventory: refetch
  };
};
