import { getMinimumLevelRules, isValidMinimumLevel } from "@/utils/inventory/minimumLevel";

export const validateEditInventoryItem = ({
  name,
  originalName,
  existingItems,
  unit,
  category,
  cost,
  reorderLevel,
  conversions
}) => {
  const errors = {};
  const normalizedName = name.trim().toLowerCase();

  if (!name.trim()) {
    errors.name = 'Item name is required.';
  } else if (
    existingItems.some((existingName) => (
      existingName.toLowerCase() === normalizedName &&
      existingName.toLowerCase() !== originalName.toLowerCase()
    ))
  ) {
    errors.name = 'An item with this name already exists.';
  }

  if (!unit) errors.unit = 'Unit is required.';
  if (!category) errors.category = 'Category is required.';

  if (cost === '' || !Number.isFinite(Number(cost)) || Number(cost) <= 0) {
    errors.cost = 'Cost must be greater than 0.';
  }

  if (!isValidMinimumLevel(reorderLevel, unit)) {
    errors.reorderLevel = getMinimumLevelRules(unit).errorMessage;
  }

  const conversionsValid = conversions.every((conversion, index) => {
    const equivalent = Number(conversion.equivalent);
    const hasUnit = conversion.unit.trim() !== '';
    const hasEquivalent = conversion.equivalent !== '';

    // Keep one optional placeholder row, matching Add Inventory. Any row the
    // user explicitly adds after it must be completed or removed.
    if (!hasUnit && !hasEquivalent) return index === 0;

    return hasUnit && Number.isFinite(equivalent) && equivalent > 0;
  });

  return {
    errors,
    conversionsValid,
    isFormValid: Object.keys(errors).length === 0 && conversionsValid
  };
};
