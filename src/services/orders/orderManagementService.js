import api from "../../utils/axios/axiosInstance";

// Fetch the Order History list.
export const fetchOrderManagement = async () => {
  try {
    const response = await api.get("/order-management/init");

    return response.data;
  } catch (error) {
    console.error("Error fetching Order History:", error.message);

    throw new Error(
      error.response?.data?.message || "Failed to fetch Order History",
    );
  }
};
