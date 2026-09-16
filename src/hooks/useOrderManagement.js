import { useCallback } from "react";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { fetchOrderManagement } from "../services/orders/orderManagementService";

const ORDER_MANAGEMENT_QUERY_KEY = ["order-management"];

const orderManagementQueryOptions = {
  queryKey: ORDER_MANAGEMENT_QUERY_KEY,
  queryFn: fetchOrderManagement,
  staleTime: 5 * 60 * 1000,
};

export const useOrderManagement = () => {
  const { data, isLoading, error, refetch } = useQuery({
    ...orderManagementQueryOptions,
  });

  return {
    orders: data?.orders || [],
    isLoading,
    error: error ? error.message : null,
    refetchOrderManagement: refetch,
  };
};

export const useRefreshOrderManagement = () => {
  const queryClient = useQueryClient();

  return useCallback(async () => {
    // Mark the old Order History cache as outdated.
    await queryClient.invalidateQueries({
      queryKey: ORDER_MANAGEMENT_QUERY_KEY,
      refetchType: "none",
    });

    return queryClient.fetchQuery(orderManagementQueryOptions);
  }, [queryClient]);
};
