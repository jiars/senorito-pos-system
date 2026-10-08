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

    // Preserve HTTP status and field errors for the module's feedback/validation.
    throw error;
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

    // Keep HTTP details available to Edit validation and feedback.
    throw error;
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

    // Preserve HTTP details for archive feedback.
    throw error;
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

    // Preserve HTTP details for restore feedback without changing the endpoint.
    throw error;
  }
};
