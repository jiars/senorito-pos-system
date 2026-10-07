import { resolveErrorFeedback } from "@/utils/feedback/errorFeedback";

export const ARCHIVE_FEEDBACK = {
  SAVE_FAILED: "Couldn’t archive the item. Please try again.",
  SAVE_UNCONFIRMED: "Couldn’t confirm the archive. Check Inventory Archive before trying again.",
  SESSION_EXPIRED: "Session expired. Sign in again.",
  PERMISSION_DENIED: "You don’t have permission to archive inventory.",
  VALIDATION_FAILED: "The archive request was rejected. Refresh inventory and review the item.",
  ARCHIVE_CONFLICT: "This item may already be archived. Refresh inventory and check Inventory Archive.",
  REFRESH_FAILED: "Item archived. Couldn’t refresh Inventory, Menu, or POS data.",
  AFFECTED_LOAD_FAILED: "Couldn’t check affected records. Retry before archiving.",
  ITEM_ARCHIVED: "Item archived successfully",
};

export const ARCHIVE_INLINE_ERRORS = {
  SAVE_FAILED: { type: "critical", message: ARCHIVE_FEEDBACK.SAVE_FAILED },
  SAVE_UNCONFIRMED: { type: "critical", message: ARCHIVE_FEEDBACK.SAVE_UNCONFIRMED },
  SESSION_EXPIRED: { type: "critical", message: ARCHIVE_FEEDBACK.SESSION_EXPIRED },
  PERMISSION_DENIED: { type: "critical", message: ARCHIVE_FEEDBACK.PERMISSION_DENIED },
  VALIDATION_FAILED: { type: "critical", message: ARCHIVE_FEEDBACK.VALIDATION_FAILED },
  ARCHIVE_CONFLICT: { type: "critical", message: ARCHIVE_FEEDBACK.ARCHIVE_CONFLICT },
  REFRESH_FAILED: { type: "critical", message: ARCHIVE_FEEDBACK.REFRESH_FAILED },
  AFFECTED_LOAD_FAILED: { type: "critical", message: ARCHIVE_FEEDBACK.AFFECTED_LOAD_FAILED },
};

export const getArchiveInlineFeedback = (code) => {
  const definition = ARCHIVE_INLINE_ERRORS[code];
  if (!definition) return null;
  return resolveErrorFeedback({ code, ...definition, showCode: true });
};

export const ARCHIVE_STATUS_FEEDBACK = {
  ITEM_ARCHIVING: {
    type: "loading", display: "status", tone: "info",
    title: "Archiving item…", message: "Please wait while the item is archived.",
  },
  INVENTORY_REFRESHING: {
    type: "loading", display: "status", tone: "info",
    title: "Refreshing data…", message: "Item archived. Updating Inventory, Menu, and POS.",
  },
  INVENTORY_REFRESH_FAILED: {
    type: "critical", display: "status", tone: "error",
    title: "Data could not refresh", message: ARCHIVE_FEEDBACK.REFRESH_FAILED,
    buttonLabel: "Retry refresh",
  },
};

export const getArchiveStatusFeedback = (code) => {
  const definition = ARCHIVE_STATUS_FEEDBACK[code];
  if (!definition) return null;
  return resolveErrorFeedback({ code, ...definition });
};

export const ARCHIVE_TOAST_FEEDBACK = {
  ITEM_ARCHIVED: {
    type: "notification", toastType: "success", display: "toast",
    title: ARCHIVE_FEEDBACK.ITEM_ARCHIVED,
  },
};

export const getArchiveToastFeedback = (code, details = {}) => {
  const definition = ARCHIVE_TOAST_FEEDBACK[code];
  if (!definition) return null;
  const resolved = resolveErrorFeedback(definition);
  const caption = " has been moved to Inventory Archive.";
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
