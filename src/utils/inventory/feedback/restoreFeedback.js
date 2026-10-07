import { resolveErrorFeedback } from "@/utils/feedback/errorFeedback";

export const RESTORE_FEEDBACK = {
  SAVE_FAILED: "Couldn’t restore the item. Please try again.",
  SAVE_UNCONFIRMED: "Couldn’t confirm the restore. Check active inventory before trying again.",
  SESSION_EXPIRED: "Session expired. Sign in again.",
  PERMISSION_DENIED: "You don’t have permission to restore inventory.",
  VALIDATION_FAILED: "The restore request was rejected. Refresh inventory and review the item.",
  RESTORE_CONFLICT: "This item may already be active. Refresh inventory and check its current status.",
  REFRESH_FAILED: "Item restored. Couldn’t refresh Inventory, Menu, or POS data.",
  AFFECTED_LOAD_FAILED: "Couldn’t check affected records. Retry before restoring.",
  ITEM_RESTORED: "Item restored successfully",
};

export const RESTORE_INLINE_ERRORS = {
  SAVE_FAILED: { type: "critical", message: RESTORE_FEEDBACK.SAVE_FAILED },
  SAVE_UNCONFIRMED: { type: "critical", message: RESTORE_FEEDBACK.SAVE_UNCONFIRMED },
  SESSION_EXPIRED: { type: "critical", message: RESTORE_FEEDBACK.SESSION_EXPIRED },
  PERMISSION_DENIED: { type: "critical", message: RESTORE_FEEDBACK.PERMISSION_DENIED },
  VALIDATION_FAILED: { type: "critical", message: RESTORE_FEEDBACK.VALIDATION_FAILED },
  RESTORE_CONFLICT: { type: "critical", message: RESTORE_FEEDBACK.RESTORE_CONFLICT },
  REFRESH_FAILED: { type: "critical", message: RESTORE_FEEDBACK.REFRESH_FAILED },
  AFFECTED_LOAD_FAILED: { type: "critical", message: RESTORE_FEEDBACK.AFFECTED_LOAD_FAILED },
};

export const getRestoreInlineFeedback = (code) => {
  const definition = RESTORE_INLINE_ERRORS[code];
  if (!definition) return null;
  return resolveErrorFeedback({ code, ...definition, showCode: true });
};

export const RESTORE_STATUS_FEEDBACK = {
  ITEM_RESTORING: {
    type: "loading", display: "status", tone: "info",
    title: "Restoring item…", message: "Please wait while the item is restored.",
  },
  INVENTORY_REFRESHING: {
    type: "loading", display: "status", tone: "info",
    title: "Refreshing data…", message: "Item restored. Updating Inventory, Menu, and POS.",
  },
  INVENTORY_REFRESH_FAILED: {
    type: "critical", display: "status", tone: "error",
    title: "Data could not refresh", message: RESTORE_FEEDBACK.REFRESH_FAILED,
    buttonLabel: "Retry refresh",
  },
};

export const getRestoreStatusFeedback = (code) => {
  const definition = RESTORE_STATUS_FEEDBACK[code];
  if (!definition) return null;
  return resolveErrorFeedback({ code, ...definition });
};

export const RESTORE_TOAST_FEEDBACK = {
  ITEM_RESTORED: {
    type: "notification", toastType: "success", display: "toast",
    title: RESTORE_FEEDBACK.ITEM_RESTORED,
  },
};

export const getRestoreToastFeedback = (code, details = {}) => {
  const definition = RESTORE_TOAST_FEEDBACK[code];
  if (!definition) return null;
  const resolved = resolveErrorFeedback(definition);
  const caption = " has been restored to active inventory.";
  return {
    type: resolved.toastType,
    title: resolved.title,
    description: `${details.itemName}${caption}`,
    timeout: resolved.duration,
    data: {
      width: details.width,
      descriptionParts: [{ label: details.itemName }, { text: caption }],
    },
  };
};
