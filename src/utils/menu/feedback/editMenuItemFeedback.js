import { resolveErrorFeedback } from "@/utils/feedback/errorFeedback";

export const EDIT_MENU_ITEM_FEEDBACK = {
  UPLOAD_FAILED: "Image could not upload. Try again.",
  SAVE_FAILED: "Could not save changes. Try again.",
  SAVE_UNCONFIRMED: "Could not confirm the update. Close and refresh Menu before trying again.",
  SESSION_EXPIRED: "Session expired. Sign in again.",
  PERMISSION_DENIED: "You do not have permission to edit this item.",
  VALIDATION_FAILED: "Review the item details and try again.",
  RECORD_CONFLICT: "This item may have changed. Close and refresh Menu.",
  RATE_LIMITED: "Please wait before trying again.",
  REFRESH_FAILED: "Changes saved, but the latest menu could not refresh.",
};
export const EDIT_MENU_ITEM_INLINE_ERRORS = {
  UPLOAD_FAILED: { type: "critical", message: EDIT_MENU_ITEM_FEEDBACK.UPLOAD_FAILED },
  SAVE_FAILED: { type: "critical", message: EDIT_MENU_ITEM_FEEDBACK.SAVE_FAILED },
  SAVE_UNCONFIRMED: { type: "critical", message: EDIT_MENU_ITEM_FEEDBACK.SAVE_UNCONFIRMED },
  SESSION_EXPIRED: { type: "critical", message: EDIT_MENU_ITEM_FEEDBACK.SESSION_EXPIRED },
  PERMISSION_DENIED: { type: "critical", message: EDIT_MENU_ITEM_FEEDBACK.PERMISSION_DENIED },
  VALIDATION_FAILED: { type: "validation", message: EDIT_MENU_ITEM_FEEDBACK.VALIDATION_FAILED },
  RECORD_CONFLICT: { type: "critical", message: EDIT_MENU_ITEM_FEEDBACK.RECORD_CONFLICT },
  RATE_LIMITED: { type: "critical", message: EDIT_MENU_ITEM_FEEDBACK.RATE_LIMITED },
};
export const getEditMenuItemInlineFeedback = (code) => {
  const definition = EDIT_MENU_ITEM_INLINE_ERRORS[code];
  if (!definition) return null;
  return resolveErrorFeedback({ code, ...definition, showCode: true });
};
export const EDIT_MENU_ITEM_STATUS_FEEDBACK = {
  ITEM_SAVING: { type: "loading", display: "status", tone: "info", title: "Saving changes...", message: "Please wait while the item is updated." },
  MENU_REFRESHING: { type: "loading", display: "status", tone: "info", title: "Refreshing menu...", message: "Changes saved. Updating the latest menu." },
  MENU_REFRESH_FAILED: { type: "critical", display: "status", tone: "error", title: "Menu could not refresh", message: EDIT_MENU_ITEM_FEEDBACK.REFRESH_FAILED, buttonLabel: "Retry refresh" },
};
export const getEditMenuItemStatusFeedback = (code) => {
  const definition = EDIT_MENU_ITEM_STATUS_FEEDBACK[code];
  if (!definition) return null;
  return resolveErrorFeedback({ code, ...definition });
};
export const EDIT_MENU_ITEM_TOAST_FEEDBACK = {
  ITEM_UPDATED: { type: "notification", display: "toast", toastType: "success", title: "Menu item updated successfully" },
};
// Feedback owns the wording; the comparison helper only reports changes.
const getEditMenuItemSummary = (changes) => {
  const summary = [];
  if (changes.availabilityChanged) {
    if (changes.isAvailable) summary.push("Available for Sale enabled");
    else summary.push("Available for Sale disabled");
  }
  if (changes.pricesUpdated) summary.push("selling price updated");
  if (changes.namesUpdated) summary.push("variant names updated");
  if (changes.variantAvailabilityUpdated) summary.push("variant availability updated");
  if (changes.recipesUpdated) summary.push("recipe updated");
  if (changes.imageUpdated) summary.push("image updated");

  const variantActions = [
    { count: changes.variantsAdded, action: "added" },
    { count: changes.variantsArchived, action: "archived" },
    { count: changes.variantsRestored, action: "restored" },
  ];
  variantActions.forEach(({ count, action }) => {
    if (!count) return;
    let noun = "variant";
    if (count > 1) noun = "variants";
    summary.push(`${count} ${noun} ${action}`);
  });

  if (summary.length === 0) return "details saved";
  return summary.join(", ");
};

export const getEditMenuItemToastFeedback = (itemName, changes = {}) => {
  const resolved = resolveErrorFeedback(EDIT_MENU_ITEM_TOAST_FEEDBACK.ITEM_UPDATED);
  const caption = `: ${getEditMenuItemSummary(changes)}.`;
  return {
    type: resolved.toastType, title: resolved.title, timeout: resolved.duration,
    description: `${itemName}${caption}`,
    data: { descriptionParts: [{ label: itemName }, { text: caption }] },
  };
};
export const getEditMenuItemErrorCode = (error) => {
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
