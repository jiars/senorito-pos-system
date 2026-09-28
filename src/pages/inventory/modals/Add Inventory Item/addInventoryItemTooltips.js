// Edit the tooltip copy here without changing the step field components.
export const addInventoryItemTooltips = {
  baseUnit:
    "The absolute smallest unit used to track this item in your stockroom (e.g., grams, ml, pieces). All purchases and recipes will convert down to this unit.",
  purchaseUnit:
    "How this item is packaged when you buy it from the supplier (e.g., Box of 50, 5kg Sack, 1L Bottle).",
  minimumLevel:
    "Your low-stock threshold. The system will alert you to restock when your inventory drops below this number.",
  recipeConversion:
    "Map a custom serving size to your Base Unit so the system deducts stock correctly. For example, if your Base Unit is 'ml', you can set 1 'Pump' to equal '15 ml'.",
};
