import { supabase } from '../supabaseClient';

export const addMenuRecipes = async (recipesArray) => {
    try {
        if (!recipesArray || recipesArray.length === 0) return [];

        const response = await supabase
            .from('menu_recipes')
            .insert(recipesArray)
            .select();

        if (response.error !== null) {
            throw response.error;
        }

        return response.data;
    } catch (error) {
        console.error('Error adding menu recipes:', error.message);
        throw error;
    }
};

export const deleteMenuRecipes = async (menuItemId) => {
    try {
        const response = await supabase
            .from('menu_recipes')
            .delete()
            .eq('menu_item_id', menuItemId);

        if (response.error !== null) {
            throw response.error;
        }

        return true;
    } catch (error) {
        console.error('Error deleting menu recipes:', error.message);
        throw error;
    }
};

export const fetchAffectedMenuItems = async (inventoryItemId) => {
    try {
        const { data, error } = await supabase
            .from('menu_recipes')
            .select(`
                menu_item_id,
                menu_items ( item_name )
            `)
            .eq('inventory_item_id', inventoryItemId);

        if (error) {
            throw error;
        }

        if (!data || data.length === 0) return [];

        // Extract unique menu item names
        const names = data.map(r => r.menu_items?.item_name).filter(Boolean);
        return [...new Set(names)];
    } catch (error) {
        console.error('Error fetching affected menu items:', error.message);
        throw error;
    }
};
