import { resolveErrorFeedback } from "@/utils/feedback/errorFeedback";

// Inventory copy only; shared policies own timing and presentation behavior.
export const INVENTORY_FEEDBACK = {
  SAVE_FAILED: "Couldn’t save changes. Please try again.",
  REFRESH_FAILED: "Stock saved. Couldn’t refresh inventory.",
  RESTOCK_SAVED: "Stock received.",
  WASTAGE_SAVED: "Wastage recorded.",
  CORRECTION_SAVED: "Inventory count updated.",
};

export const INVENTORY_INLINE_ERRORS = {
  SAVE_FAILED: {
    type: "critical",
    message: INVENTORY_FEEDBACK.SAVE_FAILED,
  },
  REFRESH_FAILED: {
    type: "critical",
    message: INVENTORY_FEEDBACK.REFRESH_FAILED,
  },
};

export const getInventoryInlineFeedback = (code) => {
  const definition = INVENTORY_INLINE_ERRORS[code];
  if (!definition) return null;
  return resolveErrorFeedback({ code, ...definition });
};

export const INVENTORY_TOAST_FEEDBACK = {
  RESTOCK_SAVED: {
    type: "notification",
    toastType: "success",
    display: "toast",
    title: INVENTORY_FEEDBACK.RESTOCK_SAVED,
  },
  WASTAGE_SAVED: {
    type: "notification",
    toastType: "success",
    display: "toast",
    title: INVENTORY_FEEDBACK.WASTAGE_SAVED,
  },
  CORRECTION_SAVED: {
    type: "notification",
    toastType: "success",
    display: "toast",
    title: INVENTORY_FEEDBACK.CORRECTION_SAVED,
  },
};

export const getInventoryToastFeedback = (code) => {
  const definition = INVENTORY_TOAST_FEEDBACK[code];
  if (!definition) return null;

  const resolved = resolveErrorFeedback(definition);
  return {
    type: resolved.toastType,
    title: resolved.title,
    description: resolved.description,
    timeout: resolved.duration,
  };
};
