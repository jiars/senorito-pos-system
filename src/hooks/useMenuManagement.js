import { useQuery } from '@tanstack/react-query';
import api from '../utils/axios/axiosInstance';

export const useMenuManagement = () => {
  const { data, isLoading, error, refetch } = useQuery({
    queryKey: ['menu-management'],
    queryFn: async () => {
      const response = await api.get('/menu-management/init');
      return response.data;
    },
    staleTime: 5 * 60 * 1000,
  });

  return {
    categories: data?.categories || [],
    menuItems: data?.items || [],
    addons: data?.addons || [],
    isLoading,
    error: error ? error.message : null,
    refetch
  };
};
