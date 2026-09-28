import api from "../../utils/axios/axiosInstance";

// Create one Expense record.
export const addExpense = async (expenseData) => {
  try {
    const response = await api.post(
      "/expense-management/expenses",
      expenseData,
    );

    return response.data;
  } catch (error) {
    console.error("Error adding expense:", error.message);

    throw new Error(error.response?.data?.message || "Failed to add expense");
  }
};

// Update one active Expense record.
export const updateExpense = async (expenseId, expenseData) => {
  try {
    const response = await api.put(
      `/expense-management/expenses/${expenseId}/sync`,
      expenseData,
    );

    return response.data;
  } catch (error) {
    console.error("Error updating expense:", error.message);

    throw new Error(
      error.response?.data?.message || "Failed to update expense",
    );
  }
};

// Archive without deleting the financial record.
export const archiveExpense = async (expenseId) => {
  try {
    const response = await api.delete(
      `/expense-management/expenses/${expenseId}`,
    );

    return response.data;
  } catch (error) {
    console.error("Error archiving expense:", error.message);

    throw new Error(
      error.response?.data?.message || "Failed to archive expense",
    );
  }
};

// Restore an archived Expense record.
export const unarchiveExpense = async (expenseId) => {
  try {
    const response = await api.patch(
      `/expense-management/expenses/${expenseId}/unarchive`,
    );

    return response.data;
  } catch (error) {
    console.error("Error restoring expense:", error.message);

    throw new Error(
      error.response?.data?.message || "Failed to restore expense",
    );
  }
};
