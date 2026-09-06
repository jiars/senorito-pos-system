import { supabase } from '../supabaseClient';
import { formatDecimal } from '../../utils/numberFormatters';
import { logSystemActivity } from '../authService';

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
        id,
        batch_number,
        expiration_date,
        quantity,
        unit_cost,
        source,
        created_at
      ),
      inventory_conversion_units (
        id,
        converted_unit,
        equivalent_base_amount
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
      inventory_conversion_units (
        id,
        converted_unit,
        equivalent_base_amount
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
  // Format numeric values
  if (itemData) {
    itemData.current_stock = formatDecimal(itemData.current_stock);
    itemData.cost_per_unit = formatDecimal(itemData.cost_per_unit);
  }
  if (purchaseData) {
    purchaseData.quantity_purchased = formatDecimal(purchaseData.quantity_purchased);
    purchaseData.total_cost = formatDecimal(purchaseData.total_cost);
    purchaseData.cost_per_unit = formatDecimal(purchaseData.cost_per_unit);
  }
  if (conversionsData) {
    conversionsData = conversionsData.map(c => ({
      ...c,
      equivalent_base_amount: formatDecimal(c.equivalent_base_amount)
    }));
  }

  // 1. Create the Item
  const { data: newItem, error: itemError } = await supabase
    .from('inventory_items')
    .insert([itemData])
    .select()
    .single();

  if (itemError) throw new Error(`Item Error: ${itemError.message}`);
  const itemId = newItem.id;

  try {
    // 2. Create the first Batch automatically
    const batchNumber = `BATCH-${new Date().toISOString().split('T')[0].replace(/-/g, '')}-${Math.floor(Math.random() * 1000)}`;

    const { data: batchData, error: batchError } = await supabase
      .from('inventory_batches')
      .insert([{
        inventory_item_id: itemId,
        batch_number: batchNumber,
        quantity: itemData.current_stock,
        expiration_date: purchaseData.expiration_date || null,
        source: purchaseData.supplier || 'Initial Stock',
        unit_cost: purchaseData.cost_per_unit
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
        quantity_change: itemData.current_stock,
        stock_before: 0,
        stock_after: itemData.current_stock,
        reason_reference: 'Initial Stock Creation',
        performed_by: userId
      }]);

    if (auditError) throw new Error(`Audit Error: ${auditError.message}`);
  } catch (err) {
    // ROLLBACK: Delete the inserted item if any subsequent step fails
    await supabase.from('inventory_items').delete().eq('id', itemId);
    throw err;
  }

  await logSystemActivity();
  return newItem;
};

export const updateInventoryItem = async (id, itemPayload, conversionsData = null) => {
  if (itemPayload.current_stock !== undefined) itemPayload.current_stock = formatDecimal(itemPayload.current_stock);
  if (itemPayload.cost_per_unit !== undefined) itemPayload.cost_per_unit = formatDecimal(itemPayload.cost_per_unit);

  if (conversionsData !== null) {
    conversionsData = conversionsData.map(c => ({
      ...c,
      equivalent_base_amount: formatDecimal(c.equivalent_base_amount)
    }));
  }

  const { data, error } = await supabase
    .from('inventory_items')
    .update(itemPayload)
    .eq('id', id)
    .select()
    .single();

  if (error) {
    throw new Error(error.message);
  }

  if (conversionsData !== null) {
    // Fetch existing
    const { data: existingConversions } = await supabase
      .from('inventory_conversion_units')
      .select('id')
      .eq('inventory_item_id', id);

    const existingIds = (existingConversions || []).map(c => c.id);
    const newIds = conversionsData.filter(c => typeof c.id === 'string' && c.id.includes('-')).map(c => c.id);

    // Delete removed conversions
    const idsToDelete = existingIds.filter(eid => !newIds.includes(eid));
    if (idsToDelete.length > 0) {
      const { error: deleteError } = await supabase
        .from('inventory_conversion_units')
        .delete()
        .in('id', idsToDelete);
      if (deleteError) console.error("Error deleting conversions:", deleteError);
    }

    // Upsert remaining/new
    if (conversionsData.length > 0) {
      const upsertPayload = conversionsData.map(c => {
        const payload = {
          inventory_item_id: id,
          converted_unit: c.converted_unit,
          equivalent_base_amount: c.equivalent_base_amount
        };
        if (typeof c.id === 'string' && c.id.includes('-')) {
          payload.id = c.id;
        }
        return payload;
      });

      const { error: upsertError } = await supabase
        .from('inventory_conversion_units')
        .upsert(upsertPayload);

      if (upsertError) {
        console.error('Failed to upsert conversions:', upsertError);
      }
    }
  }

  await logSystemActivity();
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
  await logSystemActivity();
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
  await logSystemActivity();
  return data;
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
