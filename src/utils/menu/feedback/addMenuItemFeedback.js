import { resolveErrorFeedback } from "@/utils/feedback/errorFeedback";

export const ADD_MENU_ITEM_FEEDBACK = {
  UPLOAD_FAILED: "Image could not upload. Try again.",
  SAVE_FAILED: "Could not add the item. Try again.",
  SAVE_UNCONFIRMED: "Could not confirm the save. Close and refresh Menu before trying again.",
  SESSION_EXPIRED: "Session expired. Sign in again.",
  PERMISSION_DENIED: "You do not have permission to add menu items.",
  VALIDATION_FAILED: "Review the item details and try again.",
  RECORD_CONFLICT: "Menu data may have changed. Close and refresh Menu.",
  RATE_LIMITED: "Please wait before trying again.",
  REFRESH_FAILED: "Item saved, but the latest menu could not refresh.",
};

export const ADD_MENU_ITEM_INLINE_ERRORS = {
  UPLOAD_FAILED: { type: "critical", message: ADD_MENU_ITEM_FEEDBACK.UPLOAD_FAILED },
  SAVE_FAILED: { type: "critical", message: ADD_MENU_ITEM_FEEDBACK.SAVE_FAILED },
  SAVE_UNCONFIRMED: { type: "critical", message: ADD_MENU_ITEM_FEEDBACK.SAVE_UNCONFIRMED },
  SESSION_EXPIRED: { type: "critical", message: ADD_MENU_ITEM_FEEDBACK.SESSION_EXPIRED },
  PERMISSION_DENIED: { type: "critical", message: ADD_MENU_ITEM_FEEDBACK.PERMISSION_DENIED },
  VALIDATION_FAILED: { type: "validation", message: ADD_MENU_ITEM_FEEDBACK.VALIDATION_FAILED },
  RECORD_CONFLICT: { type: "critical", message: ADD_MENU_ITEM_FEEDBACK.RECORD_CONFLICT },
  RATE_LIMITED: { type: "critical", message: ADD_MENU_ITEM_FEEDBACK.RATE_LIMITED },
};
export const getAddMenuItemInlineFeedback = (code) => {
  const definition = ADD_MENU_ITEM_INLINE_ERRORS[code];
  if (!definition) return null;
  return resolveErrorFeedback({ code, ...definition, showCode: true });
};
export const ADD_MENU_ITEM_STATUS_FEEDBACK = {
  ITEM_SAVING: { type: "loading", display: "status", tone: "info", title: "Adding menu item...", message: "Please wait while the item is saved." },
  MENU_REFRESHING: { type: "loading", display: "status", tone: "info", title: "Refreshing menu...", message: "Item saved. Updating the latest menu." },
  MENU_REFRESH_FAILED: { type: "critical", display: "status", tone: "error", title: "Menu could not refresh", message: ADD_MENU_ITEM_FEEDBACK.REFRESH_FAILED, buttonLabel: "Retry refresh" },
};
export const getAddMenuItemStatusFeedback = (code) => {
  const definition = ADD_MENU_ITEM_STATUS_FEEDBACK[code];
  if (!definition) return null;
  return resolveErrorFeedback({ code, ...definition });
};
export const ADD_MENU_ITEM_TOAST_FEEDBACK = {
  ITEM_ADDED: { type: "notification", display: "toast", toastType: "success", title: "Menu item added successfully" },
};
export const getAddMenuItemToastFeedback = (itemName) => {
  const resolved = resolveErrorFeedback(ADD_MENU_ITEM_TOAST_FEEDBACK.ITEM_ADDED);
  return {
    type: resolved.toastType, title: resolved.title, timeout: resolved.duration,
    description: `${itemName} is now in your menu.`,
    data: { descriptionParts: [{ label: itemName }, { text: " is now in your menu." }] },
  };
};
export const getAddMenuItemErrorCode = (error) => {
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
