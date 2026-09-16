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

    throw new Error(
      error.response?.data?.message || "Failed to add expense category",
    );
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

    throw new Error(
      error.response?.data?.message || "Failed to update expense category",
    );
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

    throw new Error(
      error.response?.data?.message || "Failed to delete expense category",
    );
  }
};
