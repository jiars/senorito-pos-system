import { getBusinessDateKey } from "@/utils/shared/formatters/businessDates";

export const generateOfflineTransactionId = () => {
  const dateStr = getBusinessDateKey(new Date()).slice(2).replace(/-/g, ""); // YYMMDD

  // Continuous increment (doesn't reset per day)
  const counterKey = "offline_global_count";
  let currentCount = parseInt(localStorage.getItem(counterKey) || "0", 10);
  currentCount += 1;
  localStorage.setItem(counterKey, currentCount.toString());

  const paddedCount = currentCount.toString().padStart(4, "0");
  return `OFF-${dateStr}-${paddedCount}`;
};

// Create one permanent UUID for one checkout and all its retries.
export const generateClientTransactionId = () => {
  return crypto.randomUUID();
};
