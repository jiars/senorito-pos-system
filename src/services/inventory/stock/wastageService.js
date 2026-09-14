import api from "../../../utils/axios/axiosInstance";

// Sends one Wastage payload to Laravel.
export const recordInventoryWastage = async (itemId, payload) => {
  try {
    const response = await api.post(
      `/inventory-management/items/${itemId}/wastage`,
      payload,
    );

    return response.data;
  } catch (error) {
    console.error("Error recording inventory wastage:", error.message);

    throw new Error(
      error.response?.data?.message || "Failed to record inventory wastage",
    );
  }
};
