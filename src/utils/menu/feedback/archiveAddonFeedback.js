import { resolveErrorFeedback } from "@/utils/feedback/errorFeedback";

export const ARCHIVE_FEEDBACK = {
  SAVE_FAILED: "Couldn’t archive the add-on. Please try again.",
  SAVE_UNCONFIRMED: "Couldn’t confirm the archive. Check Menu Archive before trying again.",
  RATE_LIMITED: "Please wait before trying again.",
  SESSION_EXPIRED: "Session expired. Sign in again.",
  PERMISSION_DENIED: "You don’t have permission to archive add-ons.",
  VALIDATION_FAILED: "The archive request was rejected. Refresh Menu and review the add-on.",
  ARCHIVE_CONFLICT: "This add-on may already be archived. Refresh Menu and check Menu Archive.",
  REFRESH_FAILED: "Add-on archived. Couldn’t refresh Menu data.",
  ADDON_ARCHIVED: "Add-on archived successfully",
};

export const ARCHIVE_INLINE_ERRORS = {
  SAVE_FAILED: { type: "critical", message: ARCHIVE_FEEDBACK.SAVE_FAILED },
  SAVE_UNCONFIRMED: { type: "critical", message: ARCHIVE_FEEDBACK.SAVE_UNCONFIRMED },
  RATE_LIMITED: { type: "critical", message: ARCHIVE_FEEDBACK.RATE_LIMITED },
  SESSION_EXPIRED: { type: "critical", message: ARCHIVE_FEEDBACK.SESSION_EXPIRED },
  PERMISSION_DENIED: { type: "critical", message: ARCHIVE_FEEDBACK.PERMISSION_DENIED },
  VALIDATION_FAILED: { type: "critical", message: ARCHIVE_FEEDBACK.VALIDATION_FAILED },
  ARCHIVE_CONFLICT: { type: "critical", message: ARCHIVE_FEEDBACK.ARCHIVE_CONFLICT },
  REFRESH_FAILED: { type: "critical", message: ARCHIVE_FEEDBACK.REFRESH_FAILED },
};

export const getArchiveInlineFeedback = (code) => {
  const definition = ARCHIVE_INLINE_ERRORS[code];
  if (!definition) return null;
  return resolveErrorFeedback({ code, ...definition, showCode: true });
};

export const ARCHIVE_STATUS_FEEDBACK = {
  ADDON_ARCHIVING: {
    type: "loading", display: "status", tone: "info",
    title: "Archiving add-on…", message: "Please wait while the add-on is archived.",
  },
  MENU_REFRESHING: {
    type: "loading", display: "status", tone: "info",
    title: "Refreshing data…", message: "Add-on archived. Updating Menu.",
  },
  MENU_REFRESH_FAILED: {
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
  ADDON_ARCHIVED: {
    type: "notification", toastType: "success", display: "toast",
    title: ARCHIVE_FEEDBACK.ADDON_ARCHIVED,
  },
};

export const getArchiveToastFeedback = (code, details = {}) => {
  const definition = ARCHIVE_TOAST_FEEDBACK[code];
  if (!definition) return null;
  const resolved = resolveErrorFeedback(definition);
  const caption = " has been moved to Menu Archive.";
  return {
    type: resolved.toastType,
    title: resolved.title,
    description: `${details.addonName}${caption}`,
    timeout: resolved.duration,
    data: {
      width: details.width,
      descriptionParts: [{ label: details.addonName }, { text: caption }],
    },
  };
};

export const getArchiveAddonErrorCode = (error) => {
  if (!error || !error.response) return "SAVE_UNCONFIRMED";
  const status = error.response.status;
  if (status === 401) return "SESSION_EXPIRED";
  if (status === 403) return "PERMISSION_DENIED";
  if (status === 404 || status === 409) return "ARCHIVE_CONFLICT";
  if (status === 422) return "VALIDATION_FAILED";
  if (status === 429) return "RATE_LIMITED";
  if (!status || status >= 500) return "SAVE_UNCONFIRMED";
  return "SAVE_FAILED";
};
