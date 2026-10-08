import { resolveErrorFeedback } from "@/utils/feedback/errorFeedback";

export const ARCHIVE_EXPENSE_FEEDBACK = {
  ARCHIVE_FAILED: "Could not archive the expense. Please try again.",
  ARCHIVE_UNCONFIRMED: "Could not confirm the archive. Close and refresh Expenses before trying again.",
  SESSION_EXPIRED: "Session expired. Sign in again.",
  PERMISSION_DENIED: "You do not have permission to archive this expense.",
  RECORD_CONFLICT: "The expense may have changed. Close and refresh Expenses.",
  VALIDATION_FAILED: "The expense could not be archived. Close and review the record.",
  RATE_LIMITED: "Please wait before trying again.",
  REFRESH_FAILED: "Expense archived, but the latest records could not refresh.",
};
export const ARCHIVE_EXPENSE_INLINE_ERRORS = {
  ARCHIVE_FAILED: { type: "critical", message: ARCHIVE_EXPENSE_FEEDBACK.ARCHIVE_FAILED },
  ARCHIVE_UNCONFIRMED: { type: "critical", message: ARCHIVE_EXPENSE_FEEDBACK.ARCHIVE_UNCONFIRMED },
  SESSION_EXPIRED: { type: "critical", message: ARCHIVE_EXPENSE_FEEDBACK.SESSION_EXPIRED },
  PERMISSION_DENIED: { type: "critical", message: ARCHIVE_EXPENSE_FEEDBACK.PERMISSION_DENIED },
  RECORD_CONFLICT: { type: "critical", message: ARCHIVE_EXPENSE_FEEDBACK.RECORD_CONFLICT },
  VALIDATION_FAILED: { type: "critical", message: ARCHIVE_EXPENSE_FEEDBACK.VALIDATION_FAILED },
  RATE_LIMITED: { type: "critical", message: ARCHIVE_EXPENSE_FEEDBACK.RATE_LIMITED },
};
export const getArchiveExpenseInlineFeedback = (code) => {
  const definition = ARCHIVE_EXPENSE_INLINE_ERRORS[code];
  if (!definition) return null;
  return resolveErrorFeedback({ code, ...definition, showCode: true });
};
export const ARCHIVE_EXPENSE_STATUS_FEEDBACK = {
  EXPENSE_ARCHIVING: { type: "loading", display: "status", tone: "info", title: "Archiving expense...", message: "Please wait while the record is archived." },
  EXPENSES_REFRESHING: { type: "loading", display: "status", tone: "info", title: "Refreshing data...", message: "Expense archived. Updating the latest records." },
  EXPENSES_REFRESH_FAILED: { type: "critical", display: "status", tone: "error", title: "Data could not refresh", message: ARCHIVE_EXPENSE_FEEDBACK.REFRESH_FAILED, buttonLabel: "Retry refresh" },
};
export const getArchiveExpenseStatusFeedback = (code) => {
  const definition = ARCHIVE_EXPENSE_STATUS_FEEDBACK[code];
  if (!definition) return null;
  return resolveErrorFeedback({ code, ...definition });
};
export const ARCHIVE_EXPENSE_TOAST_FEEDBACK = {
  EXPENSE_ARCHIVED: { type: "notification", display: "toast", toastType: "success", title: "Expense archived successfully" },
};
export const getArchiveExpenseToastFeedback = (description) => {
  const resolved = resolveErrorFeedback(ARCHIVE_EXPENSE_TOAST_FEEDBACK.EXPENSE_ARCHIVED);
  const parts = [{ label: description }, { text: " has been moved to the archive." }];
  return {
    type: resolved.toastType, title: resolved.title, timeout: resolved.duration,
    description: `${description} has been moved to the archive.`, data: { descriptionParts: parts },
  };
};
export const getArchiveExpenseErrorCode = (error) => {
  if (!error || !error.response) return "ARCHIVE_UNCONFIRMED";
  const status = error.response.status;
  if (status === 401) return "SESSION_EXPIRED";
  if (status === 403) return "PERMISSION_DENIED";
  if (status === 404 || status === 409) return "RECORD_CONFLICT";
  if (status === 422) return "VALIDATION_FAILED";
  if (status === 429) return "RATE_LIMITED";
  if (!status || status >= 500) return "ARCHIVE_UNCONFIRMED";
  return "ARCHIVE_FAILED";
};
