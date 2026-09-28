import { supabase } from "../supabaseClient";
import { formatDecimal } from "../../utils/numberFormatters";

// --- STOCK LOG & BATCH FUNCTIONS ---

export const fetchItemBatches = async (itemId) => {
  const { data, error } = await supabase
    .from("inventory_batches")
    .select("*")
    .eq("inventory_item_id", itemId)
    .order("received_date", { ascending: false })
    .order("created_at", { ascending: false })
    .limit(20);

  if (error) throw new Error(error.message);
  return data;
};

export const fetchLiveItemStock = async (itemId) => {
  const { data, error } = await supabase
    .from("inventory_items")
    .select("current_stock")
    .eq("id", itemId)
    .single();

  if (error) throw new Error(error.message);
  return data.current_stock;
};

export const fetchItemAuditLogs = async (itemId) => {
  // Fetch Audit Logs with Profile, Batch, and Purchase History in a single nested query
  const { data: logs, error: logsError } = await supabase
    .from("inventory_audit_logs")
    .select(
      `
            *,
            profiles:performed_by (first_name, last_name),
            inventory_batches (
                batch_number,
                inventory_purchase_history (cost_per_unit)
            )
        `,
    )
    .eq("inventory_item_id", itemId)
    .order("created_at", { ascending: false });

  if (logsError) throw new Error(logsError.message);

  return logs;
};

export const fetchAllAuditLogs = async () => {
  const { data: logs, error: logsError } = await supabase
    .from("inventory_audit_logs")
    .select(
      `
            *,
            inventory_items (item_name, base_unit),
            profiles:performed_by (first_name, last_name),
            inventory_batches (batch_number)
        `,
    )
    .order("created_at", { ascending: false });

  if (logsError) throw new Error(logsError.message);
  return logs;
};

export const updateItemFifoCost = async (itemId) => {
  try {
    const { data: batches, error } = await supabase
      .from("inventory_batches")
      .select("quantity, unit_cost, created_at")
      .eq("inventory_item_id", itemId);

    if (error || !batches || batches.length === 0) return;

    const activeBatches = batches.filter((b) => Number(b.quantity) > 0);
    const depletedBatches = batches.filter((b) => Number(b.quantity) <= 0);

    let targetCost = null;

    if (activeBatches.length > 0) {
      // FIFO: Oldest active batch first
      activeBatches.sort(
        (a, b) => new Date(a.created_at) - new Date(b.created_at),
      );
      targetCost = activeBatches[0].unit_cost;
    } else if (depletedBatches.length > 0) {
      // Fallback: Newest depleted batch (last known price)
      depletedBatches.sort(
        (a, b) => new Date(b.created_at) - new Date(a.created_at),
      );
      targetCost = depletedBatches[0].unit_cost;
    }

    if (targetCost !== null) {
      await supabase
        .from("inventory_items")
        .update({ cost_per_unit: targetCost })
        .eq("id", itemId);
    }
  } catch (err) {
    console.error("Error updating FIFO cost:", err);
  }
};

export const logStockAdjustment = async ({
  item,
  actionType,
  quantityChange,
  newTotalStock,
  userId,
  reason,
  notes,
  totalCost,
  supplier,
  expirationDate,
  selectedBatchId,
  expenseDate,
  paymentMethod,
  receiptReference,
  source = "Stock Log Modal",
}) => {
  quantityChange = formatDecimal(quantityChange);
  newTotalStock = formatDecimal(newTotalStock);
  totalCost = formatDecimal(totalCost);

  const stockBefore = formatDecimal(item.current_stock);
  const stockAfter = newTotalStock;
  let newBatchId = null;

  // 1. If Restock: Create a new Batch and a new Purchase Log
  if (actionType === "restock") {
    // Calculate cost per unit based on what they typed
    const costPerUnit =
      totalCost > 0
        ? (totalCost / quantityChange).toFixed(2)
        : item.cost_per_unit;

    // Auto-generate a batch number like BATCH-20260807-123
    const batchNumber = `BATCH-${new Date().toISOString().split("T")[0].replace(/-/g, "")}-${Math.floor(Math.random() * 1000)}`;

    const { data: batchData, error: batchError } = await supabase
      .from("inventory_batches")
      .insert([
        {
          inventory_item_id: item.id,
          batch_number: batchNumber,
          quantity: quantityChange,
          expiration_date: expirationDate || null,
          source: supplier || null,
          unit_cost: formatDecimal(costPerUnit),
        },
      ])
      .select()
      .single();

    if (batchError) throw new Error(`Batch Error: ${batchError.message}`);
    newBatchId = batchData.id;

    const { error: purchaseError } = await supabase
      .from("inventory_purchase_history")
      .insert([
        {
          inventory_item_id: item.id,
          batch_id: newBatchId,
          quantity_purchased: quantityChange,
          purchase_unit: item.base_unit,
          total_cost: totalCost || 0,
          cost_per_unit: formatDecimal(costPerUnit),
          supplier: supplier || null,
          created_by: userId,
        },
      ]);

    if (purchaseError)
      throw new Error(`Purchase Error: ${purchaseError.message}`);
  }

  // 2. Update the main Item's overall stock
  const { error: itemError } = await supabase
    .from("inventory_items")
    .update({ current_stock: stockAfter })
    .eq("id", item.id);

  if (itemError) throw new Error(`Update Item Error: ${itemError.message}`);

  let totalWastageCost = 0;
  let firstDeductedBatchId = null;

  // 3. Update specific batch (If it's Wastage/Correct/POS Sale)
  if (
    actionType === "wastage" ||
    actionType === "correct" ||
    actionType === "pos_sale"
  ) {
    const isDeduction =
      actionType === "wastage" ||
      actionType === "pos_sale" ||
      stockAfter < stockBefore;
    const diffAmount =
      actionType === "wastage" || actionType === "pos_sale"
        ? Math.abs(Number(quantityChange))
        : Math.abs(stockAfter - stockBefore);
    let remainingToDeduct = diffAmount;

    if (selectedBatchId && isDeduction) {
      // Deduct from selected batch first
      const { data: batch } = await supabase
        .from("inventory_batches")
        .select("quantity, unit_cost")
        .eq("id", selectedBatchId)
        .single();
      if (batch) {
        const batchQty = Number(batch.quantity);
        const deductAmt = Math.min(batchQty, remainingToDeduct);
        await supabase
          .from("inventory_batches")
          .update({ quantity: formatDecimal(batchQty - deductAmt) })
          .eq("id", selectedBatchId);
        remainingToDeduct -= deductAmt;
        totalWastageCost +=
          deductAmt * (Number(batch.unit_cost) || item.cost_per_unit);
        firstDeductedBatchId = selectedBatchId;
      }
    } else if (selectedBatchId && !isDeduction) {
      // Add to selected batch
      const { data: batch } = await supabase
        .from("inventory_batches")
        .select("quantity")
        .eq("id", selectedBatchId)
        .single();
      if (batch) {
        await supabase
          .from("inventory_batches")
          .update({
            quantity: formatDecimal(Number(batch.quantity) + diffAmount),
          })
          .eq("id", selectedBatchId);
        remainingToDeduct = 0;
      }
    }

    // Spillover FIFO: If there's still amount to deduct (e.g. they selected a batch but deducted MORE than it contained, or didn't select one at all)
    if (remainingToDeduct > 0 && isDeduction) {
      const { data: activeBatches } = await supabase
        .from("inventory_batches")
        .select("id, quantity, unit_cost")
        .eq("inventory_item_id", item.id)
        .neq("id", selectedBatchId || "00000000-0000-0000-0000-000000000000") // Don't re-deduct from the one we just emptied
        .gt("quantity", 0)
        .or(
          `expiration_date.gte.${new Date().toISOString().split("T")[0]},expiration_date.is.null`,
        )
        .order("expiration_date", { ascending: true, nullsFirst: false })
        .order("created_at", { ascending: true });

      if (activeBatches && activeBatches.length > 0) {
        for (let batch of activeBatches) {
          if (remainingToDeduct <= 0) break;

          const batchQty = Number(batch.quantity);
          const deductAmt = Math.min(batchQty, remainingToDeduct);

          await supabase
            .from("inventory_batches")
            .update({ quantity: formatDecimal(batchQty - deductAmt) })
            .eq("id", batch.id);

          remainingToDeduct -= deductAmt;
          totalWastageCost +=
            deductAmt * (Number(batch.unit_cost) || item.cost_per_unit);
          if (!firstDeductedBatchId) firstDeductedBatchId = batch.id;
        }
      }
    } else if (remainingToDeduct > 0 && !isDeduction) {
      // AUTO-ADDITION: Add to newest batch if no batch was selected
      const { data: newestBatches } = await supabase
        .from("inventory_batches")
        .select("id, quantity")
        .eq("inventory_item_id", item.id)
        .order("received_date", { ascending: false })
        .limit(1);
      if (newestBatches && newestBatches.length > 0) {
        await supabase
          .from("inventory_batches")
          .update({
            quantity: formatDecimal(
              Number(newestBatches[0].quantity) + remainingToDeduct,
            ),
          })
          .eq("id", newestBatches[0].id);
      }
    }
  }

  const finalBatchId =
    actionType === "restock"
      ? newBatchId
      : firstDeductedBatchId || selectedBatchId;

  let actionName = "Manual Adjustment";
  if (actionType === "restock") actionName = "Purchase";
  else if (actionType === "wastage") actionName = "Wastage";
  else if (actionType === "pos_sale") actionName = "POS Sale";

  let finalQtyChange = Number(quantityChange);
  if (actionType === "wastage" || actionType === "pos_sale") {
    finalQtyChange = -Math.abs(finalQtyChange);
  }

  const { error: auditError } = await supabase
    .from("inventory_audit_logs")
    .insert([
      {
        inventory_item_id: item.id,
        batch_id: finalBatchId || null,
        action: actionName,
        source: source,
        quantity_change: finalQtyChange,
        stock_before: stockBefore,
        stock_after: stockAfter,
        reason_reference: notes ? `${reason} - ${notes}` : reason,
        performed_by: userId,
      },
    ]);

  if (auditError) throw new Error(`Audit Log Error: ${auditError.message}`);

  // 5. Centralize into Expenses Table (If Purchase or Wastage)
  if (actionType === "restock" || actionType === "wastage") {
    const categoryName =
      actionType === "restock" ? "Inventory Purchase" : "Inventory Wastage";

    // Find the category ID (Assuming user has manually inserted this via SQL)
    const { data: catData } = await supabase
      .from("expense_categories")
      .select("id")
      .ilike("category_name", categoryName)
      .maybeSingle();

    if (catData) {
      const categoryId = catData.id;
      // For restock we use totalCost. For wastage, we use the precisely calculated batch-level totalWastageCost.
      const calculatedCost =
        actionType === "wastage" ? totalWastageCost : totalCost;

      let wastedBatchNum = "Auto-FIFO";
      if (actionType === "wastage" && selectedBatchId) {
        const { data: bData } = await supabase
          .from("inventory_batches")
          .select("batch_number")
          .eq("id", selectedBatchId)
          .single();
        if (bData) wastedBatchNum = bData.batch_number;
      }

      const descText =
        actionType === "restock"
          ? `Restock: ${item.item_name}`
          : `Wastage: ${item.item_name} [Qty: ${Math.abs(Number(quantityChange))} ${item.base_unit}] - ${reason} [Batch: ${wastedBatchNum}]`;

      await supabase.from("expenses").insert([
        {
          category_id: categoryId,
          description: descText,
          amount: formatDecimal(calculatedCost) || 0,
          vendor: actionType === "restock" ? supplier || null : null,
          recorded_by: userId,
          expense_date: expenseDate || new Date().toISOString().split("T")[0],
          payment_method: paymentMethod || null,
          receipt_reference: receiptReference || null,
        },
      ]);
    }
  }

  // 6. Automatically recalculate and update the FIFO cost cache for the master item
  await updateItemFifoCost(item.id);

  return true;
};

export const cleanupExpiredBatches = async (userId) => {
  try {
    const today = new Date().toISOString().split("T")[0];

    // Fetch batches that are expired AND have quantity > 0
    const { data: expiredBatches, error: fetchError } = await supabase
      .from("inventory_batches")
      .select(
        `
                id, 
                quantity, 
                inventory_item_id, 
                batch_number,
                unit_cost,
                inventory_items!inner (item_name, base_unit, current_stock)
            `,
      )
      .lt("expiration_date", today)
      .gt("quantity", 0);

    if (fetchError) throw new Error(fetchError.message);
    if (!expiredBatches || expiredBatches.length === 0) return 0; // Nothing to clean up

    // Pre-fetch the Inventory Wastage category ID for the expenses table
    const { data: catData } = await supabase
      .from("expense_categories")
      .select("id")
      .ilike("category_name", "Inventory Wastage")
      .maybeSingle();
    const categoryId = catData ? catData.id : null;

    let cleanedCount = 0;

    // Process each expired batch
    for (const batch of expiredBatches) {
      const qtyToDeduct = Number(batch.quantity);
      const currentStock = Number(batch.inventory_items.current_stock);
      const newStock = Math.max(0, currentStock - qtyToDeduct);

      // a. Set batch quantity to 0
      await supabase
        .from("inventory_batches")
        .update({ quantity: 0 })
        .eq("id", batch.id);

      // b. Deduct from item's total stock
      await supabase
        .from("inventory_items")
        .update({ current_stock: newStock })
        .eq("id", batch.inventory_item_id);

      // c. Log the auto-deduction
      await supabase.from("inventory_audit_logs").insert([
        {
          inventory_item_id: batch.inventory_item_id,
          batch_id: batch.id,
          action: "Expired",
          source: "System",
          quantity_change: -qtyToDeduct,
          stock_before: currentStock,
          stock_after: newStock,
          reason_reference: `Auto-Cleanup - Batch ${batch.batch_number}`,
          performed_by: userId,
        },
      ]);

      // d. Insert into Expenses (Financial Loss)
      if (categoryId) {
        const unitCost = Number(batch.unit_cost) || 0;
        const financialLoss = qtyToDeduct * unitCost;
        const descText = `Wastage: ${batch.inventory_items.item_name} [Qty: ${qtyToDeduct} ${batch.inventory_items.base_unit}] - Expired (Auto) [Batch: ${batch.batch_number}]`;

        await supabase.from("expenses").insert([
          {
            category_id: categoryId,
            description: descText,
            amount: financialLoss,
            recorded_by: userId,
            expense_date: today,
          },
        ]);
      }

      cleanedCount++;
    }

    // e. Automatically recalculate FIFO cost cache for affected items
    const affectedItemIds = [
      ...new Set(expiredBatches.map((b) => b.inventory_item_id)),
    ];
    for (const itemId of affectedItemIds) {
      await updateItemFifoCost(itemId);
    }

    return cleanedCount;
  } catch (error) {
    console.error("Cleanup Expired Batches Error:", error);
    return 0;
  }
};
