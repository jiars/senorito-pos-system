import {
  getPOSSelectedAddons,
  isPOSAddonSelectable,
} from "@/utils/pos/posSelectionUtils";
import {
  productSelectionValidationMessages,
  validateProductSelection,
} from "./productSelectionValidation";

export const customizeOrderValidationMessages = {
  variantUnavailable: productSelectionValidationMessages.variantUnavailable,
  quantityInvalid: productSelectionValidationMessages.quantityInvalid,
  addonUnavailable: "Remove unavailable add-ons to continue.",
  addonQuantityInvalid: "Add-on quantity must be a whole number of at least 1.",
  addonStockInsufficient: "Not enough stock. Reduce quantity or remove an add-on.",
  stockLimitReached: productSelectionValidationMessages.stockLimitReached,
};

export const validateCustomizeOrder = ({
  product,
  selectedVariant,
  quantity,
  addonOptions,
  selection,
  cartItems = [],
  isIncreasingQuantity = false,
}) => {
  const errors = {};
  const errorCodes = {};
  const messages = customizeOrderValidationMessages;
  const selectedAddons = getPOSSelectedAddons(addonOptions);
  const productValidation = validateProductSelection({
    product,
    selectedVariant,
    quantity,
    addons: selectedAddons,
    cartItems,
    isIncreasingQuantity,
  });

  if (productValidation.errors.variant) {
    errors.variant = messages.variantUnavailable;
    errorCodes.variant = "VARIANT_UNAVAILABLE";
  }

  // Keep missing/archived/category-removed selections invalid until removed.
  const hasUnavailableAddons = addonOptions.some((addon) => {
    return addon.selected && !isPOSAddonSelectable(addon);
  }) || selection.some((addon) => {
    return !addonOptions.some((option) => option.id === addon.id);
  });
  const hasInvalidAddonQuantity = selectedAddons.some((addon) => {
    return !Number.isInteger(addon.qty) || addon.qty < 1;
  });

  if (hasUnavailableAddons) {
    errors.addons = messages.addonUnavailable;
    errorCodes.addons = "ADDON_UNAVAILABLE";
  } else if (hasInvalidAddonQuantity) {
    errors.addons = messages.addonQuantityInvalid;
    errorCodes.addons = "ADDON_QUANTITY_INVALID";
  }

  if (productValidation.errorCodes.quantity === "QUANTITY_INVALID") {
    errors.quantity = messages.quantityInvalid;
    errorCodes.quantity = "QUANTITY_INVALID";
  } else if (productValidation.errors.quantity) {
    errors.stock = messages.addonStockInsufficient;
    errorCodes.stock = "ADDON_STOCK_INSUFFICIENT";
    if (isIncreasingQuantity) {
      errors.stock = messages.stockLimitReached;
      errorCodes.stock = "STOCK_LIMIT_REACHED";
    }
  }

  return { errors, errorCodes, isFormValid: Object.keys(errors).length === 0 };
};
