import api from "../../utils/axios/axiosInstance";

// Fetch all data required by Inventory Management.
export const fetchInventoryManagement = async () => {
  try {
    const response = await api.get("/inventory-management/init");

    return response.data;
  } catch (error) {
    console.error("Error fetching Inventory Management:", error.message);

    throw new Error(
      error.response?.data?.message ||
        "Failed to fetch Inventory Management data",
    );
  }
};
