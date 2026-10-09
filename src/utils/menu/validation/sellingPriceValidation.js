export const MAX_SELLING_PRICE = 99999.99;

export const sellingPriceValidationMessages = {
  priceRequired: "Selling price is required.",
  priceInvalid: "Price must be greater than 0.",
  priceTooHigh: "Price cannot exceed ₱99,999.99.",
  pricePrecision: "Use up to 2 decimal places.",
};

// Shared by form validation and previews, independent of when errors are shown.
export const getSellingPriceError = (value) => {
  const messages = sellingPriceValidationMessages;
  if (value === null || value === undefined || String(value).trim() === "") return messages.priceRequired;
  const price = Number(value);
  if (!Number.isFinite(price) || price <= 0) return messages.priceInvalid;
  if (price > MAX_SELLING_PRICE) return messages.priceTooHigh;
  // Normalize scientific notation and harmless trailing zeroes before checking cents.
  if (!/^\d+(\.\d{1,2})?$/.test(String(price))) return messages.pricePrecision;
  return "";
};
