import api from "../../utils/axios/axiosInstance";

// Fetch filtered Sales Report data through Laravel.
export const fetchSalesReport = async () => {
  try {
    const response = await api.get("/report-management/sales/init");

    return response.data;
  } catch (error) {
    console.error("Error fetching Sales Report:", error.message);

    throw new Error(
      error.response?.data?.message || "Failed to fetch Sales Report",
    );
  }
};
