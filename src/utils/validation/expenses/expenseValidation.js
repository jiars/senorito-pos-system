import { format, isValid, parse } from "date-fns";

/**
 * Validates expense form data for both Add and Edit scenarios.
 * @param {Object} formData The expense form data.
 * @param {Object} options Configuration options.
 * @param {boolean} options.isPurchase Whether the selected category is 'Inventory Purchase'.
 * @param {Object} options.selectedItem The selected inventory item (required if isPurchase is true).
 * @returns {Object} An object containing validation errors. Empty if valid.
 */
export const validateExpenseForm = (formData, options = {}) => {
  const { isPurchase = false, selectedItem = null, dateLimits = null } = options;
  const errors = {};

  if (!formData.category_id) errors.category_id = "Category is required.";
  if (!formData.expense_date) errors.expense_date = "Date is required.";
  else if (dateLimits) {
    const date = parse(formData.expense_date, "yyyy-MM-dd", new Date());
    if (!isValid(date) || format(date, "yyyy-MM-dd") !== formData.expense_date) {
      errors.expense_date = "Enter a valid expense date.";
    } else if (date < dateLimits.minExpenseDate || date > dateLimits.maxExpenseDate) {
      errors.expense_date = `Choose a date from ${format(dateLimits.minExpenseDate, "MM/dd/yyyy")} through today.`;
    }
  }

  if (!formData.amount || Number(formData.amount) <= 0) {
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
    }
    if (!formData.quantity_to_add || Number(formData.quantity_to_add) <= 0) {
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
  }

  return errors;
};
