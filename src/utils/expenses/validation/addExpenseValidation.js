import { format, isValid, parse } from "date-fns";

/**
 * Common expense field rules used by Add and reused by Edit's validator.
 * @param {Object} formData The expense form data.
 * @param {Object} options Configuration options.
 * @param {boolean} options.isPurchase Whether the selected category is 'Inventory Purchase'.
 * @param {Object} options.selectedItem The selected inventory item (required if isPurchase is true).
 * @returns {Object} An object containing validation errors. Empty if valid.
 */
export const validateExpenseForm = (formData, options = {}) => {
  const { isPurchase = false, selectedItem = null, dateLimits = null, categories = null, paymentMethods = null } = options;
  const errors = {};

  if (!formData.category_id) errors.category_id = "Category is required.";
  else if (categories) {
    const category = categories.find((item) => item.id === formData.category_id);
    if (!category || category.category_name.trim().toLowerCase() === "inventory wastage") {
      errors.category_id = "Select an available expense category.";
    }
  }
  if (!formData.expense_date) errors.expense_date = "Date is required.";
  else if (dateLimits) {
    const date = parse(formData.expense_date, "yyyy-MM-dd", new Date());
    if (!isValid(date) || format(date, "yyyy-MM-dd") !== formData.expense_date) {
      errors.expense_date = "Enter a valid expense date.";
    } else if (date < dateLimits.minExpenseDate || date > dateLimits.maxExpenseDate) {
      errors.expense_date = `Choose a date from ${format(dateLimits.minExpenseDate, "MM/dd/yyyy")} through ${format(dateLimits.maxExpenseDate, "MM/dd/yyyy")}.`;
    }
  }

  if (!formData.amount || !Number.isFinite(Number(formData.amount)) || Number(formData.amount) <= 0) {
    errors.amount = "Amount must be greater than 0.";
  }

  if (isPurchase) {
    if (!formData.description?.trim()) {
      errors.description = "Description is required.";
    }
    if (!formData.reason?.trim()) {
      errors.reason = "Reason is required.";
    }
    if (!formData.inventory_item_id) {
      errors.inventory_item_id = "Inventory item is required.";
    } else if (!selectedItem) {
      errors.inventory_item_id = "Select an available inventory item.";
    }
    if (!formData.quantity_to_add || !Number.isFinite(Number(formData.quantity_to_add)) || Number(formData.quantity_to_add) <= 0) {
      errors.quantity_to_add = "Quantity must be greater than 0.";
    }
    if (selectedItem?.track_expiry && !formData.expiration_date) {
      errors.expiration_date = "Expiration date is required.";
    }
    if (formData.expiration_date && dateLimits) {
      const expiration = parse(formData.expiration_date, "yyyy-MM-dd", new Date());
      if (!isValid(expiration) || format(expiration, "yyyy-MM-dd") !== formData.expiration_date) {
        errors.expiration_date = "Enter a valid expiration date.";
      } else if (expiration < dateLimits.minExpirationDate || expiration > dateLimits.maxExpirationDate) {
        errors.expiration_date = "Choose an expiration from today through 10 years from today.";
      }
    }

    return errors;
  }

  if (!formData.description?.trim()) {
    errors.description = "Description is required.";
  }

  if (!formData.payment_method) {
    errors.payment_method = "Payment method is required.";
  } else if (paymentMethods && !paymentMethods.includes(formData.payment_method)) {
    errors.payment_method = "Select an available payment method.";
  }

  return errors;
};

export const getAddExpenseServerFieldErrors = (backendErrors) => {
  const fieldNames = {
    category_id: "category_id", expense_date: "expense_date", description: "description",
    amount: "amount", payment_method: "payment_method", inventory_item_id: "inventory_item_id",
    quantity_to_add: "quantity_to_add", reason: "reason", expiration_date: "expiration_date",
    "stockData.quantity": "quantity_to_add", "stockData.reason": "reason",
    "purchaseData.total_cost": "amount", "purchaseData.expense_date": "expense_date",
    "purchaseData.expiration_date": "expiration_date",
    "purchaseData.description": "description",
  };
  const errors = {};
  for (const [backendField, formField] of Object.entries(fieldNames)) {
    const messages = backendErrors[backendField];
    if (Array.isArray(messages) && messages.length) errors[formField] = messages[0];
  }
  return errors;
};
