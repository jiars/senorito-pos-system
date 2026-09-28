/**
 * Common Validation Helpers
 * These can be used across any form in the application (future-proof).
 */
export const isRequired = (value) => {
  if (typeof value === "string") return value.trim().length > 0;
  if (Array.isArray(value)) return value.length > 0;
  return value !== null && value !== undefined && value !== "";
};

export const isPositiveNumber = (value) => {
  const num = Number(value);
  return !isNaN(num) && num > 0;
};

/**
 * Validates an array of ingredients.
 * @param {Array} ingredients - The array of ingredient objects.
 * @param {String} errorPrefix - The prefix for the error keys (e.g., 'ing_').
 * @returns {Object} - An object containing any validation errors.
 */
export const validateIngredients = (ingredients, errorPrefix = "ing_") => {
  const errors = {};
  const ingredientCounts = {};

  // Count how many times each ingredient was selected.
  ingredients.forEach((ingredient) => {
    const ingredientId = ingredient.ingredientId;

    if (isRequired(ingredientId)) {
      ingredientCounts[ingredientId] =
        (ingredientCounts[ingredientId] || 0) + 1;
    }
  });

  ingredients.forEach((ingredient) => {
    const errorKey = `${errorPrefix}${ingredient.id}`;

    if (!isRequired(ingredient.ingredientId)) {
      errors[`${errorKey}_id`] = "Required.";
    } else if (ingredientCounts[ingredient.ingredientId] > 1) {
      errors[`${errorKey}_id`] = "This ingredient is already selected.";
    }

    if (!isRequired(ingredient.qty) || !isPositiveNumber(ingredient.qty)) {
      errors[`${errorKey}_qty`] = "Must be greater than 0.";
    }

    if (!isRequired(ingredient.unit)) {
      errors[`${errorKey}_unit`] = "Required.";
    }
  });

  return errors;
};

/**
 * Validates the Add-on Form (used by Add and Edit Add-on Modals).
 */
export const validateAddonForm = (
  addonName,
  sellingPrice,
  selectedCategories,
  ingredients,
) => {
  let errors = {};

  if (!isRequired(addonName)) errors.addonName = "Add-on name is required.";

  if (!isRequired(sellingPrice)) {
    errors.sellingPrice = "Price required.";
  } else if (!isPositiveNumber(sellingPrice)) {
    errors.sellingPrice = "Must be > 0.";
  }

  if (!isRequired(selectedCategories))
    errors.categories = "Select at least one category.";

  const ingredientErrors = validateIngredients(ingredients, "ing_");
  errors = { ...errors, ...ingredientErrors };

  return errors;
};

/**
 * Validates the Menu Item Form (used by Add and Edit Menu Item Modals).
 */
export const validateMenuItemForm = (
  baseInfo,
  pricingMode,
  singleRecipe,
  variants,
) => {
  let errors = {};

  if (!isRequired(baseInfo.name)) errors.name = "Item name is required.";
  if (!isRequired(baseInfo.category)) errors.category = "Category is required.";

  if (pricingMode === "single") {
    if (!isRequired(singleRecipe.sellingPrice)) {
      errors.sellingPrice = "Selling price is required.";
    } else if (!isPositiveNumber(singleRecipe.sellingPrice)) {
      errors.sellingPrice = "Price must be > 0.";
    }

    const ingErrors = validateIngredients(
      singleRecipe.ingredients,
      "single_ing_",
    );
    errors = { ...errors, ...ingErrors };
  } else {
    variants.forEach((v) => {
      if (!isRequired(v.name))
        errors[`variant_${v.id}_name`] = "Variant name required.";

      if (!isRequired(v.sellingPrice)) {
        errors[`variant_${v.id}_price`] = "Price required.";
      } else if (!isPositiveNumber(v.sellingPrice)) {
        errors[`variant_${v.id}_price`] = "Must be > 0.";
      }

      const ingErrors = validateIngredients(v.ingredients, `var_${v.id}_ing_`);
      errors = { ...errors, ...ingErrors };
    });
  }

  return errors;
};
