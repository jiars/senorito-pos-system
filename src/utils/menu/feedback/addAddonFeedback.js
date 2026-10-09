import { resolveErrorFeedback } from "@/utils/feedback/errorFeedback";

export const ADD_ADDON_FEEDBACK = {
  SAVE_FAILED: "Could not add the add-on. Try again.",
  SAVE_UNCONFIRMED: "Could not confirm the save. Close and refresh Menu before trying again.",
  SESSION_EXPIRED: "Session expired. Sign in again.",
  PERMISSION_DENIED: "You do not have permission to add add-ons.",
  VALIDATION_FAILED: "Review the add-on details and try again.",
  RECORD_CONFLICT: "Menu data may have changed. Close and refresh Menu.",
  RATE_LIMITED: "Please wait before trying again.",
  REFRESH_FAILED: "Add-on saved, but the latest records could not refresh.",
};
export const ADD_ADDON_INLINE_ERRORS = {
  SAVE_FAILED: { type: "critical", message: ADD_ADDON_FEEDBACK.SAVE_FAILED },
  SAVE_UNCONFIRMED: { type: "critical", message: ADD_ADDON_FEEDBACK.SAVE_UNCONFIRMED },
  SESSION_EXPIRED: { type: "critical", message: ADD_ADDON_FEEDBACK.SESSION_EXPIRED },
  PERMISSION_DENIED: { type: "critical", message: ADD_ADDON_FEEDBACK.PERMISSION_DENIED },
  VALIDATION_FAILED: { type: "validation", message: ADD_ADDON_FEEDBACK.VALIDATION_FAILED },
  RECORD_CONFLICT: { type: "critical", message: ADD_ADDON_FEEDBACK.RECORD_CONFLICT },
  RATE_LIMITED: { type: "critical", message: ADD_ADDON_FEEDBACK.RATE_LIMITED },
};
export const getAddAddonInlineFeedback = (code) => {
  const definition = ADD_ADDON_INLINE_ERRORS[code];
  if (!definition) return null;
  return resolveErrorFeedback({ code, ...definition, showCode: true });
};
export const ADD_ADDON_STATUS_FEEDBACK = {
  ADDON_SAVING: { type: "loading", display: "status", tone: "info", title: "Adding add-on...", message: "Please wait while the add-on is saved." },
  MENU_REFRESHING: { type: "loading", display: "status", tone: "info", title: "Refreshing menu...", message: "Add-on saved. Updating the latest records." },
  MENU_REFRESH_FAILED: { type: "critical", display: "status", tone: "error", title: "Menu could not refresh", message: ADD_ADDON_FEEDBACK.REFRESH_FAILED, buttonLabel: "Retry refresh" },
};
export const getAddAddonStatusFeedback = (code) => {
  const definition = ADD_ADDON_STATUS_FEEDBACK[code];
  if (!definition) return null;
  return resolveErrorFeedback({ code, ...definition });
};
export const ADD_ADDON_TOAST_FEEDBACK = {
  ADDON_ADDED: { type: "notification", display: "toast", toastType: "success", title: "Add-on added successfully" },
};
export const getAddAddonToastFeedback = (addonName) => {
  const resolved = resolveErrorFeedback(ADD_ADDON_TOAST_FEEDBACK.ADDON_ADDED);
  return {
    type: resolved.toastType, title: resolved.title, timeout: resolved.duration,
    description: `${addonName} has been added to your add-on list.`,
    data: { descriptionParts: [{ label: addonName }, { text: " has been added to your add-on list." }] },
  };
};
export const getAddAddonErrorCode = (error) => {
  if (!error || !error.response) return "SAVE_UNCONFIRMED";
  const status = error.response.status;
  if (status === 401) return "SESSION_EXPIRED";
  if (status === 403) return "PERMISSION_DENIED";
  if (status === 404 || status === 409) return "RECORD_CONFLICT";
  if (status === 422) return "VALIDATION_FAILED";
  if (status === 429) return "RATE_LIMITED";
  if (!status || status >= 500) return "SAVE_UNCONFIRMED";
  return "SAVE_FAILED";
};
