import { calculateEstCost } from "./pricingCalculations";

// Menu items and add-ons use the same inventory recipe contract.
export const buildRecipePayload = (ingredients, inventoryItems) => {
  return ingredients
    .filter((ingredient) => ingredient.ingredientId && ingredient.qty)
    .map((ingredient) => {
      const inventoryItem = inventoryItems.find(
        (item) => item.id === ingredient.ingredientId,
      );

      return {
        inventory_item_id: ingredient.ingredientId,
        quantity: parseFloat(ingredient.qty),
        unit: ingredient.unit || inventoryItem?.base_unit,
        estimated_cost: calculateEstCost([ingredient], inventoryItems),
      };
    });
};
