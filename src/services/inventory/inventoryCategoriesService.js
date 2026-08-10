import { supabase } from '../supabaseClient';

export const fetchInventoryCategories = async () => {
  const { data, error } = await supabase
    .from('inventory_categories')
    .select('*')
    .eq('archived', false)
    .order('category_name', { ascending: true });

  if (error) {
    throw new Error(error.message);
  }
  return data;
};

export const addInventoryCategory = async (categoryName) => {
  const { data, error } = await supabase
    .from('inventory_categories')
    .insert([{ category_name: categoryName }])
    .select()
    .single();

  if (error) {
    throw new Error(error.message);
  }
  return data;
};

export const updateInventoryCategory = async (id, newCategoryName) => {
  const { data, error } = await supabase
    .from('inventory_categories')
    .update({ category_name: newCategoryName })
    .eq('id', id)
    .select()
    .single();

  if (error) {
    throw new Error(error.message);
  }
  return data;
};

export const deleteInventoryCategory = async (id) => {
  // We use soft-delete to preserve references in inventory_items
  const { data, error } = await supabase
    .from('inventory_categories')
    .update({ archived: true })
    .eq('id', id)
    .select()
    .single();

  if (error) {
    throw new Error(error.message);
  }
  return data;
};
