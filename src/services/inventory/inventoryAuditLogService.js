import api from "../../utils/axios/axiosInstance";

// Fetch the complete Inventory Audit Log through Laravel.
export const fetchInventoryAuditLogs = async () => {
  try {
    const response = await api.get("/inventory-management/audit-logs");
    return response.data;
  } catch (error) {
    console.error("Error fetching inventory audit logs", error.message);

    throw new Error(
      error.response?.data?.message || "Failed to fetch inventory audit s",
    );
  }
};
