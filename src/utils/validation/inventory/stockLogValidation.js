export const validateStockLog = ({
  actionType,
  quantity,
  currentStock,
  totalCost,
  expirationDate,
  isExpiryTracked,
  selectedBatchId,
  reason,
}) => {
  const errors = {};
  const numericQuantity = Number(quantity);

  if (quantity === '' || !Number.isFinite(numericQuantity)) {
    errors.quantity = 'Quantity is required.';
  } else if (actionType === 'correct') {
    if (numericQuantity < 0) {
      errors.quantity = 'Quantity cannot be negative.';
    } else if (numericQuantity === currentStock) {
      errors.quantity = 'New stock is the same as current stock.';
    }
  } else if (numericQuantity <= 0) {
    errors.quantity = 'Quantity must be greater than 0.';
  } else if (actionType === 'wastage' && numericQuantity > currentStock) {
    errors.quantity = `Cannot waste more than current stock (${currentStock}).`;
  }

  if (actionType === 'restock') {
    const numericCost = Number(totalCost);
    if (totalCost === '' || !Number.isFinite(numericCost) || numericCost < 0) {
      errors.totalCost = 'Enter a valid total cost.';
    }

    if (isExpiryTracked && !expirationDate) {
      errors.expirationDate = 'Expiration date is required.';
    }
  }

  if (actionType !== 'restock' && !selectedBatchId) {
    errors.selectedBatchId = 'Please select a batch.';
  }

  if (!reason.trim()) {
    errors.reason = 'Reason is required.';
  }

  return errors;
};
