import { getBusinessDateKey } from "@/utils/shared/formatters/businessDates";

export const generateOfflineTransactionId = (clientTransactionId) => {
  const dateStr = getBusinessDateKey(new Date()).slice(2).replace(/-/g, ""); // YYMMDD

  // Use part of this checkout's random UUID, not a separate browser counter.
  // The complete UUID still protects retries; this is only the readable reference.
  const randomSuffix = clientTransactionId.replace(/-/g, "").slice(0, 12).toUpperCase();
  return `OFF-${dateStr}-${randomSuffix}`;
};

// Create one permanent UUID for one checkout and all its retries.
export const generateClientTransactionId = () => {
  return crypto.randomUUID();
};
