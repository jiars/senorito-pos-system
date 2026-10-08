import { resolveErrorFeedback } from "@/utils/feedback/errorFeedback";

export const RESTORE_EXPENSE_FEEDBACK = {
  RESTORE_FAILED: "Could not restore the expense. Please try again.",
  RESTORE_UNCONFIRMED: "Could not confirm the restore. Close and refresh Expenses before trying again.",
  SESSION_EXPIRED: "Session expired. Sign in again.",
  PERMISSION_DENIED: "You do not have permission to restore this expense.",
  RECORD_CONFLICT: "The expense may have changed. Close and refresh Expenses.",
  VALIDATION_FAILED: "The expense could not be restored. Close and review the record.",
  RATE_LIMITED: "Please wait before trying again.",
  REFRESH_FAILED: "Expense restored, but the latest records could not refresh.",
};
export const RESTORE_EXPENSE_INLINE_ERRORS = {
  RESTORE_FAILED: { type: "critical", message: RESTORE_EXPENSE_FEEDBACK.RESTORE_FAILED },
  RESTORE_UNCONFIRMED: { type: "critical", message: RESTORE_EXPENSE_FEEDBACK.RESTORE_UNCONFIRMED },
  SESSION_EXPIRED: { type: "critical", message: RESTORE_EXPENSE_FEEDBACK.SESSION_EXPIRED },
  PERMISSION_DENIED: { type: "critical", message: RESTORE_EXPENSE_FEEDBACK.PERMISSION_DENIED },
  RECORD_CONFLICT: { type: "critical", message: RESTORE_EXPENSE_FEEDBACK.RECORD_CONFLICT },
  VALIDATION_FAILED: { type: "critical", message: RESTORE_EXPENSE_FEEDBACK.VALIDATION_FAILED },
  RATE_LIMITED: { type: "critical", message: RESTORE_EXPENSE_FEEDBACK.RATE_LIMITED },
};
export const getRestoreExpenseInlineFeedback = (code) => {
  const definition = RESTORE_EXPENSE_INLINE_ERRORS[code];
  if (!definition) return null;
  return resolveErrorFeedback({ code, ...definition, showCode: true });
};
export const RESTORE_EXPENSE_STATUS_FEEDBACK = {
  EXPENSE_RESTORING: { type: "loading", display: "status", tone: "info", title: "Restoring expense...", message: "Please wait while the record is restored." },
  EXPENSES_REFRESHING: { type: "loading", display: "status", tone: "info", title: "Refreshing data...", message: "Expense restored. Updating the latest records." },
  EXPENSES_REFRESH_FAILED: { type: "critical", display: "status", tone: "error", title: "Data could not refresh", message: RESTORE_EXPENSE_FEEDBACK.REFRESH_FAILED, buttonLabel: "Retry refresh" },
};
export const getRestoreExpenseStatusFeedback = (code) => {
  const definition = RESTORE_EXPENSE_STATUS_FEEDBACK[code];
  if (!definition) return null;
  return resolveErrorFeedback({ code, ...definition });
};
export const RESTORE_EXPENSE_TOAST_FEEDBACK = {
  EXPENSE_RESTORED: { type: "notification", display: "toast", toastType: "success", title: "Expense restored successfully" },
};
export const getRestoreExpenseToastFeedback = (description) => {
  const resolved = resolveErrorFeedback(RESTORE_EXPENSE_TOAST_FEEDBACK.EXPENSE_RESTORED);
  const parts = [{ label: description }, { text: " has been restored to the active expense list." }];
  return {
    type: resolved.toastType, title: resolved.title, timeout: resolved.duration,
    description: `${description} has been restored to the active expense list.`, data: { descriptionParts: parts },
  };
};
export const getRestoreExpenseErrorCode = (error) => {
  if (!error || !error.response) return "RESTORE_UNCONFIRMED";
  const status = error.response.status;
  if (status === 401) return "SESSION_EXPIRED";
  if (status === 403) return "PERMISSION_DENIED";
  if (status === 404 || status === 409) return "RECORD_CONFLICT";
  if (status === 422) return "VALIDATION_FAILED";
  if (status === 429) return "RATE_LIMITED";
  if (!status || status >= 500) return "RESTORE_UNCONFIRMED";
  return "RESTORE_FAILED";
};
