import { getSellingPriceError, sellingPriceValidationMessages } from "./sellingPriceValidation";
import { isWholeQuantityValid } from "@/utils/inventory/quantityRules";

export const addMenuItemValidationMessages = {
  ...sellingPriceValidationMessages,
  nameRequired: "Item name is required.",
  nameDuplicate: "An item with this name already exists.",
  categoryRequired: "Category is required.",
  categoryUnavailable: "Select an available category.",
  imageRequired: "Menu image is required.",
  variantsRequired: "Keep at least one non-archived size.",
  variantNameRequired: "Enter a name for every size when there are multiple variants.",
  ingredientRequired: "Select an ingredient.",
  ingredientUnavailable: "Select an available ingredient.",
  ingredientDuplicate: "This ingredient is already selected.",
  quantityInvalid: "Quantity must be greater than 0.",
  quantityWholeRequired: "Quantity must be a whole number for this unit.",
  unitRequired: "Unit is required.",
};

export const validateAddMenuItem = (baseInfo, variants, categories, inventoryItems, existingItems = []) => {
  const errors = {};
  const messages = addMenuItemValidationMessages;
  if (!baseInfo.name.trim()) errors.name = messages.nameRequired;
  else if (existingItems.some((item) => item.item_name.trim().toLowerCase() === baseInfo.name.trim().toLowerCase())) errors.name = messages.nameDuplicate;
  if (!baseInfo.category) errors.category = messages.categoryRequired;
  else if (!categories.some((category) => category.id === baseInfo.category)) errors.category = messages.categoryUnavailable;
  if (!baseInfo.image) errors.image = messages.imageRequired;
  const generalValid = !errors.name && !errors.category && !errors.image;
  const activeVariants = variants.filter((variant) => !variant.archived);
  if (!activeVariants.length) errors.variants = messages.variantsRequired;
  for (const variant of activeVariants) {
    const prefix = `variant_${variant.id}`;
    if (activeVariants.length > 1 && !variant.name.trim()) errors[`${prefix}_name`] = messages.variantNameRequired;
    const priceError = getSellingPriceError(variant.sellingPrice);
    if (priceError) errors[`${prefix}_price`] = priceError;
    const selectedIds = variant.ingredients.map((ingredient) => ingredient.ingredientId);
    for (const ingredient of variant.ingredients) {
      const key = `var_${variant.id}_ing_${ingredient.id}`;
      if (!ingredient.ingredientId) errors[`${key}_id`] = messages.ingredientRequired;
      else if (!inventoryItems.some((item) => item.id === ingredient.ingredientId && !item.archived)) errors[`${key}_id`] = messages.ingredientUnavailable;
      else if (selectedIds.filter((id) => id === ingredient.ingredientId).length > 1) errors[`${key}_id`] = messages.ingredientDuplicate;
      if (ingredient.qty === "" || !Number.isFinite(Number(ingredient.qty)) || Number(ingredient.qty) <= 0) errors[`${key}_qty`] = messages.quantityInvalid;
      else if (!isWholeQuantityValid(ingredient.qty, ingredient.unit)) errors[`${key}_qty`] = messages.quantityWholeRequired;
      if (!ingredient.unit) errors[`${key}_unit`] = messages.unitRequired;
    }
  }
  const recipeValid = !Object.keys(errors).some((key) => key !== "name" && key !== "category" && key !== "image");
  return { errors, stepValidity: [generalValid, recipeValid], isFormValid: generalValid && recipeValid };
};

// Translate API array indexes to the stable IDs used by the form controls.
export const getAddMenuItemServerFieldErrors = (backendErrors, variants) => {
  const errors = {};
  const baseFields = { "base_info.item_name": "name", "base_info.category_id": "category", "base_info.image_url": "image" };
  for (const [field, messages] of Object.entries(backendErrors)) {
    if (!Array.isArray(messages) || !messages.length) continue;
    let key = baseFields[field];
    const match = field.match(/^prices\.(\d+)\.(variant_name|selling_price|recipes\.(\d+)\.(inventory_item_id|quantity|unit))$/);
    if (match) {
      const variant = variants[Number(match[1])];
      if (!variant) continue;
      if (match[2] === "variant_name") key = `variant_${variant.id}_name`;
      else if (match[2] === "selling_price") key = `variant_${variant.id}_price`;
      else {
        const ingredient = variant.ingredients[Number(match[3])];
        const fields = { inventory_item_id: "id", quantity: "qty", unit: "unit" };
        if (ingredient) key = `var_${variant.id}_ing_${ingredient.id}_${fields[match[4]]}`;
      }
    }
    if (key) errors[key] = messages[0];
  }
  return errors;
};
