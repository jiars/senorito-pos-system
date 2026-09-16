const getBaseQuantity = (recipe) => {
  const inventoryItem = recipe.inventory_items;
  let equivalent = 1;

  if (recipe.unit && inventoryItem && recipe.unit !== inventoryItem.base_unit) {
    const conversion = inventoryItem.inventory_conversion_units?.find(
      (unit) => unit.converted_unit === recipe.unit,
    );

    if (conversion) equivalent = Number(conversion.equivalent_base_amount);
  }

  return (Number(recipe.quantity) || 0) * equivalent;
};

// Combine all ingredient usage into one deduction per Inventory Item.
export const calculateInventoryDeductions = (cartItems) => {
  const deductions = new Map();

  const addDeduction = (recipe, multiplier) => {
    const inventoryItemId = recipe.inventory_item_id;
    const quantity = getBaseQuantity(recipe) * multiplier;

    deductions.set(
      inventoryItemId,
      (deductions.get(inventoryItemId) || 0) + quantity,
    );
  };

  cartItems.forEach((item) => {
    item.recipeIngredients?.forEach((recipe) => {
      addDeduction(recipe, item.qty);
    });

    item.addOns?.forEach((addon) => {
      addon.recipes?.forEach((recipe) => {
        addDeduction(recipe, item.qty * addon.qty);
      });
    });
  });

  return Array.from(deductions, ([inventoryItemId, quantity]) => ({
    inventory_item_id: inventoryItemId,
    quantity,
  }));
};

const getInventoryDetails = (cartItems) => {
  const detailsByItem = new Map();

  const saveInventoryDetails = (recipe) => {
    const inventoryItem = recipe.inventory_items;
    if (!inventoryItem) return;

    detailsByItem.set(recipe.inventory_item_id, {
      name: inventoryItem.item_name || "Unknown ingredient",
      currentStock: Number(inventoryItem.current_stock) || 0,
    });
  };

  cartItems.forEach((item) => {
    item.recipeIngredients?.forEach(saveInventoryDetails);

    item.addOns?.forEach((addon) => {
      addon.recipes?.forEach(saveInventoryDetails);
    });
  });

  return detailsByItem;
};

// Return the stock result and the ingredients blocking the order.
export const getInventoryStockStatus = (cartItems) => {
  const deductions = calculateInventoryDeductions(cartItems);
  const detailsByItem = getInventoryDetails(cartItems);

  const insufficientIngredients = deductions
    .filter((deduction) => {
      const details = detailsByItem.get(deduction.inventory_item_id);
      return deduction.quantity > (details?.currentStock || 0);
    })
    .map((deduction) => {
      const details = detailsByItem.get(deduction.inventory_item_id);
      return details?.name || "Unknown ingredient";
    });

  return {
    hasEnoughStock: insufficientIngredients.length === 0,
    insufficientIngredients: [...new Set(insufficientIngredients)],
  };
};

export const hasEnoughInventoryStock = (cartItems) => {
  return getInventoryStockStatus(cartItems).hasEnoughStock;
};
