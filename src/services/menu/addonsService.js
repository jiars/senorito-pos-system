import { supabase } from '../supabaseClient';

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

export const addAddon = async (addonData, categoryIds) => {
    try {
        const response = await supabase
            .from('addons')
            .insert([addonData])
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

        return newAddon;
    } catch (error) {
        console.error('Error adding addon:', error.message);
        throw error;
    }
};

export const updateAddon = async (addonId, addonData, categoryIds) => {
    try {
        if (addonData.pos_status === 'Available') {
            addonData.archived = false;
            if (addonData.recipe_status === 'Archived') {
                addonData.recipe_status = 'Complete';
            }
        }

        const response = await supabase
            .from('addons')
            .update(addonData)
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
                pos_status: 'Unavailable',
                recipe_status: 'Archived'
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
};
