import { supabase } from '../supabaseClient';

// --- EXPENSES ---
export const fetchExpenses = async () => {
    const { data, error } = await supabase
        .from('expenses')
        .select(`
            *,
            expense_categories (
                category_name
            ),
            profiles:recorded_by (
                first_name,
                last_name
            )
        `)
        .order('expense_date', { ascending: false });

    if (error) throw new Error(error.message);
    return data;
};

export const addExpense = async (expenseData) => {
    const { data, error } = await supabase
        .from('expenses')
        .insert([expenseData])
        .select()
        .single();

    if (error) throw new Error(error.message);
    return data;
};

export const updateExpense = async (id, expenseData) => {
    const { data, error } = await supabase
        .from('expenses')
        .update(expenseData)
        .eq('id', id)
        .select()
        .single();

    if (error) throw new Error(error.message);
    return data;
};

export const deleteExpense = async (id) => {
    const { error } = await supabase
        .from('expenses')
        .delete()
        .eq('id', id);

    if (error) throw new Error(error.message);
    return true;
};

// --- EXPENSE CATEGORIES ---
export const fetchExpenseCategories = async () => {
    const { data, error } = await supabase
        .from('expense_categories')
        .select('*')
        .order('category_name', { ascending: true });

    if (error) throw new Error(error.message);
    return data;
};

export const addExpenseCategory = async (category_name) => {
    const { data, error } = await supabase
        .from('expense_categories')
        .insert([{ category_name }])
        .select()
        .single();

    if (error) throw new Error(error.message);
    return data;
};

export const updateExpenseCategory = async (id, category_name) => {
    const { data, error } = await supabase
        .from('expense_categories')
        .update({ category_name })
        .eq('id', id)
        .select()
        .single();

    if (error) throw new Error(error.message);
    return data;
};

export const deleteExpenseCategory = async (id) => {
    const { error } = await supabase
        .from('expense_categories')
        .delete()
        .eq('id', id);

    if (error) throw new Error(error.message);
    return true;
};

// --- WASTAGE & INVENTORY PURCHASES (For Dashboard) ---
export const fetchWastage = async () => {
    const { data, error } = await supabase
        .from('wastage')
        .select(`
            *,
            inventory_items ( item_name ),
            profiles:recorded_by ( first_name, last_name )
        `)
        .order('created_at', { ascending: false });

    if (error) throw new Error(error.message);
    return data;
};

export const fetchInventoryPurchases = async () => {
    const { data, error } = await supabase
        .from('inventory_purchase_history')
        .select(`
            *,
            inventory_items ( item_name ),
            profiles:created_by ( first_name, last_name )
        `)
        .order('purchased_at', { ascending: false });

    if (error) throw new Error(error.message);
    return data;
};
