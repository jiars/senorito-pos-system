// Edit the tooltip copy here without changing the step field components.
export const addInventoryItemTooltips = {
  baseUnit:
    "The absolute smallest unit used to track this item in your stockroom (e.g., grams, ml, pieces). All purchases and recipes will convert down to this unit.",
  purchaseUnit:
    "The unit your supplier sells this item in. Example: Box, Sack, Bottle, or kg. The system converts this into the base unit when recording your stock.",
  minimumLevel:
    "The lowest stock amount you want to keep on hand. When the quantity falls below this level, the item is flagged as low stock so you know it is time to reorder.",
  recipeConversion:
    "Other units used when preparing menu recipes, such as shot, tbsp, or scoop. Enter how much of the base unit each one equals so recipes can deduct the correct amount from inventory.",
};
