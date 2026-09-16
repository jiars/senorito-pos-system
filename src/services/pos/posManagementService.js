import api from "../../utils/axios/axiosInstance";

// Fetch all data required by the POS page.
export const fetchPosManagement = async () => {
  try {
    const response = await api.get("/pos-management/init");

    return response.data;
  } catch (error) {
    console.error("Error fetching POS Management:", error.message);

    throw new Error(
      error.response?.data?.message || "Failed to fetch POS data",
    );
  }
};
