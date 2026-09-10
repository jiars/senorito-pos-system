import api from '../../utils/axios/axiosInstance';

export const addInventoryCategory = async (categoryName) => {
  try {
    const response = await api.post('/inventory-management/categories', {
      category_name: categoryName
    });
    return response.data;
  } catch (error) {
    throw new Error(error.response?.data?.message || 'Failed to add inventory category');
  }
};

export const updateInventoryCategory = async (id, newCategoryName) => {
  try {
    const response = await api.put(`/inventory-management/categories/${id}`, {
      category_name: newCategoryName
    });
    return response.data;
  } catch (error) {
    throw new Error(error.response?.data?.message || 'Failed to update inventory category');
  }
};

export const deleteInventoryCategory = async (id) => {
  try {
    const response = await api.delete(`/inventory-management/categories/${id}`);
    return response.data;
  } catch (error) {
    throw new Error(error.response?.data?.message || 'Failed to delete inventory category');
  }
};
