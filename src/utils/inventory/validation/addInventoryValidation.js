import {
  getMinimumLevelRules,
  isValidMinimumLevel,
} from "@/utils/inventory/minimumLevel";
import { isWholeQuantityValid } from "@/utils/inventory/quantityRules";

export const addInventoryValidationMessages = {
  itemNameRequired: "Item name is required.",
  itemNameDuplicate: "This item already exists.",
  categoryRequired: "Category is required.",
  unitRequired: "Base unit is required.",
  quantityInvalid: "Quantity must be greater than 0.",
  quantityWholeRequired: "Quantity must be a whole number for this purchase unit.",
  convertedQuantityWholeRequired: "Converted stock must be a whole number for this base unit.",
  purchaseUnitRequired: "Purchase unit is required.",
  multiplierInvalid: "Enter a value greater than 0.",
  costInvalid: "Total cost must be greater than 0.",
  minimumLevelInvalid: "Minimum level must be at least 1.",
  minimumWholeLevelInvalid: "Minimum level must be a whole number of at least 1.",
  expiryRequired: "Expiration date is required.",
  expiryInvalid: "Select today or a future date.",
  conversionUnitRequired: "Converted unit is required.",
  conversionEquivalentInvalid: "Equivalent amount must be greater than 0.",
};

export const validateAddInventoryItem = ({
  itemName,
  existingItems,
  unit,
  category,
  qtyPurchased,
  purchaseUnit,
  purchaseMultiplier,
  totalCost,
  minLevel,
  conversions,
  trackExpiry,
  expiryDate
}) => {
  const trimmedName = itemName.trim();
  const isNameEmpty = trimmedName === '';

  const isDuplicateName = existingItems.some((name) => {
    return name.toLowerCase() === trimmedName.toLowerCase();
  });

  // Validate the required numeric purchase fields.
  const parsedQty = Number(qtyPurchased);
  const isQtyValid = qtyPurchased !== '' && Number.isFinite(parsedQty) && parsedQty > 0 &&
    isWholeQuantityValid(qtyPurchased, purchaseUnit || unit);

  const parsedCost = parseFloat(totalCost);
  const isCostValid = totalCost !== '' && !isNaN(parsedCost) && parsedCost > 0;

  const isMinValid = isValidMinimumLevel(minLevel, unit);

  const parsedMultiplier = Number(purchaseMultiplier);
  const isMultiplierValid =
    purchaseMultiplier !== '' &&
    Number.isFinite(parsedMultiplier) &&
    parsedMultiplier > 0;

  // Every visible conversion row must be complete and positive.
  const conversionErrors = {};

  conversions.forEach((conversion, index) => {
    const parsedEquivalent = Number(conversion.equivalent);
    const hasUnit = conversion.unit.trim() !== '';
    const hasEquivalent = conversion.equivalent !== '';

    // The first blank row is optional; explicitly added rows must be complete.
    const isBlankAddedRow = index > 0 && !hasUnit && !hasEquivalent;
    const rowErrors = {};
    if (isBlankAddedRow || (hasEquivalent && !hasUnit)) {
      rowErrors.unit = addInventoryValidationMessages.conversionUnitRequired;
    }
    if (
      isBlankAddedRow ||
      (hasUnit &&
        (!hasEquivalent || !Number.isFinite(parsedEquivalent) || parsedEquivalent <= 0))
    ) {
      rowErrors.equivalent = addInventoryValidationMessages.conversionEquivalentInvalid;
    }
    if (Object.keys(rowErrors).length > 0) {
      conversionErrors[conversion.id] = rowErrors;
    }
  });
  const conversionsValid = Object.keys(conversionErrors).length === 0;

  const isExpiryEmpty = expiryDate === '';
  let hasValidFutureDate = false;

  if (!isExpiryEmpty) {
    const dateParts = expiryDate.split('-');

    if (dateParts.length === 3) {
      const selectedDate = new Date(
        dateParts[0],
        dateParts[1] - 1,
        dateParts[2]
      );

      const today = new Date();
      today.setHours(0, 0, 0, 0);
      hasValidFutureDate = selectedDate >= today;
    }
  }

  const isExpiryValid =
    !trackExpiry || (!isExpiryEmpty && hasValidFutureDate);

  const messages = addInventoryValidationMessages;
  const errors = {};
  if (isNameEmpty) errors.itemName = messages.itemNameRequired;
  else if (isDuplicateName) errors.itemName = messages.itemNameDuplicate;
  if (!category) errors.category = messages.categoryRequired;
  if (!unit) errors.unit = messages.unitRequired;
  if (!isQtyValid) errors.qtyPurchased = messages.quantityInvalid;
  if (Number.isFinite(parsedQty) && parsedQty > 0 && !isWholeQuantityValid(qtyPurchased, purchaseUnit || unit)) {
    errors.qtyPurchased = messages.quantityWholeRequired;
  } else if (isQtyValid && isMultiplierValid && !isWholeQuantityValid(parsedQty * parsedMultiplier, unit)) {
    errors.qtyPurchased = messages.convertedQuantityWholeRequired;
  }
  if (!purchaseUnit.trim()) errors.purchaseUnit = messages.purchaseUnitRequired;
  if (!isMultiplierValid) errors.purchaseMultiplier = messages.multiplierInvalid;
  if (!isCostValid) errors.totalCost = messages.costInvalid;
  if (!isMinValid) {
    errors.minLevel = getMinimumLevelRules(unit).wholeNumbersOnly
      ? messages.minimumWholeLevelInvalid
      : messages.minimumLevelInvalid;
  }
  if (!isExpiryValid) {
    errors.expiryDate = isExpiryEmpty ? messages.expiryRequired : messages.expiryInvalid;
  }
  if (!conversionsValid) errors.conversions = conversionErrors;

  const stepValidity = [
    !errors.itemName && !errors.unit && !errors.category && !errors.expiryDate,
    !errors.qtyPurchased &&
      !errors.purchaseUnit &&
      !errors.purchaseMultiplier &&
      !errors.totalCost &&
      !errors.minLevel,
    conversionsValid,
  ];
  const isFormValid = Object.keys(errors).length === 0;

  return {
    errors,
    stepValidity,
    isNameEmpty,
    isDuplicateName,
    parsedQty,
    isQtyValid,
    parsedCost,
    isCostValid,
    isMinValid,
    parsedMultiplier,
    isMultiplierValid,
    conversionsValid,
    isExpiryEmpty,
    hasValidFutureDate,
    isExpiryValid,
    isFormValid
  };
};
