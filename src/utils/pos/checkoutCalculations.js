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

const getInventoryNumber = (value) => Number(value) || 0;

// Combine ingredient usage into one deduction per Inventory Item.
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
      usableStock: getInventoryNumber(
        inventoryItem.usable_stock ?? inventoryItem.current_stock,
      ),
      minimumLevel: getInventoryNumber(inventoryItem.minimum_level),
      archived: Boolean(inventoryItem.archived),
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

// Return the stock result and ingredients blocking an order.
export const getInventoryStockStatus = (cartItems) => {
  const deductions = calculateInventoryDeductions(cartItems);
  const detailsByItem = getInventoryDetails(cartItems);

  const insufficientIngredients = deductions
    .filter((deduction) => {
      const details = detailsByItem.get(deduction.inventory_item_id);

      return deduction.quantity > (details?.usableStock || 0);
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

// Calculate the final POS status of one price/variant or Add-on.
export const getRecipeAvailabilityStatus = ({
  recipes = [],
  cartItems = [],
  quantity = 1,
  posStatus = "Available",
  recipeStatus = "Complete",
}) => {
  if (posStatus !== "Available") {
    return {
      status: "Unavailable",
      isAvailable: false,
      blockingIngredients: [],
      lowStockIngredients: [],
    };
  }

  const archivedIngredients = recipes
    .filter((recipe) => recipe.inventory_items?.archived)
    .map((recipe) => recipe.inventory_items?.item_name || "Unknown ingredient");

  if (recipeStatus === "On Hold" || archivedIngredients.length > 0) {
    return {
      status: "On Hold",
      isAvailable: false,
      blockingIngredients: [...new Set(archivedIngredients)],
      lowStockIngredients: [],
    };
  }

  if (recipeStatus !== "Complete" || recipes.length === 0) {
    return {
      status: "Incomplete",
      isAvailable: false,
      blockingIngredients: [],
      lowStockIngredients: [],
    };
  }

  const previewItem = {
    qty: quantity,
    recipeIngredients: recipes,
    addOns: [],
  };

  const itemsToCheck = [...cartItems, previewItem];
  const deductions = calculateInventoryDeductions(itemsToCheck);
  const inventoryDetails = getInventoryDetails(itemsToCheck);

  const outOfStockIngredients = [];
  const insufficientIngredients = [];
  const lowStockIngredients = [];

  deductions.forEach((deduction) => {
    const details = inventoryDetails.get(deduction.inventory_item_id);
    const ingredientName = details?.name || "Unknown ingredient";
    const usableStock = details?.usableStock || 0;
    const remainingStock = usableStock - deduction.quantity;

    if (deduction.quantity > usableStock) {
      if (usableStock <= 0) outOfStockIngredients.push(ingredientName);
      else insufficientIngredients.push(ingredientName);

      return;
    }

    if (remainingStock <= (details?.minimumLevel || 0))
      lowStockIngredients.push(ingredientName);
  });

  if (outOfStockIngredients.length > 0) {
    return {
      status: "Out of Stock",
      isAvailable: false,
      blockingIngredients: [...new Set(outOfStockIngredients)],
      lowStockIngredients: [],
    };
  }

  if (insufficientIngredients.length > 0) {
    return {
      status: "Insufficient Stock",
      isAvailable: false,
      blockingIngredients: [...new Set(insufficientIngredients)],
      lowStockIngredients: [],
    };
  }

  if (lowStockIngredients.length > 0) {
    return {
      status: "Low Stock",
      isAvailable: true,
      blockingIngredients: [],
      lowStockIngredients: [...new Set(lowStockIngredients)],
    };
  }

  return {
    status: "Available",
    isAvailable: true,
    blockingIngredients: [],
    lowStockIngredients: [],
  };
};
