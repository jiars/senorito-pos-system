import { supabase } from './supabaseClient';

export const fetchMenuItems = async () => {
    try {
        const { data, error } = await supabase
            .from('products')
            .select(`
        *,
        category:categories(name),
        variants:product_variants(*)
      `)
            .order('name', { ascending: true });

        if (error) throw error;
        return data;
    } catch (error) {
        console.error('Error fetching menu items:', error.message);
        return [];
    }
};
