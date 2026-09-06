export const fetchMenuCategories = async () => {
    const token = localStorage.getItem('auth_token');
    try {
        const response = await fetch(`${import.meta.env.VITE_API_BASE_URL}/menu-management/categories`, {
            method: 'GET',
            headers: {
                'Accept': 'application/json',
                'Authorization': `Bearer ${token}`
            }
        });
        if (!response.ok) throw new Error('Failed to fetch categories');
        return await response.json();
    } catch (error) {
        console.error('Error fetching categories:', error.message);
        return [];
    }
};

export const addMenuCategory = async (categoryName) => {
    const token = localStorage.getItem('auth_token');
    try {
        const response = await fetch(`${import.meta.env.VITE_API_BASE_URL}/menu-management/categories`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Accept': 'application/json',
                'Authorization': `Bearer ${token}`
            },
            body: JSON.stringify({ category_name: categoryName })
        });
        if (!response.ok) throw new Error('Failed to add category');

        return await response.json();
    } catch (error) {
        console.error('Error adding category:', error.message);
        throw error;
    }
};

export const updateMenuCategory = async (categoryId, newName) => {
    const token = localStorage.getItem('auth_token');
    try {
        const response = await fetch(`${import.meta.env.VITE_API_BASE_URL}/menu-management/categories/${categoryId}`, {
            method: 'PUT',
            headers: {
                'Content-Type': 'application/json',
                'Accept': 'application/json',
                'Authorization': `Bearer ${token}`
            },
            body: JSON.stringify({ category_name: newName })
        });
        if (!response.ok) throw new Error('Failed to update category');

        return true;
    } catch (error) {
        console.error('Error updating category:', error.message);
        throw error;
    }
};

export const deleteMenuCategory = async (categoryId) => {
    const token = localStorage.getItem('auth_token');
    try {
        const response = await fetch(`${import.meta.env.VITE_API_BASE_URL}/menu-management/categories/${categoryId}`, {
            method: 'DELETE',
            headers: {
                'Accept': 'application/json',
                'Authorization': `Bearer ${token}`
            }
        });
        if (!response.ok) throw new Error('Failed to delete category');

        return true;
    } catch (error) {
        console.error('Error deleting category:', error.message);
        throw error;
    }
};
