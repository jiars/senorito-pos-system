import api from "../../utils/axios/axiosInstance";

export const addInventoryCategory = async (categoryName) => {
  try {
    const response = await api.post("/inventory-management/categories", {
      category_name: categoryName,
    });
    return response.data;
  } catch (error) {
    console.error("Failed to add inventory category:", error.message);
    throw error;
  }
};

export const updateInventoryCategory = async (id, newCategoryName) => {
  try {
    const response = await api.put(`/inventory-management/categories/${id}`, {
      category_name: newCategoryName,
    });
    return response.data;
  } catch (error) {
    console.error("Failed to update inventory category:", error.message);
    throw error;
  }
};

export const deleteInventoryCategory = async (id) => {
  try {
    const response = await api.delete(`/inventory-management/categories/${id}`);
    return response.data;
  } catch (error) {
    console.error("Failed to delete inventory category:", error.message);
    throw error;
  }
};
