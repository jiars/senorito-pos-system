export const receiptReferenceValidationMessages = {
  required: "Receipt/reference number is required for this category.",
  tooLong: "Use 255 characters or fewer for the receipt/reference number.",
};

export const getReceiptReferenceError = (value, isRequired = false) => {
  const reference = String(value ?? "").trim();
  if (isRequired && !reference) return receiptReferenceValidationMessages.required;
  if (Array.from(reference).length > 255) return receiptReferenceValidationMessages.tooLong;
  return "";
};
