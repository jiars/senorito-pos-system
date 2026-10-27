import { useQuery } from "@tanstack/react-query";
import { fetchOrderItems } from "../services/orders/orderItemsService";
import { useAuth } from "./useAuth";

export const useOrderItems = (orderId) => {
  const { user, role } = useAuth();
  const userId = user ? user.id : null;
  const canReadOrders = Boolean(userId) && (role === "Owner" || role === "Cashier");
  const { data, isLoading, isFetching, error } = useQuery({
    queryKey: ["order-items", userId, role, orderId],
    queryFn: () => fetchOrderItems(orderId),
    enabled: canReadOrders && Boolean(orderId),
    staleTime: 5 * 60 * 1000,
    refetchOnMount: "always",
  });

  return {
    items: canReadOrders && data ? data.items : [],
    // Wait for current receipt status before allowing a cached receipt to print.
    isLoading: isLoading || isFetching,
    orderStatus: canReadOrders && data ? data.order_status : null,
    error: error ? error.message : null,
  };
};
