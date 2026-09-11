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
  const parsedQty = parseFloat(qtyPurchased);
  const isQtyValid = qtyPurchased !== '' && !isNaN(parsedQty) && parsedQty > 0;

  const parsedCost = parseFloat(totalCost);
  const isCostValid = totalCost !== '' && !isNaN(parsedCost) && parsedCost > 0;

  const parsedMin = parseFloat(minLevel);
  const isMinValid = minLevel !== '' && !isNaN(parsedMin) && parsedMin >= 1;

  const parsedMultiplier = parseFloat(purchaseMultiplier);
  const isMultiplierValid =
    purchaseMultiplier !== '' &&
    !isNaN(parsedMultiplier) &&
    parsedMultiplier > 0;

  // Every visible conversion row must be complete and positive.
  let conversionsValid = true;

  conversions.forEach((conversion) => {
    const parsedEquivalent = parseFloat(conversion.equivalent);

    if (
      conversion.unit === '' ||
      isNaN(parsedEquivalent) ||
      parsedEquivalent <= 0
    ) {
      conversionsValid = false;
    }
  });

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

  const isFormValid =
    !isNameEmpty &&
    !isDuplicateName &&
    unit !== '' &&
    category !== '' &&
    isQtyValid &&
    purchaseUnit.trim() !== '' &&
    isMultiplierValid &&
    isCostValid &&
    isMinValid &&
    conversionsValid &&
    isExpiryValid;

  return {
    isNameEmpty,
    isDuplicateName,
    parsedQty,
    isQtyValid,
    parsedCost,
    isCostValid,
    isMinValid,
    parsedMultiplier,
    isMultiplierValid,
    isExpiryEmpty,
    hasValidFutureDate,
    isExpiryValid,
    isFormValid
  };
};
