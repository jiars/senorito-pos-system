import { resolveErrorFeedback } from "@/utils/feedback/errorFeedback";

export const EDIT_INVENTORY_FEEDBACK = {
  SAVE_FAILED: "Couldn’t save changes. Please try again.",
  REFRESH_FAILED: "Changes saved. Couldn’t refresh inventory.",
  ITEM_UPDATED: "Inventory item updated",
  SESSION_EXPIRED: "Session expired. Sign in again.",
  PERMISSION_DENIED: "You don’t have permission to edit inventory.",
  VALIDATION_FAILED: "Some details were rejected. Review your inputs.",
  SAVE_UNCONFIRMED:
    "Couldn’t confirm the save. Check item details before trying again.",
};

export const EDIT_INVENTORY_INLINE_ERRORS = {
  SAVE_FAILED: {
    type: "critical",
    message: EDIT_INVENTORY_FEEDBACK.SAVE_FAILED,
  },
  REFRESH_FAILED: {
    type: "critical",
    message: EDIT_INVENTORY_FEEDBACK.REFRESH_FAILED,
  },
  SESSION_EXPIRED: {
    type: "critical",
    message: EDIT_INVENTORY_FEEDBACK.SESSION_EXPIRED,
  },
  PERMISSION_DENIED: {
    type: "critical",
    message: EDIT_INVENTORY_FEEDBACK.PERMISSION_DENIED,
  },
  VALIDATION_FAILED: {
    type: "validation",
    message: EDIT_INVENTORY_FEEDBACK.VALIDATION_FAILED,
  },
  SAVE_UNCONFIRMED: {
    type: "critical",
    message: EDIT_INVENTORY_FEEDBACK.SAVE_UNCONFIRMED,
    buttonLabel: "Check item first",
  },
};

export const getEditInventoryInlineFeedback = (code) => {
  const definition = EDIT_INVENTORY_INLINE_ERRORS[code];
  if (!definition) return null;
  return resolveErrorFeedback({ code, ...definition, showCode: true });
};

export const EDIT_INVENTORY_STATUS_FEEDBACK = {
  ITEM_SAVING: {
    type: "loading",
    display: "status",
    tone: "info",
    title: "Saving changes…",
    message: "Please wait while the item is updated.",
  },
  INVENTORY_REFRESHING: {
    type: "loading",
    display: "status",
    tone: "info",
    title: "Refreshing inventory…",
    message: "Changes saved. Updating inventory.",
  },
  INVENTORY_REFRESH_FAILED: {
    type: "critical",
    display: "status",
    tone: "error",
    title: "Inventory could not refresh",
    message: EDIT_INVENTORY_FEEDBACK.REFRESH_FAILED,
    buttonLabel: "Retry refresh",
  },
};

export const getEditInventoryStatusFeedback = (code) => {
  const definition = EDIT_INVENTORY_STATUS_FEEDBACK[code];
  if (!definition) return null;
  return resolveErrorFeedback({ code, ...definition });
};

export const EDIT_INVENTORY_TOAST_FEEDBACK = {
  ITEM_UPDATED: {
    type: "notification",
    toastType: "success",
    display: "toast",
    title: EDIT_INVENTORY_FEEDBACK.ITEM_UPDATED,
  },
};

export const getEditInventoryToastFeedback = (code, details = {}) => {
  const definition = EDIT_INVENTORY_TOAST_FEEDBACK[code];
  if (!definition) return null;

  const resolved = resolveErrorFeedback(definition);
  return {
    type: resolved.toastType,
    title: resolved.title,
    description: `${details.itemName} details have been updated successfully.`,
    timeout: resolved.duration,
    data: { width: details.width },
  };
};
