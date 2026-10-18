import { resolveErrorFeedback } from "@/utils/feedback/errorFeedback";

export const INVENTORY_CLEANUP_COPY = {
  TITLE: "Today's Expiry Check",
  DESCRIPTION: "View the saved daily cleanup result. Viewing does not change stock.",
  CLOSE: "Close",
  RETRY: "Retry",
  RETRY_WAIT: "Retry available in 3 seconds",
  EMPTY: "No expired batch stock was removed during today's check.",
  LOADING_LABEL: "Loading expiry details",
};

export const INVENTORY_CLEANUP_STATUS_FEEDBACK = {
  NOT_COMPLETED: {
    type: "notification",
    tone: "warning",
    title: "Today's cleanup is not completed yet",
    message: "No successful result is available. This is not a zero-expiry result.",
  },
  DETAILS_UNAVAILABLE: {
    type: "notification",
    tone: "warning",
    title: "Cleanup completed; batch details unavailable",
    message: "The saved count is available, but complete linked audit details are missing. This does not mean zero stock was removed.",
  },
  LOAD_FAILED: {
    type: "critical",
    tone: "error",
    title: "Couldn't load expiry details",
    message: "Check your connection and retry. No cleanup is started by this viewer.",
  },
  SESSION_EXPIRED: {
    type: "critical",
    tone: "error",
    title: "Sign-in required",
    message: "Your session could not be verified. Sign in again to view expiry details.",
  },
  PERMISSION_DENIED: {
    type: "critical",
    tone: "error",
    title: "Expiry details are not available to this account",
    message: "Only active Owner and Inventory Clerk accounts can view these details.",
  },
};

export const getInventoryCleanupStatusFeedback = (code) => {
  const definition = INVENTORY_CLEANUP_STATUS_FEEDBACK[code];
  if (!definition) return null;
  return resolveErrorFeedback({ code, display: "status", ...definition });
};

export const getInventoryCleanupSummaryFeedback = (summary) => {
  if (!summary) return getInventoryCleanupStatusFeedback("LOAD_FAILED");
  if (!summary.completed) return getInventoryCleanupStatusFeedback("NOT_COMPLETED");
  if (!summary.details_available) return getInventoryCleanupStatusFeedback("DETAILS_UNAVAILABLE");
  // Completed results use the summary and batch list, without an extra banner.
  return null;
};

export const getInventoryCleanupErrorFeedback = (error) => {
  const status = error?.response?.status;
  if (status === 401) return getInventoryCleanupStatusFeedback("SESSION_EXPIRED");
  if (status === 403) return getInventoryCleanupStatusFeedback("PERMISSION_DENIED");
  return getInventoryCleanupStatusFeedback("LOAD_FAILED");
};
