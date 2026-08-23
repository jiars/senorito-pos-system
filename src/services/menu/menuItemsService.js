import { supabase } from '../supabaseClient';

export const fetchMenuItems = async () => {
    try {
        const response = await supabase
            .from('menu_items')
            .select(`
                *,
                category:menu_categories(category_name),
                prices:menu_item_prices(*),
                recipes:menu_recipes(*)
            `)
            .order('item_name', { ascending: true });

        if (response.error !== null) {
            throw response.error;
        }

        return response.data;
    } catch (error) {
        console.error('Error fetching menu items:', error.message);
        return [];
    }
};

export const archiveMenuItem = async (itemId) => {
    try {
        const response = await supabase
            .from('menu_items')
            .update({
                archived: true,
                pos_status: 'Unavailable',
                recipe_status: 'Archived'
            })
            .eq('id', itemId);

        if (response.error !== null) {
            throw response.error;
        }

        return true;
    } catch (error) {
        console.error('Error archiving menu item:', error.message);
        throw error;
    }
};

export const addMenuItem = async (itemData) => {
    try {
        const response = await supabase
            .from('menu_items')
            .insert([{
                item_name: itemData.item_name,
                category_id: itemData.category_id,
                recipe_status: itemData.recipe_status,
                pos_status: itemData.pos_status,
                pricing_type: itemData.pricing_type,
                image_url: itemData.image_url,
                archived: false
            }])
            .select();

        if (response.error !== null) {
            throw response.error;
        }

        return response.data[0];
    } catch (error) {
        console.error('Error adding menu item:', error.message);
        throw error;
    }
};

export const updateMenuItem = async (itemId, itemData) => {
    try {
        if (itemData.pos_status === 'Available') {
            itemData.archived = false;
            if (itemData.recipe_status === 'Archived') {
                itemData.recipe_status = 'Complete';
            }
        }
        const response = await supabase
            .from('menu_items')
            .update({
                item_name: itemData.item_name,
                category_id: itemData.category_id,
                recipe_status: itemData.recipe_status,
                pos_status: itemData.pos_status,
                pricing_type: itemData.pricing_type,
                image_url: itemData.image_url,
                archived: itemData.archived
            })
            .eq('id', itemId);

        if (response.error !== null) {
            throw response.error;
        }

        return true;
    } catch (error) {
        console.error('Error updating menu item:', error.message);
        throw error;
    }
};

