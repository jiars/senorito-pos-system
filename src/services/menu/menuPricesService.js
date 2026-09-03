import { supabase } from '../supabaseClient';
import { formatDecimal } from '../../utils/numberFormatters';
import { logSystemActivity } from '../authService';

export const addMenuItemPrices = async (pricesArray) => {
    try {
        const formattedPrices = pricesArray.map(priceObj => ({
            ...priceObj,
            selling_price: formatDecimal(priceObj.selling_price),
            estimated_cost: formatDecimal(priceObj.estimated_cost),
            profit: formatDecimal(priceObj.profit),
            margin: formatDecimal(priceObj.margin)
        }));

        const response = await supabase
            .from('menu_item_prices')
            .insert(formattedPrices)
            .select();

        if (response.error !== null) {
            throw response.error;
        }
        await logSystemActivity();
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
        await logSystemActivity();
        return true;
    } catch (error) {
        console.error('Error deleting menu item prices:', error.message);
        throw error;
    }
};
