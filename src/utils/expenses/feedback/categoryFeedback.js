import { resolveErrorFeedback } from "@/utils/feedback/errorFeedback";

// Operation feedback only. Field rules/messages belong to categoryValidation.js.
export const CATEGORY_FEEDBACK = {
  SAVE_FAILED: "Couldn’t save the category change. Please try again.",
  REFRESH_FAILED: "Change saved. Couldn’t refresh categories.",
  SESSION_EXPIRED: "Session expired. Sign in again.",
  PERMISSION_DENIED: "You don’t have permission to manage categories.",
  VALIDATION_FAILED: "Some details were rejected. Review your inputs.",
  SAVE_UNCONFIRMED: "Couldn’t confirm the save. Check categories before trying again.",
  CATEGORY_IN_USE: "This category is used by an expense and cannot be deleted.",
  RECORD_CONFLICT: "The category may have changed. Close and refresh Expenses.",
  RATE_LIMITED: "Please wait before trying again.",
  CATEGORY_ADDED: "Category added successfully",
  CATEGORY_UPDATED: "Category updated successfully",
  CATEGORY_DELETED: "Category deleted successfully",
};

export const CATEGORY_INLINE_ERRORS = {
  SAVE_FAILED: { type: "critical", message: CATEGORY_FEEDBACK.SAVE_FAILED },
  REFRESH_FAILED: { type: "critical", message: CATEGORY_FEEDBACK.REFRESH_FAILED },
  SESSION_EXPIRED: { type: "critical", message: CATEGORY_FEEDBACK.SESSION_EXPIRED },
  PERMISSION_DENIED: { type: "critical", message: CATEGORY_FEEDBACK.PERMISSION_DENIED },
  VALIDATION_FAILED: { type: "validation", message: CATEGORY_FEEDBACK.VALIDATION_FAILED },
  SAVE_UNCONFIRMED: { type: "critical", message: CATEGORY_FEEDBACK.SAVE_UNCONFIRMED },
  CATEGORY_IN_USE: { type: "critical", message: CATEGORY_FEEDBACK.CATEGORY_IN_USE },
  RECORD_CONFLICT: { type: "critical", message: CATEGORY_FEEDBACK.RECORD_CONFLICT },
  RATE_LIMITED: { type: "critical", message: CATEGORY_FEEDBACK.RATE_LIMITED },
};

export const getCategoryInlineFeedback = (code) => {
  const definition = CATEGORY_INLINE_ERRORS[code];
  if (!definition) return null;
  return resolveErrorFeedback({ code, ...definition, showCode: true });
};

export const getExpenseCategoryErrorCode = (error) => {
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

export const CATEGORY_STATUS_FEEDBACK = {
  CATEGORY_SAVING: {
    type: "loading", display: "status", tone: "info",
    title: "Saving category…", message: "Please wait while the change is saved.",
  },
  EXPENSES_REFRESHING: {
    type: "loading", display: "status", tone: "info",
    title: "Refreshing categories…", message: "Change saved. Updating expenses.",
  },
  EXPENSES_REFRESH_FAILED: {
    type: "critical", display: "status", tone: "error",
    title: "Categories could not refresh", message: CATEGORY_FEEDBACK.REFRESH_FAILED,
    buttonLabel: "Retry refresh",
  },
};

export const getCategoryStatusFeedback = (code) => {
  const definition = CATEGORY_STATUS_FEEDBACK[code];
  if (!definition) return null;
  return resolveErrorFeedback({ code, ...definition });
};

export const CATEGORY_TOAST_FEEDBACK = {
  CATEGORY_ADDED: {
    type: "notification", toastType: "success", display: "toast",
    title: CATEGORY_FEEDBACK.CATEGORY_ADDED,
    caption: " is now available in your expense categories.",
  },
  CATEGORY_UPDATED: {
    type: "notification", toastType: "success", display: "toast",
    title: CATEGORY_FEEDBACK.CATEGORY_UPDATED,
    caption: " has been updated in your expense categories.",
  },
  CATEGORY_DELETED: {
    type: "notification", toastType: "success", display: "toast",
    title: CATEGORY_FEEDBACK.CATEGORY_DELETED,
    caption: " has been removed from your expense categories.",
  },
};

export const getCategoryToastFeedback = (code, details = {}) => {
  const definition = CATEGORY_TOAST_FEEDBACK[code];
  if (!definition) return null;
  const resolved = resolveErrorFeedback(definition);
  return {
    type: resolved.toastType,
    title: resolved.title,
    description: `${details.categoryName}${definition.caption}`,
    timeout: resolved.duration,
    data: {
      width: details.width,
      descriptionParts: [
        { label: details.categoryName },
        { text: definition.caption },
      ],
    },
  };
};
