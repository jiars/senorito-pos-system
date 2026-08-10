import { supabase } from '../supabaseClient';

export const fetchMenuCategories = async () => {
    try {
        const response = await supabase
            .from('menu_categories')
            .select('*')
            .order('category_name', { ascending: true });

        if (response.error !== null) {
            throw response.error;
        }

        return response.data;
    } catch (error) {
        console.error('Error fetching categories:', error.message);
        return [];
    }
};

export const addMenuCategory = async (categoryName) => {
    try {
        const response = await supabase
            .from('menu_categories')
            .insert([{ category_name: categoryName }])
            .select();

        if (response.error !== null) {
            throw response.error;
        }

        return response.data[0];
    } catch (error) {
        console.error('Error adding category:', error.message);
        throw error;
    }
};

export const updateMenuCategory = async (categoryId, newName) => {
    try {
        const response = await supabase
            .from('menu_categories')
            .update({ category_name: newName })
            .eq('id', categoryId);

        if (response.error !== null) {
            throw response.error;
        }

        return true;
    } catch (error) {
        console.error('Error updating category:', error.message);
        throw error;
    }
};

export const deleteMenuCategory = async (categoryId) => {
    try {
        const response = await supabase
            .from('menu_categories')
            .delete()
            .eq('id', categoryId);

        if (response.error !== null) {
            throw response.error;
        }

        return true;
    } catch (error) {
        console.error('Error deleting category:', error.message);
        throw error;
    }
};
