import { validateExpenseDate } from "./expenseDateValidation";

export const editExpenseValidationMessages = {
  categoryRequired: "Category is required.",
  categoryUnavailable: "Select an available expense category.",
  dateRequired: "Date is required.",
  dateInvalid: "Enter a valid expense date.",
  dateFuture: "Expense date cannot be in the future.",
  dateTooOld: "Expense date can only go back up to 3 months.",
  amountInvalid: "Amount must be greater than 0.",
  descriptionRequired: "Description is required.",
  paymentRequired: "Payment method is required.",
  paymentUnavailable: "Select an available payment method.",
  textTooLong: (limit) => {
    return `Use ${limit} characters or fewer.`;
  },
};

// Keep an existing historical date; future dates are never allowed.
export const validateEditExpenseForm = (formData, categories, paymentMethods, originalPaymentMethod, dateLimits, originalExpenseDate, isExpenseDateInputValid = true, expenseDateInput = "") => {
  const errors = {};
  const messages = editExpenseValidationMessages;
  if (!formData.category_id) errors.category_id = messages.categoryRequired;
  if (!formData.expense_date) errors.expense_date = messages.dateRequired;
  if (!formData.description.trim()) errors.description = messages.descriptionRequired;
  if (!formData.amount || !Number.isFinite(Number(formData.amount)) || Number(formData.amount) <= 0) {
    errors.amount = messages.amountInvalid;
  }
  if (!formData.payment_method) errors.payment_method = messages.paymentRequired;
  if (formData.category_id && !categories.some((category) => String(category.id) === String(formData.category_id))) {
    errors.category_id = messages.categoryUnavailable;
  }
  if (formData.expense_date) {
    const error = validateExpenseDate(formData.expense_date, dateLimits, originalExpenseDate, "yyyy-MM-dd", messages);
    if (error) errors.expense_date = error;
  }
  if (!isExpenseDateInputValid) {
    errors.expense_date = validateExpenseDate(expenseDateInput, dateLimits, null, "MM/dd/yyyy", messages);
  }
  if (formData.payment_method && !paymentMethods.includes(formData.payment_method) && formData.payment_method !== originalPaymentMethod) {
    errors.payment_method = messages.paymentUnavailable;
  }
  const textLimits = { description: 1000, vendor: 255, receipt_reference: 255 };
  for (const [field, limit] of Object.entries(textLimits)) {
    if (formData[field].trim().length > limit) errors[field] = messages.textTooLong(limit);
  }
  return { errors, isFormValid: Object.keys(errors).length === 0 };
};

export const getEditExpenseServerFieldErrors = (backendErrors) => {
  const errors = {};
  const fields = ["category_id", "expense_date", "description", "amount", "vendor", "payment_method", "receipt_reference"];
  for (const field of fields) {
    const messages = backendErrors[field];
    if (Array.isArray(messages) && messages.length) errors[field] = messages[0];
  }
  return errors;
};
