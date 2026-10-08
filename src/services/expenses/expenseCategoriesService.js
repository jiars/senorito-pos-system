import api from "../../utils/axios/axiosInstance";

// Add one new category.
export const addExpenseCategory = async (categoryName) => {
  try {
    const response = await api.post("/expense-management/categories", {
      category_name: categoryName,
    });

    return response.data;
  } catch (error) {
    console.error("Error adding expense categories", error.message);

    // Keep HTTP status and validation details available to category feedback.
    throw error;
  }
};

// Update an existing category name.
export const updateExpenseCategory = async (categoryId, categoryName) => {
  try {
    const response = await api.put(
      `/expense-management/categories/${categoryId}`,
      {
        category_name: categoryName,
      },
    );

    return response.data;
  } catch (error) {
    console.error("Error updating expense categories", error.message);

    throw error;
  }
};

// Laravel only allows deletion when the category is unused.
export const deleteExpenseCategory = async (categoryId) => {
  try {
    const response = await api.delete(
      `/expense-management/categories/${categoryId}`,
    );

    return response.data;
  } catch (error) {
    console.error("Error deleting expense categories", error.message);

    throw error;
  }
};
