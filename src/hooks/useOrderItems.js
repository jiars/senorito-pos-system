import { useQuery } from "@tanstack/react-query";
import { fetchOrderItems } from "../services/orders/orderItemsService";

export const useOrderItems = (orderId) => {
  const { data, isLoading, error } = useQuery({
    queryKey: ["order-items", orderId],
    queryFn: () => fetchOrderItems(orderId),
    enabled: Boolean(orderId),
    staleTime: 5 * 60 * 1000,
  });

  return {
    items: data?.items || [],
    isLoading,
    error: error ? error.message : null,
  };
};
