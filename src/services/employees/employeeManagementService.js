import api from "../../utils/axios/axiosInstance";

// Fetch everything required by Employee Management.
export const fetchEmployeeManagement = async () => {
  try {
    const response = await api.get("/employee-management/init");

    return response.data;
  } catch (error) {
    console.error("Error fetching Employee Management:", error.message);

    throw new Error(
      error.response?.data?.message ||
        "Failed to fetch Employee Management data",
    );
  }
};
