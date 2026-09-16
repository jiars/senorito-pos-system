import api from "../../utils/axios/axiosInstance";

// Fetch the receipt contents only when an order is viewed.
export const fetchOrderItems = async (orderId) => {
  try {
    const response = await api.get(`/order-management/orders/${orderId}/items`);

    return response.data;
  } catch (error) {
    console.error("Error fetching Order items:", error.message);

    throw new Error(
      error.response?.data?.message || "Failed to fetch Order items",
    );
  }
};
