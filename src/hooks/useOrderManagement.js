import { useCallback } from "react";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { fetchOrderManagement } from "../services/orders/orderManagementService";
import { useAuth } from "./useAuth";

const getOrderManagementQueryOptions = (userId, role) => {
  return {
    queryKey: ["order-management", userId, role],
    queryFn: fetchOrderManagement,
    staleTime: 5 * 60 * 1000,
  };
};

export const useOrderManagement = () => {
  const { user, role } = useAuth();
  const userId = user ? user.id : null;
  const canReadOrders = Boolean(userId) && (role === "Owner" || role === "Cashier");
  const { data, isLoading, error, refetch } = useQuery({
    ...getOrderManagementQueryOptions(userId, role),
    enabled: canReadOrders,
    refetchOnMount: "always",
  });

  return {
    orders: canReadOrders && data ? data.orders : [],
    isLoading,
    error: error ? error.message : null,
    refetchOrderManagement: refetch,
  };
};

export const useRefreshOrderManagement = () => {
  const queryClient = useQueryClient();
  const { user, role } = useAuth();
  const userId = user ? user.id : null;

  return useCallback(async () => {
    if (!userId || (role !== "Owner" && role !== "Cashier")) {
      throw new Error("Sign in with an account that can view orders.");
    }

    const queryOptions = getOrderManagementQueryOptions(userId, role);
    // Mark the old Order History cache as outdated.
    await queryClient.invalidateQueries({
      queryKey: queryOptions.queryKey,
      exact: true,
      refetchType: "none",
    });

    return queryClient.fetchQuery(queryOptions);
  }, [queryClient, userId, role]);
};
