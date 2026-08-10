import { supabase } from "../supabaseClient";

// --- STOCK LOG & BATCH FUNCTIONS ---

export const fetchItemBatches = async (itemId) => {
    const { data, error } = await supabase
        .from('inventory_batches')
        .select('*')
        .eq('inventory_item_id', itemId)
        .order('received_date', { ascending: false })
        .limit(20);

    if (error) throw new Error(error.message);
    return data;
};

export const fetchLiveItemStock = async (itemId) => {
    const { data, error } = await supabase
        .from('inventory_items')
        .select('current_stock')
        .eq('id', itemId)
        .single();

    if (error) throw new Error(error.message);
    return data.current_stock;
};

export const fetchItemAuditLogs = async (itemId) => {
    // Fetch Audit Logs with Profile, Batch, and Purchase History in a single nested query
    const { data: logs, error: logsError } = await supabase
        .from('inventory_audit_logs')
        .select(`
            *,
            profiles:performed_by (first_name, last_name),
            inventory_batches (
                batch_number,
                inventory_purchase_history (cost_per_unit)
            )
        `)
        .eq('inventory_item_id', itemId)
        .order('created_at', { ascending: false });

    if (logsError) throw new Error(logsError.message);

    return logs;
};

export const fetchAllAuditLogs = async () => {
    const { data: logs, error: logsError } = await supabase
        .from('inventory_audit_logs')
        .select(`
            *,
            inventory_items (item_name, base_unit),
            profiles:performed_by (first_name, last_name),
            inventory_batches (batch_number)
        `)
        .order('created_at', { ascending: false });

    if (logsError) throw new Error(logsError.message);
    return logs;
};

export const logStockAdjustment = async ({
    item, actionType, quantityChange, newTotalStock,
    userId, reason, notes,
    totalCost, supplier, expirationDate, selectedBatchId
}) => {
    const stockBefore = item.current_stock;
    const stockAfter = newTotalStock;
    let newBatchId = null;

    // 1. If Restock: Create a new Batch and a new Purchase Log
    if (actionType === 'restock') {
        // Auto-generate a batch number like BATCH-20260807-123
        const batchNumber = `BATCH-${new Date().toISOString().split('T')[0].replace(/-/g, '')}-${Math.floor(Math.random() * 1000)}`;

        const { data: batchData, error: batchError } = await supabase
            .from('inventory_batches')
            .insert([{
                inventory_item_id: item.id,
                batch_number: batchNumber,
                quantity: quantityChange,
                expiration_date: expirationDate || null,
                source: supplier || null
            }])
            .select()
            .single();

        if (batchError) throw new Error(`Batch Error: ${batchError.message}`);
        newBatchId = batchData.id;

        // Calculate cost per unit based on what they typed
        const costPerUnit = totalCost > 0 ? (totalCost / quantityChange).toFixed(2) : item.cost_per_unit;

        const { error: purchaseError } = await supabase
            .from('inventory_purchase_history')
            .insert([{
                inventory_item_id: item.id,
                batch_id: newBatchId,
                quantity_purchased: quantityChange,
                purchase_unit: item.base_unit,
                total_cost: totalCost || 0,
                cost_per_unit: costPerUnit,
                supplier: supplier || null,
                created_by: userId
            }]);

        if (purchaseError) throw new Error(`Purchase Error: ${purchaseError.message}`);
    }

    // 2. Update the main Item's overall stock
    const { error: itemError } = await supabase
        .from('inventory_items')
        .update({ current_stock: stockAfter })
        .eq('id', item.id);

    if (itemError) throw new Error(`Update Item Error: ${itemError.message}`);

    // 3. Update specific batch (If it's Wastage/Correct)
    if (actionType === 'wastage' || actionType === 'correct') {
        const isDeduction = actionType === 'wastage' || stockAfter < stockBefore;
        const diffAmount = actionType === 'wastage' ? Number(quantityChange) : Math.abs(stockAfter - stockBefore);
        let remainingToDeduct = diffAmount;

        if (selectedBatchId && isDeduction) {
            // Deduct from selected batch first
            const { data: batch } = await supabase.from('inventory_batches').select('quantity').eq('id', selectedBatchId).single();
            if (batch) {
                const batchQty = Number(batch.quantity);
                const deductAmt = Math.min(batchQty, remainingToDeduct);
                await supabase.from('inventory_batches').update({ quantity: batchQty - deductAmt }).eq('id', selectedBatchId);
                remainingToDeduct -= deductAmt;
            }
        } else if (selectedBatchId && !isDeduction) {
            // Add to selected batch
            const { data: batch } = await supabase.from('inventory_batches').select('quantity').eq('id', selectedBatchId).single();
            if (batch) {
                await supabase.from('inventory_batches').update({ quantity: Number(batch.quantity) + diffAmount }).eq('id', selectedBatchId);
                remainingToDeduct = 0;
            }
        }

        // Spillover FIFO: If there's still amount to deduct (e.g. they selected a batch but deducted MORE than it contained, or didn't select one at all)
        if (remainingToDeduct > 0 && isDeduction) {
            const { data: activeBatches } = await supabase
                .from('inventory_batches')
                .select('id, quantity')
                .eq('inventory_item_id', item.id)
                .neq('id', selectedBatchId || '00000000-0000-0000-0000-000000000000') // Don't re-deduct from the one we just emptied
                .gt('quantity', 0)
                .or(`expiration_date.gte.${new Date().toISOString().split('T')[0]},expiration_date.is.null`)
                .order('expiration_date', { ascending: true, nullsFirst: false });

            if (activeBatches && activeBatches.length > 0) {
                for (let batch of activeBatches) {
                    if (remainingToDeduct <= 0) break;

                    const batchQty = Number(batch.quantity);
                    const deductAmt = Math.min(batchQty, remainingToDeduct);

                    await supabase
                        .from('inventory_batches')
                        .update({ quantity: batchQty - deductAmt })
                        .eq('id', batch.id);

                    remainingToDeduct -= deductAmt;
                }
            }
        } else if (remainingToDeduct > 0 && !isDeduction) {
            // AUTO-ADDITION: Add to newest batch if no batch was selected
            const { data: newestBatches } = await supabase
                .from('inventory_batches')
                .select('id, quantity')
                .eq('inventory_item_id', item.id)
                .order('received_date', { ascending: false })
                .limit(1);
            if (newestBatches && newestBatches.length > 0) {
                await supabase
                    .from('inventory_batches')
                    .update({ quantity: Number(newestBatches[0].quantity) + remainingToDeduct })
                    .eq('id', newestBatches[0].id);
            }
        }
    }

    // 4. Record the movement in Audit Logs
    const finalBatchId = actionType === 'restock' ? newBatchId : selectedBatchId;
    const actionName = actionType === 'restock' ? 'Purchase' : (actionType === 'wastage' ? 'Wastage' : 'Manual Adjustment');

    const { error: auditError } = await supabase
        .from('inventory_audit_logs')
        .insert([{
            inventory_item_id: item.id,
            batch_id: finalBatchId || null,
            action: actionName,
            source: 'Stock Log Modal',
            quantity_change: quantityChange,
            stock_before: stockBefore,
            stock_after: stockAfter,
            reason_reference: notes ? `${reason} - ${notes}` : reason,
            performed_by: userId
        }]);

    if (auditError) throw new Error(`Audit Log Error: ${auditError.message}`);

    return true;
};

export const cleanupExpiredBatches = async (userId) => {
    try {
        const today = new Date().toISOString().split('T')[0];

        // Fetch batches that are expired AND have quantity > 0
        const { data: expiredBatches, error: fetchError } = await supabase
            .from('inventory_batches')
            .select(`
                id, 
                quantity, 
                inventory_item_id, 
                batch_number,
                inventory_items!inner (current_stock)
            `)
            .lt('expiration_date', today)
            .gt('quantity', 0);

        if (fetchError) throw new Error(fetchError.message);
        if (!expiredBatches || expiredBatches.length === 0) return 0; // Nothing to clean up

        let cleanedCount = 0;

        // Process each expired batch
        for (const batch of expiredBatches) {
            const qtyToDeduct = Number(batch.quantity);
            const currentStock = Number(batch.inventory_items.current_stock);
            const newStock = Math.max(0, currentStock - qtyToDeduct);

            // a. Set batch quantity to 0
            await supabase
                .from('inventory_batches')
                .update({ quantity: 0 })
                .eq('id', batch.id);

            // b. Deduct from item's total stock
            await supabase
                .from('inventory_items')
                .update({ current_stock: newStock })
                .eq('id', batch.inventory_item_id);

            // c. Log the auto-deduction
            await supabase
                .from('inventory_audit_logs')
                .insert([{
                    inventory_item_id: batch.inventory_item_id,
                    batch_id: batch.id,
                    action: 'Expired',
                    source: 'System',
                    quantity_change: -qtyToDeduct,
                    stock_before: currentStock,
                    stock_after: newStock,
                    reason_reference: `Auto-Cleanup - Batch ${batch.batch_number}`,
                    performed_by: userId
                }]);

            cleanedCount++;
        }

        return cleanedCount;
    } catch (error) {
        console.error("Cleanup Expired Batches Error:", error);
        return 0;
    }
};
