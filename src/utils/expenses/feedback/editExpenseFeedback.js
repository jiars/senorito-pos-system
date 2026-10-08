import { resolveErrorFeedback } from "@/utils/feedback/errorFeedback";

export const EDIT_EXPENSE_FEEDBACK = {
  SAVE_FAILED: "Could not save changes. Please try again.",
  SAVE_UNCONFIRMED: "Could not confirm the update. Close and refresh Expenses before trying again.",
  SESSION_EXPIRED: "Session expired. Sign in again.",
  PERMISSION_DENIED: "You do not have permission to edit this expense.",
  VALIDATION_FAILED: "Review the expense details and try again.",
  RECORD_CONFLICT: "This expense may have changed or been archived. Close and refresh Expenses.",
  RATE_LIMITED: "Please wait before trying again.",
  REFRESH_FAILED: "Changes saved, but the latest records could not refresh.",
};

export const EDIT_EXPENSE_INLINE_ERRORS = {
  SAVE_FAILED: { type: "critical", message: EDIT_EXPENSE_FEEDBACK.SAVE_FAILED },
  SAVE_UNCONFIRMED: { type: "critical", message: EDIT_EXPENSE_FEEDBACK.SAVE_UNCONFIRMED },
  SESSION_EXPIRED: { type: "critical", message: EDIT_EXPENSE_FEEDBACK.SESSION_EXPIRED },
  PERMISSION_DENIED: { type: "critical", message: EDIT_EXPENSE_FEEDBACK.PERMISSION_DENIED },
  VALIDATION_FAILED: { type: "validation", message: EDIT_EXPENSE_FEEDBACK.VALIDATION_FAILED },
  RECORD_CONFLICT: { type: "critical", message: EDIT_EXPENSE_FEEDBACK.RECORD_CONFLICT },
  RATE_LIMITED: { type: "critical", message: EDIT_EXPENSE_FEEDBACK.RATE_LIMITED },
};
export const getEditExpenseInlineFeedback = (code) => {
  const definition = EDIT_EXPENSE_INLINE_ERRORS[code];
  if (!definition) return null;
  return resolveErrorFeedback({ code, ...definition, showCode: true });
};

export const EDIT_EXPENSE_STATUS_FEEDBACK = {
  EXPENSE_SAVING: { type: "loading", display: "status", tone: "info", title: "Saving changes...", message: "Please wait while the expense is updated." },
  EXPENSES_REFRESHING: { type: "loading", display: "status", tone: "info", title: "Refreshing data...", message: "Changes saved. Updating the latest records." },
  EXPENSES_REFRESH_FAILED: { type: "critical", display: "status", tone: "error", title: "Data could not refresh", message: EDIT_EXPENSE_FEEDBACK.REFRESH_FAILED, buttonLabel: "Retry refresh" },
};
export const getEditExpenseStatusFeedback = (code) => {
  const definition = EDIT_EXPENSE_STATUS_FEEDBACK[code];
  if (!definition) return null;
  return resolveErrorFeedback({ code, ...definition });
};

export const EDIT_EXPENSE_TOAST_FEEDBACK = {
  EXPENSE_UPDATED: { type: "notification", display: "toast", toastType: "success", title: "Expense updated successfully" },
};
export const getEditExpenseToastFeedback = (description) => {
  const resolved = resolveErrorFeedback(EDIT_EXPENSE_TOAST_FEEDBACK.EXPENSE_UPDATED);
  const parts = [{ label: description }, { text: " has been updated." }];
  return {
    type: resolved.toastType, title: resolved.title, timeout: resolved.duration,
    description: `${description} has been updated.`, data: { descriptionParts: parts },
  };
};
export const getEditExpenseErrorCode = (error) => {
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
