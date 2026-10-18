// Sales choices only. Expenses have their own payment methods.
export const paymentMethodOptions = [
  { label: "Cash", value: "Cash", iconClassName: "bi bi-cash" },
  { label: "GCash", value: "GCash", iconClassName: "bi bi-credit-card" },
  { label: "External", value: "External", iconClassName: "bi bi-bag" },
];

export const orderSourceOptions = [
  { label: "In-Store", value: "In-Store" },
  { label: "Foodpanda", value: "Foodpanda" },
  { label: "Grab", value: "Grab" },
];

// Match old spellings without changing the saved transaction.
export const normalizeOrderSource = (source) => {
  const sourceText = String(source || "").trim();
  const sourceKey = sourceText.toLowerCase().replace(/[\s-]+/g, "");
  const option = orderSourceOptions.find((entry) => {
    return entry.value.toLowerCase().replace(/[\s-]+/g, "") === sourceKey;
  });
  if (option) return option.value;
  return sourceText;
};

export const matchesOrderSource = (source, selectedSources = []) => {
  if (selectedSources.length === 0) return true;
  const normalizedSource = normalizeOrderSource(source);
  return selectedSources.some((selectedSource) => {
    return normalizeOrderSource(selectedSource) === normalizedSource;
  });
};
