
import { supabase } from '../supabaseClient';
import { formatDecimal } from '../../utils/numberFormatters';
import { logStockAdjustment } from '../inventory/inventoryStockService';

// ---------------------------------------------------------
// 1. Fetch Live Menu for POS
// ---------------------------------------------------------
export const fetchAvailableMenuForPOS = async () => {
  // We need to fetch:
  // 1. Menu Items where pos_status = 'Available'
  // 2. Their linked categories
  // 3. Their variants/prices
  // 4. Their recipes (so we know what ingredients to deduct)

  const { data, error } = await supabase
    .from('menu_items')
    .select(`
      id,
      item_name,
      pos_status,
      category_id,
      pricing_type,
      image_url,
      category:menu_categories(category_name),
      prices:menu_item_prices(id, variant_name, selling_price, pos_status),
      recipes:menu_recipes(id, inventory_item_id, menu_item_price_id, quantity, unit, inventory_items(current_stock, base_unit, inventory_conversion_units(converted_unit, equivalent_base_amount)))
    `);

  if (error) throw new Error(error.message);
  return data;
};

// ---------------------------------------------------------
// 2. Process Checkout (The big transaction)
// ---------------------------------------------------------
export const processCheckout = async (orderDetails) => {
  let newOrderId = null;
  try {
    // 1. Insert into orders table
    const { data: orderData, error: orderError } = await supabase
        .from('orders')
        .insert([{
          order_number: orderDetails.transactionId,
          cashier_id: orderDetails.cashier_id,
          order_source: orderDetails.orderSource,
          payment_method: orderDetails.paymentMethod,
          discount_type: orderDetails.discountType,
          subtotal: formatDecimal(orderDetails.subtotal),
          discount_amount: formatDecimal(orderDetails.discountAmount),
          total: formatDecimal(orderDetails.total),
          amount_paid: formatDecimal(orderDetails.amountPaid),
          change_amount: formatDecimal(orderDetails.change)
        }])
        .select()
        .single();

    if (orderError) throw new Error(`Failed to create order: ${orderError.message}`);
    newOrderId = orderData.id;

    const inventoryDeductions = new Map(); // Store item_id -> total deduction amount

    // 2. Process Order Items
    for (const item of orderDetails.cartItems) {
      const { data: orderItemData, error: itemError } = await supabase
        .from('order_items')
        .insert([{
          order_id: newOrderId,
          menu_item_id: item.productId.replace('p-', ''), // Remove 'p-' prefix if any
          price_id: item.priceId || null,
          quantity: formatDecimal(item.qty),
          unit_price: formatDecimal(item.price),
          subtotal: formatDecimal(item.price * item.qty)
        }])
        .select()
        .single();

      if (itemError) throw new Error(`Failed to insert order item: ${itemError.message}`);

      // 3. Insert Add-ons
      if (item.addOns && item.addOns.length > 0) {
        const addonsToInsert = item.addOns.map(addon => ({
          order_item_id: orderItemData.id,
          addon_id: addon.id,
          quantity: formatDecimal(addon.qty),
          price: formatDecimal(addon.price)
        }));

        const { error: addonError } = await supabase
          .from('order_item_addons')
          .insert(addonsToInsert)
          .select();

        if (addonError) throw new Error(`Failed to insert add-ons: ${addonError.message}`);
      }

      // 4. Aggregate Inventory Deductions (Main Drink)
      if (item.recipeIngredients && item.recipeIngredients.length > 0) {
        for (const recipeIngredient of item.recipeIngredients) {
          let equivalent = 1;
          const invItem = recipeIngredient.inventory_items;
          if (recipeIngredient.unit && invItem && recipeIngredient.unit !== invItem.base_unit) {
            const conv = invItem.inventory_conversion_units?.find(cu => cu.converted_unit === recipeIngredient.unit);
            if (conv) equivalent = Number(conv.equivalent_base_amount);
          }

          const totalDeduction = recipeIngredient.quantity * equivalent * item.qty;
          const currentDed = inventoryDeductions.get(recipeIngredient.inventory_item_id) || 0;
          inventoryDeductions.set(recipeIngredient.inventory_item_id, currentDed + totalDeduction);
        }
      }

      // 5. Aggregate Inventory Deductions (Add-ons)
      if (item.addOns && item.addOns.length > 0) {
        for (const addon of item.addOns) {
          if (addon.recipes && addon.recipes.length > 0) {
            for (const addonRecipe of addon.recipes) {
              let equivalent = 1;
              const invItem = addonRecipe.inventory_items;
              if (addonRecipe.unit && invItem && addonRecipe.unit !== invItem.base_unit) {
                const conv = invItem.inventory_conversion_units?.find(cu => cu.converted_unit === addonRecipe.unit);
                if (conv) equivalent = Number(conv.equivalent_base_amount);
              }

              const totalAddonUnits = item.qty * addon.qty;
              const totalDeduction = addonRecipe.quantity * equivalent * totalAddonUnits;
              const currentDed = inventoryDeductions.get(addonRecipe.inventory_item_id) || 0;
              inventoryDeductions.set(addonRecipe.inventory_item_id, currentDed + totalDeduction);
            }
          }
        }
      }
    }

    // 6. Execute all Inventory Deductions at the end
    // (Only happens if all order insertions succeeded)
    for (const [inventoryItemId, deduction] of inventoryDeductions.entries()) {
      if (deduction <= 0) continue;
      
      const { data: stockData, error: stockError } = await supabase
        .from('inventory_items')
        .select('id, current_stock')
        .eq('id', inventoryItemId)
        .single();

      if (stockData && !stockError) {
        await logStockAdjustment({
          item: stockData,
          actionType: 'pos_sale',
          quantityChange: -Math.abs(deduction),
          newTotalStock: stockData.current_stock - deduction,
          userId: orderDetails.cashier_id,
          source: 'POS Page',
          reason: `Sold in Order #${orderData.order_number}`
        });
      }
    }

    return { id: newOrderId, order_number: orderData.order_number }; // Return success
  } catch (error) {
    console.error('Checkout error:', error);
    // 7. MANUAL ROLLBACK IF FAILED (Rolls back the order and items cascade delete)
    if (newOrderId) {
      console.log(`Rolling back failed order: ${newOrderId}`);
      await supabase.from('orders').delete().eq('id', newOrderId);
    }
    throw error;
  }
};

// ---------------------------------------------------------
// 3. Fetch Order History (All Orders)
// ---------------------------------------------------------
export const fetchOrderHistory = async () => {
  const { data, error } = await supabase
    .from('orders')
    .select(`
      *,
      cashier:profiles(first_name, last_name)
    `)
    .order('order_datetime', { ascending: false });

  if (error) throw new Error(error.message);
  return data;
};

// ---------------------------------------------------------
// 4. Fetch Order Details (Specific Order)
// ---------------------------------------------------------
export const fetchOrderDetails = async (orderId) => {
  const { data, error } = await supabase
    .from('order_items')
    .select(`
      *,
      menu_item:menu_items(item_name),
      variant:menu_item_prices(variant_name),
      addons:order_item_addons(
        quantity,
        price,
        addon:addons(addon_name)
      )
    `)
    .eq('order_id', orderId);

  if (error) throw new Error(error.message);
  return data;
};
