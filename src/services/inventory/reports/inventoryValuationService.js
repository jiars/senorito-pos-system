import api from "../../../utils/axios/axiosInstance";

// Fetch raw valuation data through Laravel.
export const fetchInventoryValuation = async () => {
  try {
    const response = await api.get("/inventory-management/reports/valuation");

    return response.data.items || [];
  } catch (error) {
    console.error("Error fetching inventory audit logs", error.message);

    throw new Error(
      error.response?.data?.message ||
        "Failed to fetch inventory valuation report",
    );
  }
};
