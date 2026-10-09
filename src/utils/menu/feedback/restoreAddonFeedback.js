import { resolveErrorFeedback } from "@/utils/feedback/errorFeedback";

export const RESTORE_FEEDBACK = {
  SAVE_FAILED: "Couldn’t restore the add-on. Please try again.",
  SAVE_UNCONFIRMED: "Couldn’t confirm the restore. Check Menu Archive before trying again.",
  RATE_LIMITED: "Please wait before trying again.",
  SESSION_EXPIRED: "Session expired. Sign in again.",
  PERMISSION_DENIED: "You don’t have permission to restore add-ons.",
  VALIDATION_FAILED: "The restore request was rejected. Refresh Menu and review the add-on.",
  RESTORE_CONFLICT: "This add-on may already be restored. Refresh Menu and check Menu Archive.",
  REFRESH_FAILED: "Add-on restored. Couldn’t refresh Menu data.",
  ADDON_RESTORED: "Add-on restored successfully",
};

export const RESTORE_INLINE_ERRORS = {
  SAVE_FAILED: { type: "critical", message: RESTORE_FEEDBACK.SAVE_FAILED },
  SAVE_UNCONFIRMED: { type: "critical", message: RESTORE_FEEDBACK.SAVE_UNCONFIRMED },
  RATE_LIMITED: { type: "critical", message: RESTORE_FEEDBACK.RATE_LIMITED },
  SESSION_EXPIRED: { type: "critical", message: RESTORE_FEEDBACK.SESSION_EXPIRED },
  PERMISSION_DENIED: { type: "critical", message: RESTORE_FEEDBACK.PERMISSION_DENIED },
  VALIDATION_FAILED: { type: "critical", message: RESTORE_FEEDBACK.VALIDATION_FAILED },
  RESTORE_CONFLICT: { type: "critical", message: RESTORE_FEEDBACK.RESTORE_CONFLICT },
  REFRESH_FAILED: { type: "critical", message: RESTORE_FEEDBACK.REFRESH_FAILED },
};

export const getRestoreInlineFeedback = (code) => {
  const definition = RESTORE_INLINE_ERRORS[code];
  if (!definition) return null;
  return resolveErrorFeedback({ code, ...definition, showCode: true });
};

export const RESTORE_STATUS_FEEDBACK = {
  ADDON_RESTORING: {
    type: "loading", display: "status", tone: "info",
    title: "Restoring add-on…", message: "Please wait while the add-on is restored.",
  },
  MENU_REFRESHING: {
    type: "loading", display: "status", tone: "info",
    title: "Refreshing data…", message: "Add-on restored. Updating Menu.",
  },
  MENU_REFRESH_FAILED: {
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
  ADDON_RESTORED: {
    type: "notification", toastType: "success", display: "toast",
    title: RESTORE_FEEDBACK.ADDON_RESTORED,
  },
};

export const getRestoreToastFeedback = (code, details = {}) => {
  const definition = RESTORE_TOAST_FEEDBACK[code];
  if (!definition) return null;
  const resolved = resolveErrorFeedback(definition);
  const caption = " has been restored to your add-on list. Review its availability before selling.";
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

export const getRestoreAddonErrorCode = (error) => {
  if (!error || !error.response) return "SAVE_UNCONFIRMED";
  const status = error.response.status;
  if (status === 401) return "SESSION_EXPIRED";
  if (status === 403) return "PERMISSION_DENIED";
  if (status === 404 || status === 409) return "RESTORE_CONFLICT";
  if (status === 422) return "VALIDATION_FAILED";
  if (status === 429) return "RATE_LIMITED";
  if (!status || status >= 500) return "SAVE_UNCONFIRMED";
  return "SAVE_FAILED";
};
