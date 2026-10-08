import { format, isValid, parse } from "date-fns";

export const addExpenseValidationMessages = {
  categoryRequired: "Category is required.",
  categoryUnavailable: "Select an available expense category.",
  dateRequired: "Date is required.",
  dateInvalid: "Enter a valid expense date.",
  dateOutsideRange: (dateLimits) => {
    return `Choose a date from ${format(dateLimits.minExpenseDate, "MM/dd/yyyy")} through ${format(dateLimits.maxExpenseDate, "MM/dd/yyyy")}.`;
  },
  amountInvalid: "Amount must be greater than 0.",
  descriptionRequired: "Description is required.",
  reasonRequired: "Reason is required.",
  itemRequired: "Inventory item is required.",
  itemUnavailable: "Select an available inventory item.",
  quantityInvalid: "Quantity must be greater than 0.",
  expirationRequired: "Expiration date is required.",
  expirationInvalid: "Enter a valid expiration date.",
  expirationOutsideRange: "Choose an expiration from today through 10 years from today.",
  paymentRequired: "Payment method is required.",
  paymentUnavailable: "Select an available payment method.",
};

/**
 * Common expense field rules used by Add and reused by Edit's validator.
 * @param {Object} formData The expense form data.
 * @param {Object} options Configuration options.
 * @param {boolean} options.isPurchase Whether the selected category is 'Inventory Purchase'.
 * @param {Object} options.selectedItem The selected inventory item (required if isPurchase is true).
 * @returns {Object} Field errors and overall form validity.
 */
export const validateExpenseForm = (formData, options = {}) => {
  const { isPurchase = false, selectedItem = null, dateLimits = null, categories = null, paymentMethods = null } = options;
  const errors = {};
  const messages = addExpenseValidationMessages;

  if (!formData.category_id) errors.category_id = messages.categoryRequired;
  else if (categories) {
    const category = categories.find((item) => item.id === formData.category_id);
    if (!category || category.category_name.trim().toLowerCase() === "inventory wastage") {
      errors.category_id = messages.categoryUnavailable;
    }
  }
  if (!formData.expense_date) errors.expense_date = messages.dateRequired;
  else if (dateLimits) {
    const date = parse(formData.expense_date, "yyyy-MM-dd", new Date());
    if (!isValid(date) || format(date, "yyyy-MM-dd") !== formData.expense_date) {
      errors.expense_date = messages.dateInvalid;
    } else if (date < dateLimits.minExpenseDate || date > dateLimits.maxExpenseDate) {
      errors.expense_date = messages.dateOutsideRange(dateLimits);
    }
  }

  if (!formData.amount || !Number.isFinite(Number(formData.amount)) || Number(formData.amount) <= 0) {
    errors.amount = messages.amountInvalid;
  }

  if (isPurchase) {
    if (!formData.description?.trim()) {
      errors.description = messages.descriptionRequired;
    }
    if (!formData.reason?.trim()) {
      errors.reason = messages.reasonRequired;
    }
    if (!formData.inventory_item_id) {
      errors.inventory_item_id = messages.itemRequired;
    } else if (!selectedItem) {
      errors.inventory_item_id = messages.itemUnavailable;
    }
    if (!formData.quantity_to_add || !Number.isFinite(Number(formData.quantity_to_add)) || Number(formData.quantity_to_add) <= 0) {
      errors.quantity_to_add = messages.quantityInvalid;
    }
    if (selectedItem?.track_expiry && !formData.expiration_date) {
      errors.expiration_date = messages.expirationRequired;
    }
    if (formData.expiration_date && dateLimits) {
      const expiration = parse(formData.expiration_date, "yyyy-MM-dd", new Date());
      if (!isValid(expiration) || format(expiration, "yyyy-MM-dd") !== formData.expiration_date) {
        errors.expiration_date = messages.expirationInvalid;
      } else if (expiration < dateLimits.minExpirationDate || expiration > dateLimits.maxExpirationDate) {
        errors.expiration_date = messages.expirationOutsideRange;
      }
    }

    return { errors, isFormValid: Object.keys(errors).length === 0 };
  }

  if (!formData.description?.trim()) {
    errors.description = messages.descriptionRequired;
  }

  if (!formData.payment_method) {
    errors.payment_method = messages.paymentRequired;
  } else if (paymentMethods && !paymentMethods.includes(formData.payment_method)) {
    errors.payment_method = messages.paymentUnavailable;
  }

  return { errors, isFormValid: Object.keys(errors).length === 0 };
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
