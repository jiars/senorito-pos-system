import { supabase } from '../supabaseClient';
import { logSystemActivity } from '../authService';
import { formatDecimal } from '../../utils/numberFormatters';

// ─── 1. Fetch All Active Add-ons (with their linked categories) ───
export const fetchAddons = async () => {
    try {
        const response = await supabase
            .from('addons')
            .select(`
                *,
                addon_categories (
                    menu_category_id,
                    menu_categories (
                        category_name
                    )
                ),
                addon_recipes (
                    id,
                    inventory_item_id,
                    quantity,
                    unit,
                    estimated_cost,
                    inventory_items (
                        item_name,
                        base_unit,
                        current_stock,
                        inventory_conversion_units(
                            converted_unit,
                            equivalent_base_amount
                        )
                    )
                )
            `)
            .order('addon_name', { ascending: true });

        if (response.error !== null) {
            throw response.error;
        }

        return response.data;
    } catch (error) {
        console.error('Error fetching addons:', error.message);
        return [];
    }
};

export const addAddon = async (addonData, categoryIds, recipes) => {
    try {
        const formattedAddonData = {
            ...addonData,
            selling_price: formatDecimal(addonData.selling_price),
            estimated_cost: formatDecimal(addonData.estimated_cost),
            profit: formatDecimal(addonData.profit),
            margin: formatDecimal(addonData.margin)
        };

        const response = await supabase
            .from('addons')
            .insert([formattedAddonData])
            .select();

        if (response.error !== null) {
            throw response.error;
        }

        const newAddon = response.data[0];

        if (categoryIds && categoryIds.length > 0) {
            const categoryLinks = categoryIds.map((catId) => {
                return {
                    addon_id: newAddon.id,
                    menu_category_id: catId
                };
            });

            const linkResponse = await supabase
                .from('addon_categories')
                .insert(categoryLinks);

            if (linkResponse.error !== null) {
                throw linkResponse.error;
            }
        }

        // Insert recipes
        if (recipes && recipes.length > 0) {
            const recipeLinks = recipes.map(recipe => ({
                addon_id: newAddon.id,
                inventory_item_id: recipe.inventory_item_id,
                quantity: formatDecimal(recipe.quantity),
                unit: recipe.unit,
                estimated_cost: formatDecimal(recipe.estimated_cost)
            }));

            const recipeResponse = await supabase
                .from('addon_recipes')
                .insert(recipeLinks);

            if (recipeResponse.error !== null) {
                throw recipeResponse.error;
            }
        }

        await logSystemActivity();
        return newAddon;
    } catch (error) {
        console.error('Error adding addon:', error.message);
        throw error;
    }
};

export const updateAddon = async (addonId, addonData, categoryIds, recipes) => {
    try {
        if (addonData.pos_status === 'Available') {
            addonData.archived = false;
        }

        const formattedAddonData = {
            ...addonData,
            selling_price: addonData.selling_price !== undefined ? formatDecimal(addonData.selling_price) : addonData.selling_price,
            estimated_cost: addonData.estimated_cost !== undefined ? formatDecimal(addonData.estimated_cost) : addonData.estimated_cost,
            profit: addonData.profit !== undefined ? formatDecimal(addonData.profit) : addonData.profit,
            margin: addonData.margin !== undefined ? formatDecimal(addonData.margin) : addonData.margin
        };

        const response = await supabase
            .from('addons')
            .update(formattedAddonData)
            .eq('id', addonId)
            .select();

        if (response.error !== null) {
            throw response.error;
        }

        if (categoryIds !== undefined && categoryIds !== null) {
            const deleteResponse = await supabase
                .from('addon_categories')
                .delete()
                .eq('addon_id', addonId);

            if (deleteResponse.error !== null) {
                throw deleteResponse.error;
            }

            if (categoryIds.length > 0) {
                const categoryLinks = categoryIds.map((catId) => {
                    return {
                        addon_id: addonId,
                        menu_category_id: catId
                    };
                });

                const insertResponse = await supabase
                    .from('addon_categories')
                    .insert(categoryLinks);

                if (insertResponse.error !== null) {
                    throw insertResponse.error;
                }
            }
        }

        // Update recipes if provided
        if (recipes !== undefined && recipes !== null) {
            // Delete old recipes
            const deleteRecipeResponse = await supabase
                .from('addon_recipes')
                .delete()
                .eq('addon_id', addonId);

            if (deleteRecipeResponse.error !== null) {
                throw deleteRecipeResponse.error;
            }

            // Insert new recipes
            if (recipes.length > 0) {
                const recipeLinks = recipes.map(recipe => ({
                    addon_id: addonId,
                    inventory_item_id: recipe.inventory_item_id,
                    quantity: formatDecimal(recipe.quantity),
                    unit: recipe.unit,
                    estimated_cost: formatDecimal(recipe.estimated_cost)
                }));

                const recipeInsertResponse = await supabase
                    .from('addon_recipes')
                    .insert(recipeLinks);

                if (recipeInsertResponse.error !== null) {
                    throw recipeInsertResponse.error;
                }
            }
        }

        await logSystemActivity();
        return response.data[0];
    } catch (error) {
        console.error('Error updating addon:', error.message);
        throw error;
    }
};

export const archiveAddon = async (addonId) => {
    try {
        const response = await supabase
            .from('addons')
            .update({
                archived: true,
                pos_status: 'Unavailable'
            })
            .eq('id', addonId);

        if (response.error !== null) {
            throw response.error;
        }

        return true;
    } catch (error) {
        console.error('Error archiving addon:', error.message);
        throw error;
    }
    await logSystemActivity();
};
