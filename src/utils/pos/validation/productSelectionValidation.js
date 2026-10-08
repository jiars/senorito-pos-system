import { getPOSSelectionStockStatus } from "@/utils/pos/posSelectionUtils";

export const productSelectionValidationMessages = {
  sizeRequired: "Select a size first.",
  variantUnavailable: "Select an available size.",
  quantityInvalid: "Quantity must be a whole number of at least 1.",
  quantityStockInsufficient: "Not enough stock. Reduce quantity.",
  stockLimitReached: "Stock limit reached.",
};

export const validateProductSelection = ({
  product,
  selectedVariant,
  quantity,
  addons = [],
  cartItems = [],
  isIncreasingQuantity = false,
}) => {
  const errors = {};
  const errorCodes = {};
  const messages = productSelectionValidationMessages;

  if (!selectedVariant) {
    errors.variant = messages.sizeRequired;
    errorCodes.variant = "SIZE_REQUIRED";
  } else if (!product.isAvailable || !selectedVariant.isAvailable) {
    errors.variant = messages.variantUnavailable;
    errorCodes.variant = "VARIANT_UNAVAILABLE";
  }

  if (!Number.isInteger(quantity) || quantity < 1) {
    errors.quantity = messages.quantityInvalid;
    errorCodes.quantity = "QUANTITY_INVALID";
  } else if (!errors.variant) {
    // Reuse checkout's ingredient calculation, including the current cart.
    const stockStatus = getPOSSelectionStockStatus(
      product, selectedVariant.id, quantity, addons, cartItems,
    );
    if (!stockStatus.hasEnoughStock) {
      errors.quantity = messages.quantityStockInsufficient;
      errorCodes.quantity = "QUANTITY_STOCK_INSUFFICIENT";
      if (isIncreasingQuantity) {
        errors.quantity = messages.stockLimitReached;
        errorCodes.quantity = "STOCK_LIMIT_REACHED";
      }
    }
  }

  return { errors, errorCodes, isFormValid: Object.keys(errors).length === 0 };
};
