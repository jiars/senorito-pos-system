import { addExpenseValidationMessages, getExpenseDateError, validateExpenseForm } from "./addExpenseValidation";

// Reuse common expense copy; Edit adds its own field-length message.
export const editExpenseValidationMessages = {
  ...addExpenseValidationMessages,
  textTooLong: (limit) => {
    return `Use ${limit} characters or fewer.`;
  },
};

// Keep an existing historical date; future dates are never allowed.
export const validateEditExpenseForm = (formData, categories, paymentMethods, originalPaymentMethod, dateLimits, originalExpenseDate, isExpenseDateInputValid = true, expenseDateInput = "") => {
  const validation = validateExpenseForm(formData);
  const errors = validation.errors;
  const messages = editExpenseValidationMessages;
  if (formData.category_id && !categories.some((category) => String(category.id) === String(formData.category_id))) {
    errors.category_id = messages.categoryUnavailable;
  }
  if (formData.expense_date) {
    const error = getExpenseDateError(formData.expense_date, dateLimits, originalExpenseDate);
    if (error) errors.expense_date = error;
  }
  if (!isExpenseDateInputValid) {
    errors.expense_date = getExpenseDateError(expenseDateInput, dateLimits, null, "MM/dd/yyyy");
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
