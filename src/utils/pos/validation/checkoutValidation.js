import { getInventoryStockStatus } from "@/utils/pos/checkoutCalculations";
import { validateCashPayment, cashPaymentValidationMessages } from "./cashPaymentValidation";

export const checkoutValidationMessages = {
  cartRequired: "Add an item before processing the order.",
  quantityInvalid: "Item and add-on quantities must be whole numbers of at least 1.",
  totalInvalid: cashPaymentValidationMessages.totalInvalid,
  stockInsufficient: "Not enough stock. Reduce quantity or check ingredient stock.",
};

export const validateCheckout = ({ cartItems, paymentMethod, amountPaid, total }) => {
  const errors = {};
  const errorCodes = {};
  const messages = checkoutValidationMessages;

  if (cartItems.length === 0) {
    errors.cart = messages.cartRequired;
    errorCodes.cart = "CART_REQUIRED";
  }

  const hasInvalidQuantity = cartItems.some((item) => {
    if (!Number.isInteger(item.qty) || item.qty < 1) return true;
    return item.addOns.some((addon) => {
      return !Number.isInteger(addon.qty) || addon.qty < 1;
    });
  });
  if (hasInvalidQuantity) {
    errors.quantity = messages.quantityInvalid;
    errorCodes.quantity = "CART_QUANTITY_INVALID";
  }

  if (!Number.isFinite(total) || total <= 0) {
    errors.total = messages.totalInvalid;
    errorCodes.total = "ORDER_TOTAL_INVALID";
  }
  if (paymentMethod === "Cash") {
    const cashValidation = validateCashPayment({ amountPaid, total });
    if (cashValidation.errors.amountPaid) {
      errors.amountPaid = cashValidation.errors.amountPaid;
      errorCodes.amountPaid = cashValidation.errorCodes.amountPaid;
    }
  }

  if (!errors.cart && !errors.quantity && !getInventoryStockStatus(cartItems).hasEnoughStock) {
    errors.stock = messages.stockInsufficient;
    errorCodes.stock = "CART_STOCK_INSUFFICIENT";
  }

  return { errors, errorCodes, isFormValid: Object.keys(errors).length === 0 };
};
