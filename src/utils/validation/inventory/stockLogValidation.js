import { format, isValid, parse } from "date-fns";

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
}) => {
  const errors = {};
  const numericQuantity = Number(quantity);

  if (quantity === "" || !Number.isFinite(numericQuantity))
    errors.quantity = "Quantity is required.";
  else if (actionType === "correct") {
    if (numericQuantity < 1)
      errors.quantity = "Quantity must be greater than 0.";
    else if (numericQuantity === selectedBatchStock)
      errors.quantity = "The batch already has this quantity.";
  } else if (numericQuantity <= 0)
    errors.quantity = "Quantity must be greater than 0.";
  else if (actionType === "wastage" && numericQuantity > currentStock)
    errors.quantity = `Cannot waste more than current stock (${currentStock}).`;

  if (expirationDate) {
    const date = parse(expirationDate, "yyyy-MM-dd", new Date());

    if (!isValid(date) || format(date, "yyyy-MM-dd") !== expirationDate)
      errors.expirationDate = "Enter a valid expiration date.";
    else if (minExpirationDate && expirationDate < minExpirationDate)
      errors.expirationDate = "Expiration cannot be before today.";
    else if (maxExpirationDate && expirationDate > maxExpirationDate)
      errors.expirationDate = "Expiration cannot exceed 10 years from today.";
  }

  if (actionType === "restock") {
    const numericCost = Number(totalCost);
    if (totalCost === "" || !Number.isFinite(numericCost) || numericCost < 1)
      errors.totalCost = "Total cost must be at least 1.";

    if (isExpiryTracked && !expirationDate)
      errors.expirationDate = "Expiration date is required.";
  }

  if (actionType !== "restock" && !selectedBatchId)
    errors.selectedBatchId = "Please select a batch.";

  if (!reason.trim()) errors.reason = "Reason is required.";

  return errors;
};
