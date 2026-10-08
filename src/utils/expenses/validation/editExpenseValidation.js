import { format, isValid, parse } from "date-fns";
import { validateExpenseForm } from "./addExpenseValidation";

// Keep an existing historical date; newly chosen dates follow the shared bounds.
export const validateEditExpenseForm = (formData, categories, paymentMethods, originalPaymentMethod, dateLimits, originalExpenseDate) => {
  const errors = validateExpenseForm(formData);
  if (formData.category_id && !categories.some((category) => String(category.id) === String(formData.category_id))) {
    errors.category_id = "Select an available expense category.";
  }
  if (formData.expense_date) {
    const date = parse(formData.expense_date, "yyyy-MM-dd", new Date());
    if (!isValid(date) || format(date, "yyyy-MM-dd") !== formData.expense_date) {
      errors.expense_date = "Enter a valid expense date.";
    } else if (formData.expense_date !== originalExpenseDate && (date < dateLimits.minExpenseDate || date > dateLimits.maxExpenseDate)) {
      errors.expense_date = `Choose a date from ${format(dateLimits.minExpenseDate, "MM/dd/yyyy")} through ${format(dateLimits.maxExpenseDate, "MM/dd/yyyy")}.`;
    }
  }
  if (formData.payment_method && !paymentMethods.includes(formData.payment_method) && formData.payment_method !== originalPaymentMethod) {
    errors.payment_method = "Select an available payment method.";
  }
  const textLimits = { description: 1000, vendor: 255, receipt_reference: 255 };
  for (const [field, limit] of Object.entries(textLimits)) {
    if (formData[field].trim().length > limit) errors[field] = `Use ${limit} characters or fewer.`;
  }
  return errors;
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
