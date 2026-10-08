import {
  getMinimumLevelRules,
  isValidMinimumLevel,
} from "@/utils/inventory/minimumLevel";

export const editInventoryValidationMessages = {
  nameRequired: "Item name is required.",
  nameDuplicate: "An item with this name already exists.",
  unitRequired: "Unit is required.",
  categoryRequired: "Category is required.",
  costInvalid: "Cost must be greater than 0.",
  minimumLevelInvalid: "Minimum level must be at least 1.",
  minimumWholeLevelInvalid: "Minimum level must be a whole number of at least 1.",
  conversionUnitRequired: "Converted unit is required.",
  conversionEquivalentInvalid: "Equivalent amount must be greater than 0.",
};

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
  const messages = editInventoryValidationMessages;
  const normalizedName = name.trim().toLowerCase();

  if (!name.trim()) {
    errors.name = messages.nameRequired;
  } else if (
    existingItems.some((existingName) => (
      existingName.toLowerCase() === normalizedName &&
      existingName.toLowerCase() !== originalName.toLowerCase()
    ))
  ) {
    errors.name = messages.nameDuplicate;
  }

  if (!unit) errors.unit = messages.unitRequired;
  if (!category) errors.category = messages.categoryRequired;

  if (cost === '' || !Number.isFinite(Number(cost)) || Number(cost) <= 0) {
    errors.cost = messages.costInvalid;
  }

  if (!isValidMinimumLevel(reorderLevel, unit)) {
    if (getMinimumLevelRules(unit).wholeNumbersOnly) {
      errors.reorderLevel = messages.minimumWholeLevelInvalid;
    } else {
      errors.reorderLevel = messages.minimumLevelInvalid;
    }
  }

  const conversionErrors = {};
  conversions.forEach((conversion, index) => {
    const equivalent = Number(conversion.equivalent);
    const hasUnit = conversion.unit.trim() !== '';
    const hasEquivalent = conversion.equivalent !== '';

    // Keep one optional placeholder row, matching Add Inventory. Any row the
    // user explicitly adds after it must be completed or removed.
    const isBlankAddedRow = index > 0 && !hasUnit && !hasEquivalent;
    const rowErrors = {};
    if (isBlankAddedRow || (hasEquivalent && !hasUnit)) {
      rowErrors.unit = messages.conversionUnitRequired;
    }
    if (
      isBlankAddedRow ||
      (hasUnit &&
        (!hasEquivalent || !Number.isFinite(equivalent) || equivalent <= 0))
    ) {
      rowErrors.equivalent = messages.conversionEquivalentInvalid;
    }
    if (Object.keys(rowErrors).length > 0) {
      conversionErrors[conversion.clientId] = rowErrors;
    }
  });
  const conversionsValid = Object.keys(conversionErrors).length === 0;
  if (!conversionsValid) errors.conversions = conversionErrors;

  return {
    errors,
    conversionsValid,
    isFormValid: Object.keys(errors).length === 0
  };
};
