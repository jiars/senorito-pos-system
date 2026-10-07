import api from "../../../utils/axios/axiosInstance";

// Sends the actual physical count to Laravel.
export const correctInventoryStock = async (itemId, payload) => {
  try {
    const response = await api.post(
      `/inventory-management/items/${itemId}/correction`,
      payload,
    );

    return response.data;
  } catch (error) {
    console.error("Error correcting inventory stock:", error.message);

    throw error;
  }
};
