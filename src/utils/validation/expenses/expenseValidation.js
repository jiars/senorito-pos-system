/**
 * Validates expense form data for both Add and Edit scenarios.
 * @param {Object} formData The expense form data.
 * @param {Object} options Configuration options.
 * @param {boolean} options.isPurchase Whether the selected category is 'Inventory Purchase'.
 * @param {Object} options.selectedItem The selected inventory item (required if isPurchase is true).
 * @returns {Object} An object containing validation errors. Empty if valid.
 */
export const validateExpenseForm = (formData, options = {}) => {
  const { isPurchase = false, selectedItem = null } = options;
  const errors = {};

  if (!formData.category_id) errors.category_id = "Category is required.";
  if (!formData.expense_date) errors.expense_date = "Date is required.";

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
