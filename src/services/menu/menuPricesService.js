import { supabase } from '../supabaseClient';

export const addMenuItemPrices = async (pricesArray) => {
    try {
        const response = await supabase
            .from('menu_item_prices')
            .insert(pricesArray)
            .select();

        if (response.error !== null) {
            throw response.error;
        }

        return response.data;
    } catch (error) {
        console.error('Error adding menu item prices:', error.message);
        throw error;
    }
};

export const deleteMenuItemPrices = async (menuItemId) => {
    try {
        const response = await supabase
            .from('menu_item_prices')
            .delete()
            .eq('menu_item_id', menuItemId);

        if (response.error !== null) {
            throw response.error;
        }

        return true;
    } catch (error) {
        console.error('Error deleting menu item prices:', error.message);
        throw error;
    }
};
