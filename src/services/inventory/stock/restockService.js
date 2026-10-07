import api from "../../../utils/axios/axiosInstance";

// Sends one Restock payload to Laravel.
export const restockInventoryItem = async (itemId, payload) => {
  try {
    const response = await api.post(
      `/inventory-management/items/${itemId}/restock`,
      payload,
    );

    return response.data;
  } catch (error) {
    console.error("Error restocking inventory item:", error.message);

    // Preserve the HTTP status and validation details for module feedback.
    throw error;
  }
};
