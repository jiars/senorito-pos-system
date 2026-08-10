import { supabase } from '../supabaseClient';

export const fetchInventoryItems = async () => {
  const { data, error } = await supabase
    .from('inventory_items')
    .select(`
      *,
      inventory_categories (
        id,
        category_name
      ),
      inventory_batches (
        expiration_date,
        quantity
      ),
      inventory_audit_logs (
        created_at,
        action
      )
    `)
    .eq('archived', false)
    .order('item_name', { ascending: true });

  if (error) {
    throw new Error(error.message);
  }
  return data;
};

export const fetchArchivedInventoryItems = async () => {
  const { data, error } = await supabase
    .from('inventory_items')
    .select(`
      *,
      inventory_categories (
        id,
        category_name
      ),
      profiles:archived_by (
        first_name,
        last_name
      )
    `)
    .eq('archived', true)
    .order('item_name', { ascending: true });

  if (error) {
    throw new Error(error.message);
  }
  return data;
};

export const fetchUnits = async () => {
  const { data, error } = await supabase.rpc('get_inventory_unit_enum_values');

  if (error) throw new Error(error.message);
  return data;
};


export const addInventoryItem = async ({ itemData, purchaseData, conversionsData, userId }) => {
  // 1. Create the Item
  const { data: newItem, error: itemError } = await supabase
    .from('inventory_items')
    .insert([itemData])
    .select()
    .single();

  if (itemError) throw new Error(`Item Error: ${itemError.message}`);
  const itemId = newItem.id;

  // 2. Create the first Batch automatically
  const batchNumber = `BATCH-${new Date().toISOString().split('T')[0].replace(/-/g, '')}-${Math.floor(Math.random() * 1000)}`;

  const { data: batchData, error: batchError } = await supabase
    .from('inventory_batches')
    .insert([{
      inventory_item_id: itemId,
      batch_number: batchNumber,
      quantity: purchaseData.quantity_purchased,
      expiration_date: purchaseData.expiration_date || null,
      source: purchaseData.supplier || 'Initial Stock'
    }])
    .select()
    .single();

  if (batchError) throw new Error(`Batch Error: ${batchError.message}`);
  const newBatchId = batchData.id;

  // 3. Record the Purchase using the new Batch ID
  const { error: purchaseError } = await supabase
    .from('inventory_purchase_history')
    .insert([{
      inventory_item_id: itemId,
      batch_id: newBatchId, // Link it to the batch!
      quantity_purchased: purchaseData.quantity_purchased,
      purchase_unit: purchaseData.purchase_unit,
      total_cost: purchaseData.total_cost,
      cost_per_unit: purchaseData.cost_per_unit,
      supplier: purchaseData.supplier || 'Initial Stock',
      created_by: userId
    }]);

  if (purchaseError) throw new Error(`Purchase Error: ${purchaseError.message}`);

  // 4. Record Unit Conversions (if any)
  if (conversionsData && conversionsData.length > 0) {
    const conversionsToInsert = conversionsData.map(conv => ({
      inventory_item_id: itemId,
      converted_unit: conv.converted_unit,
      equivalent_base_amount: conv.equivalent_base_amount
    }));

    const { error: convError } = await supabase
      .from('inventory_conversion_units')
      .insert(conversionsToInsert);

    if (convError) throw new Error(`Conversion Error: ${convError.message}`);
  }

  // 5. Record Audit Log
  const { error: auditError } = await supabase
    .from('inventory_audit_logs')
    .insert([{
      inventory_item_id: itemId,
      batch_id: newBatchId, // Link it to the batch!
      action: 'Purchase',
      source: 'Add Item Modal',
      quantity_change: purchaseData.quantity_purchased,
      stock_before: 0,
      stock_after: purchaseData.quantity_purchased,
      reason_reference: 'Initial Stock Creation',
      performed_by: userId
    }]);

  if (auditError) throw new Error(`Audit Error: ${auditError.message}`);

  return newItem;
};

export const updateInventoryItem = async (id, itemPayload) => {
  const { data, error } = await supabase
    .from('inventory_items')
    .update(itemPayload)
    .eq('id', id)
    .select()
    .single();

  if (error) {
    throw new Error(error.message);
  }
  return data;
};

export const archiveInventoryItem = async (id, userId) => {
  const { data, error } = await supabase
    .from('inventory_items')
    .update({
      archived: true,
      archived_by: userId
    })
    .eq('id', id)
    .select()
    .single();

  if (error) {
    throw new Error(error.message);
  }
  return data;
};

export const unarchiveInventoryItem = async (id) => {
  const { data, error } = await supabase
    .from('inventory_items')
    .update({
      archived: false,
      archived_by: null
    })
    .eq('id', id)
    .select()
    .single();

  if (error) {
    throw new Error(error.message);
  }
  return data;
};
