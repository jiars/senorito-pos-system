import { getRecipeAvailabilityStatus } from "@/utils/pos/checkoutCalculations";

// Attach the same ingredient details that the POS stock calculator expects.
const attachRecipeIngredients = (recipes, ingredientsById) => {
  return recipes.map((recipe) => {
    return {
      ...recipe,
      inventory_items: ingredientsById.get(recipe.inventory_item_id),
    };
  });
};

const getMenuItemAvailability = (item, ingredientsById) => {
  const prices = (item.menu_prices || [])
    .filter((price) => !price.archived)
    .sort((first, second) => Number(first.selling_price) - Number(second.selling_price));
  const recipes = attachRecipeIngredients(item.menu_recipes || [], ingredientsById);
  let itemStatus = item.pos_status;
  if (item.archived) itemStatus = "Unavailable";

  const variantAvailability = prices.map((price) => {
    let priceStatus = price.pos_status || "Unavailable";
    if (prices.length === 1) priceStatus = price.pos_status || "Available";

    let posStatus = "Unavailable";
    if (itemStatus === "Available") posStatus = priceStatus;

    const availability = getRecipeAvailabilityStatus({
      recipes: recipes.filter((recipe) => {
        return recipe.menu_item_price_id === price.id || recipe.menu_item_price_id === null;
      }),
      posStatus,
      recipeStatus: price.recipe_status || "Incomplete",
      quantity: 1,
      cartItems: [],
    });
    return { ...availability, variantId: price.id };
  });

  // Match POS: prefer a fully available variant, then any sellable variant.
  let availability = variantAvailability.find((variant) => variant.status === "Available");
  if (!availability) availability = variantAvailability.find((variant) => variant.isAvailable);
  if (!availability) availability = variantAvailability[0];
  if (availability && !availability.isAvailable) {
    const hasMixedConditions = variantAvailability.some((variant) => {
      return variant.status !== availability.status;
    });
    if (hasMixedConditions) {
      // Do not present one size's reason as the reason for every blocked size.
      availability = getRecipeAvailabilityStatus({ posStatus: "Unavailable" });
    }
  }
  if (!availability) {
    availability = getRecipeAvailabilityStatus({
      posStatus: itemStatus,
      recipeStatus: "Incomplete",
      recipes: [],
    });
  }

  // Keep each active size's condition even when another size is sellable.
  return { ...availability, variants: variantAvailability };
};

export const prepareMenuAvailability = (menuItems = [], addons = [], ingredients = []) => {
  const ingredientsById = new Map();
  ingredients.forEach((ingredient) => {
    ingredientsById.set(ingredient.id, {
      ...ingredient,
      // Never substitute raw stock: expired batches may still be recorded there.
      usable_stock: Number(ingredient.usable_stock) || 0,
    });
  });

  return {
    menuItems: menuItems.map((item) => {
      return { ...item, availability: getMenuItemAvailability(item, ingredientsById) };
    }),
    addons: addons.map((addon) => {
      let posStatus = addon.pos_status;
      if (addon.archived) posStatus = "Unavailable";

      return {
        ...addon,
        availability: getRecipeAvailabilityStatus({
          recipes: attachRecipeIngredients(addon.addon_recipes || [], ingredientsById),
          posStatus,
          recipeStatus: addon.recipe_status || "Incomplete",
          quantity: 1,
          cartItems: [],
        }),
      };
    }),
  };
};
