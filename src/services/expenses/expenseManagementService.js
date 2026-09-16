import api from "../../utils/axios/axiosInstance";

// Fetch all data required by Expense Management.
export const fetchExpenseManagement = async () => {
  try {
    const response = await api.get("/expense-management/init");

    return response.data;
  } catch (error) {
    console.error("Error fetching Expense Management:", error.message);

    throw new Error(
      error.response?.data?.message ||
        "Failed to fetch Expense Management data",
    );
  }
};
