import { getSellingPriceError, sellingPriceValidationMessages } from "./sellingPriceValidation";
import { isWholeQuantityValid } from "@/utils/inventory/quantityRules";

export const editAddonValidationMessages = {
  ...sellingPriceValidationMessages,
  nameRequired: "Add-on name is required.",
  nameDuplicate: "An add-on with this name already exists.",
  categoriesRequired: "Select at least one category.",
  categoryUnavailable: "Select available categories.",
  ingredientRequired: "Select an ingredient.",
  ingredientUnavailable: "Select an available ingredient.",
  ingredientDuplicate: "This ingredient is already selected.",
  quantityInvalid: "Quantity must be greater than 0.",
  quantityWholeRequired: "Quantity must be a whole number for this unit.",
  unitRequired: "Unit is required.",
};
export const validateEditAddon = (addonName, recipe, selectedCategories, categories, inventoryItems, existingAddons = [], addonId) => {
  const errors = {};
  const messages = editAddonValidationMessages;
  const name = addonName.trim().toLowerCase();
  const duplicateName = existingAddons.some((addon) => {
    return addon.id !== addonId && addon.addon_name.trim().toLowerCase() === name;
  });
  if (!name) {
    errors.addonName = messages.nameRequired;
  } else if (duplicateName) {
    errors.addonName = messages.nameDuplicate;
  }
  if (!selectedCategories.length) {
    errors.categories = messages.categoriesRequired;
  } else if (selectedCategories.some((id) => !categories.some((category) => category.id === id))) {
    errors.categories = messages.categoryUnavailable;
  }
  const priceError = getSellingPriceError(recipe.sellingPrice);
  if (priceError) errors.sellingPrice = priceError;
  const selectedIds = recipe.ingredients.map((ingredient) => ingredient.ingredientId);
  for (const ingredient of recipe.ingredients) {
    const key = `ing_${ingredient.id}`;
    // Saved recipes can still reference archived inventory items.
    if (!ingredient.ingredientId) {
      errors[`${key}_id`] = messages.ingredientRequired;
    } else if (!inventoryItems.some((item) => item.id === ingredient.ingredientId)) {
      errors[`${key}_id`] = messages.ingredientUnavailable;
    } else if (selectedIds.filter((id) => id === ingredient.ingredientId).length > 1) {
      errors[`${key}_id`] = messages.ingredientDuplicate;
    }
    const quantity = Number(ingredient.qty);
    if (ingredient.qty === "" || !Number.isFinite(quantity) || quantity <= 0) {
      errors[`${key}_qty`] = messages.quantityInvalid;
    } else if (!isWholeQuantityValid(ingredient.qty, ingredient.unit)) {
      errors[`${key}_qty`] = messages.quantityWholeRequired;
    }
    if (!ingredient.unit) errors[`${key}_unit`] = messages.unitRequired;
  }
  return { errors, isFormValid: Object.keys(errors).length === 0 };
};
export const getEditAddonServerFieldErrors = (backendErrors, ingredients) => {
  const errors = {};
  const baseFields = { "base_info.addon_name": "addonName", "base_info.selling_price": "sellingPrice", categories: "categories" };
  for (const [field, messages] of Object.entries(backendErrors)) {
    if (!Array.isArray(messages) || !messages.length) continue;
    let key = baseFields[field];
    if (/^categories\.\d+$/.test(field)) key = "categories";
    const match = field.match(/^recipes\.(\d+)\.(inventory_item_id|quantity|unit)$/);
    if (match) {
      const ingredient = ingredients[Number(match[1])];
      const fields = { inventory_item_id: "id", quantity: "qty", unit: "unit" };
      if (ingredient) key = `ing_${ingredient.id}_${fields[match[2]]}`;
    }
    if (key) errors[key] = messages[0];
  }
  return errors;
};
