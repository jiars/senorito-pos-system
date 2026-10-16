import { formatCurrency } from "@/utils/shared/formatters/currencyFormatters";

export const MAX_CASH_PAYMENT = 99999.99;

export const cashPaymentValidationMessages = {
  totalInvalid: "Order total must be greater than 0.",
  amountRequired: "Enter the cash received.",
  amountInvalid: "Enter a valid cash amount.",
  amountTooHigh: `Amount paid cannot exceed ${formatCurrency(MAX_CASH_PAYMENT)}.`,
  amountPrecision: "Use up to 2 decimal places.",
  amountInsufficient: (total) => {
    return `Amount paid must be at least ${formatCurrency(total)}.`;
  },
};

export const validateCashPayment = ({ amountPaid, total }) => {
  const errors = {};
  const errorCodes = {};
  const messages = cashPaymentValidationMessages;
  const amountText = String(amountPaid).trim();
  const paid = Number(amountText);

  if (!Number.isFinite(total) || total <= 0) {
    errors.total = messages.totalInvalid;
    errorCodes.total = "ORDER_TOTAL_INVALID";
  }

  if (!amountText) {
    errors.amountPaid = messages.amountRequired;
    errorCodes.amountPaid = "CASH_REQUIRED";
  } else if (!/^\d*\.?\d*$/.test(amountText) || !Number.isFinite(paid)) {
    errors.amountPaid = messages.amountInvalid;
    errorCodes.amountPaid = "CASH_INVALID";
  } else if (paid > MAX_CASH_PAYMENT) {
    errors.amountPaid = messages.amountTooHigh;
    errorCodes.amountPaid = "CASH_TOO_HIGH";
  } else if (!/^\d+(\.\d{1,2})?$/.test(String(paid))) {
    errors.amountPaid = messages.amountPrecision;
    errorCodes.amountPaid = "CASH_PRECISION";
  } else if (!errors.total && paid < total) {
    errors.amountPaid = messages.amountInsufficient(total);
    errorCodes.amountPaid = "CASH_INSUFFICIENT";
  }

  return { errors, errorCodes, isFormValid: Object.keys(errors).length === 0 };
};
