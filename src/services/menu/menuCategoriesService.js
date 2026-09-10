import api from '../../utils/axios/axiosInstance';

export const fetchMenuCategories = async () => {
    try {
        const response = await api.get('/menu-management/categories');
        return response.data;
    } catch (error) {
        console.error('Error fetching categories:', error.message);
        return [];
    }
};

export const addMenuCategory = async (categoryName) => {
    try {
        const response = await api.post('/menu-management/categories', { category_name: categoryName });
        return response.data;
    } catch (error) {
        console.error('Error adding category:', error.message);
        throw new Error(error.response?.data?.message || 'Failed to add category');
    }
};

export const updateMenuCategory = async (categoryId, newName) => {
    try {
        const response = await api.put(`/menu-management/categories/${categoryId}`, { category_name: newName });
        return true;
    } catch (error) {
        console.error('Error updating category:', error.message);
        throw new Error(error.response?.data?.message || 'Failed to update category');
    }
};

export const deleteMenuCategory = async (categoryId) => {
    try {
        const response = await api.delete(`/menu-management/categories/${categoryId}`);
        return true;
    } catch (error) {
        console.error('Error deleting category:', error.message);
        throw new Error(error.response?.data?.message || 'Failed to delete category');
    }
};
