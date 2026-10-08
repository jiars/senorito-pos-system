import { formatCurrency } from "@/utils/shared/formatters/currencyFormatters";

export const cashPaymentValidationMessages = {
  totalInvalid: "Order total must be greater than 0.",
  amountRequired: "Enter the cash received.",
  amountInvalid: "Enter a valid cash amount.",
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
  } else if (!errors.total && paid < total) {
    errors.amountPaid = messages.amountInsufficient(total);
    errorCodes.amountPaid = "CASH_INSUFFICIENT";
  }

  return { errors, errorCodes, isFormValid: Object.keys(errors).length === 0 };
};
