import { prepareMenuAvailability } from "./menuAvailability";

// Preview unsaved edits using the same calculator and existing field validation.
export const getMenuDraftAvailability = (baseInfo, variants, inventoryItems, fieldErrors) => {
  const prices = variants.map((variant) => {
    let recipeStatus = "Complete";
    if (fieldErrors[`variant_${variant.id}_ingredients`]) recipeStatus = "Incomplete";

    variant.ingredients.forEach((ingredient) => {
      const key = `var_${variant.id}_ing_${ingredient.id}`;
      if (fieldErrors[`${key}_id`] || fieldErrors[`${key}_qty`] || fieldErrors[`${key}_unit`]) {
        recipeStatus = "Incomplete";
      }
    });

    let posStatus = "Unavailable";
    if (variant.isAvailable) posStatus = "Available";

    return {
      id: variant.id,
      selling_price: variant.sellingPrice,
      pos_status: posStatus,
      recipe_status: recipeStatus,
      archived: variant.archived,
    };
  });

  const recipes = variants.flatMap((variant) => {
    return variant.ingredients.map((ingredient) => {
      return {
        menu_item_price_id: variant.id,
        inventory_item_id: ingredient.ingredientId,
        quantity: Number(ingredient.qty),
        unit: ingredient.unit,
      };
    });
  });

  let posStatus = "Unavailable";
  if (baseInfo.isAvailable) posStatus = "Available";

  const catalog = prepareMenuAvailability([
    { pos_status: posStatus, menu_prices: prices, menu_recipes: recipes },
  ], [], inventoryItems);

  return catalog.menuItems[0].availability;
};
