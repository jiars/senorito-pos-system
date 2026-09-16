import api from "../../utils/axios/axiosInstance";

// Fetch all data required by Menu Management.
export const fetchMenuManagement = async () => {
  try {
    const response = await api.get("/menu-management/init");

    return response.data;
  } catch (error) {
    console.error("Error fetching Menu Management:", error.message);

    throw new Error(
      error.response?.data?.message || "Failed to fetch Menu Management data",
    );
  }
};
