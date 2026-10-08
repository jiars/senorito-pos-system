import { format, isValid, parse } from "date-fns";

export const stockLogValidationMessages = {
  itemRequired: "Please select an inventory item.",
  quantityRequired: "Quantity is required.",
  quantityInvalid: "Quantity must be greater than 0.",
  quantityUnchanged: "The batch already has this quantity.",
  stockExceeded: (currentStock) => {
    return `Cannot waste more than current stock (${currentStock}).`;
  },
  expirationInvalid: "Enter a valid expiration date.",
  expirationPast: "Expiration cannot be before today.",
  expirationTooFar: "Expiration cannot exceed 10 years from today.",
  expirationRequired: "Expiration date is required.",
  expirationInputInvalid: "Enter a complete, valid expiration date within the allowed range.",
  costInvalid: "Total cost must be at least 1.",
  batchRequired: "Please select a batch.",
  reasonRequired: "Reason is required.",
};

export const validateStockLog = ({
  actionType,
  quantity,
  currentStock,
  totalCost,
  expirationDate,
  isExpiryTracked,
  minExpirationDate,
  maxExpirationDate,
  selectedBatchId,
  selectedBatchStock,
  reason,
  selectedItem,
  isExpirationInputValid = true,
}) => {
  const errors = {};
  const messages = stockLogValidationMessages;
  const numericQuantity = Number(quantity);

  if (!selectedItem) errors.item = messages.itemRequired;

  if (quantity === "" || !Number.isFinite(numericQuantity))
    errors.quantity = messages.quantityRequired;
  else if (actionType === "correct") {
    if (numericQuantity < 1)
      errors.quantity = messages.quantityInvalid;
    else if (numericQuantity === selectedBatchStock)
      errors.quantity = messages.quantityUnchanged;
  } else if (numericQuantity <= 0)
    errors.quantity = messages.quantityInvalid;
  else if (actionType === "wastage" && numericQuantity > currentStock)
    errors.quantity = messages.stockExceeded(currentStock);

  if (expirationDate) {
    const date = parse(expirationDate, "yyyy-MM-dd", new Date());

    if (!isValid(date) || format(date, "yyyy-MM-dd") !== expirationDate)
      errors.expirationDate = messages.expirationInvalid;
    else if (minExpirationDate && expirationDate < minExpirationDate)
      errors.expirationDate = messages.expirationPast;
    else if (maxExpirationDate && expirationDate > maxExpirationDate)
      errors.expirationDate = messages.expirationTooFar;
  }

  if (actionType === "restock") {
    const numericCost = Number(totalCost);
    if (totalCost === "" || !Number.isFinite(numericCost) || numericCost < 1)
      errors.totalCost = messages.costInvalid;

    if (isExpiryTracked && !expirationDate)
      errors.expirationDate = messages.expirationRequired;
    // The date input can contain an incomplete draft before emitting a date.
    if (!isExpirationInputValid) {
      errors.expirationDate = messages.expirationInputInvalid;
    }
  }

  if (actionType !== "restock" && !selectedBatchId)
    errors.selectedBatchId = messages.batchRequired;

  if (!reason.trim()) errors.reason = messages.reasonRequired;

  return { errors, isFormValid: Object.keys(errors).length === 0 };
};
