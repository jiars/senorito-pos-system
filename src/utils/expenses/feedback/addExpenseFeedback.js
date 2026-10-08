import { resolveErrorFeedback } from "@/utils/feedback/errorFeedback";
import { formatCurrency } from "@/utils/shared/formatters/currencyFormatters";

export const ADD_EXPENSE_FEEDBACK = {
  SAVE_FAILED: "Could not save the expense. Please try again.",
  SAVE_UNCONFIRMED: "Could not confirm the save. Close and refresh Expense and Inventory before trying again.",
  SESSION_EXPIRED: "Session expired. Sign in again.",
  PERMISSION_DENIED: "You do not have permission to record this expense.",
  VALIDATION_FAILED: "Review the expense details and try again.",
  RECORD_CONFLICT: "The selected record changed. Close and refresh before trying again.",
  RATE_LIMITED: "Please wait before trying again.",
  REFRESH_FAILED: "Expense saved, but required data could not refresh.",
};

export const ADD_EXPENSE_INLINE_ERRORS = {
  SAVE_FAILED: { type: "critical", message: ADD_EXPENSE_FEEDBACK.SAVE_FAILED },
  SAVE_UNCONFIRMED: { type: "critical", message: ADD_EXPENSE_FEEDBACK.SAVE_UNCONFIRMED },
  SESSION_EXPIRED: { type: "critical", message: ADD_EXPENSE_FEEDBACK.SESSION_EXPIRED },
  PERMISSION_DENIED: { type: "critical", message: ADD_EXPENSE_FEEDBACK.PERMISSION_DENIED },
  VALIDATION_FAILED: { type: "validation", message: ADD_EXPENSE_FEEDBACK.VALIDATION_FAILED },
  RECORD_CONFLICT: { type: "critical", message: ADD_EXPENSE_FEEDBACK.RECORD_CONFLICT },
  RATE_LIMITED: { type: "critical", message: ADD_EXPENSE_FEEDBACK.RATE_LIMITED },
};
export const getAddExpenseInlineFeedback = (code) => {
  const definition = ADD_EXPENSE_INLINE_ERRORS[code];
  if (!definition) return null;
  return resolveErrorFeedback({ code, ...definition, showCode: true });
};

export const ADD_EXPENSE_STATUS_FEEDBACK = {
  EXPENSE_SAVING: {
    type: "loading", display: "status", tone: "info",
    title: "Saving expense...", message: "Please wait while the expense is recorded.",
  },
  EXPENSES_REFRESHING: {
    type: "loading", display: "status", tone: "info",
    title: "Refreshing data...", message: "Expense saved. Updating the latest records.",
  },
  EXPENSES_REFRESH_FAILED: {
    type: "critical", display: "status", tone: "error",
    title: "Data could not refresh", message: ADD_EXPENSE_FEEDBACK.REFRESH_FAILED,
    buttonLabel: "Retry refresh",
  },
};
export const getAddExpenseStatusFeedback = (code) => {
  const definition = ADD_EXPENSE_STATUS_FEEDBACK[code];
  if (!definition) return null;
  return resolveErrorFeedback({ code, ...definition });
};

export const ADD_EXPENSE_TOAST_FEEDBACK = {
  EXPENSE_SAVED: { type: "notification", display: "toast", toastType: "success", title: "Expense added successfully" },
  PURCHASE_SAVED: { type: "notification", display: "toast", toastType: "success", title: "Inventory purchase recorded" },
};
export const getAddExpenseToastFeedback = (code, details) => {
  const definition = ADD_EXPENSE_TOAST_FEEDBACK[code];
  if (!definition) return null;
  const resolved = resolveErrorFeedback(definition);
  let parts = [{ label: details.description }, { text: " has been recorded.\n" }];
  if (code === "PURCHASE_SAVED") {
    parts = [{ text: `Added ${details.quantity} ${details.unit} to ` }, { label: details.itemName }, { text: ".\n" }];
  }
  parts.push({ label: "Amount:" }, { text: ` ${formatCurrency(details.amount)}` });
  return {
    type: resolved.toastType, title: resolved.title, timeout: resolved.duration,
    description: parts.map((part) => part.label || part.text).join(""),
    data: { descriptionParts: parts },
  };
};
export const getAddExpenseErrorCode = (error) => {
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
