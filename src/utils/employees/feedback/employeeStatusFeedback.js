import { resolveErrorFeedback } from "@/utils/feedback/errorFeedback";

export const EMPLOYEE_STATUS_FEEDBACK = {
  SAVE_FAILED: "Couldn’t update the account status. Please try again.",
  SESSION_EXPIRED: "Session expired. Sign in again.",
  PERMISSION_DENIED: "You don’t have permission to change this account’s status.",
  VALIDATION_FAILED: "This account status change was rejected. Review the employee.",
  STATUS_CONFLICT: "Account status has changed. Check the employee before trying again.",
  SAVE_UNCONFIRMED: "Couldn’t confirm the status change. Check the employee before trying again.",
  REFRESH_FAILED: "Account status updated. Couldn’t refresh the employee list.",
};

export const EMPLOYEE_STATUS_INLINE_ERRORS = {
  SAVE_FAILED: { type: "critical", message: EMPLOYEE_STATUS_FEEDBACK.SAVE_FAILED },
  SESSION_EXPIRED: { type: "critical", message: EMPLOYEE_STATUS_FEEDBACK.SESSION_EXPIRED },
  PERMISSION_DENIED: { type: "critical", message: EMPLOYEE_STATUS_FEEDBACK.PERMISSION_DENIED },
  VALIDATION_FAILED: { type: "validation", message: EMPLOYEE_STATUS_FEEDBACK.VALIDATION_FAILED },
  STATUS_CONFLICT: { type: "critical", message: EMPLOYEE_STATUS_FEEDBACK.STATUS_CONFLICT },
  SAVE_UNCONFIRMED: { type: "critical", message: EMPLOYEE_STATUS_FEEDBACK.SAVE_UNCONFIRMED },
};

export const getEmployeeStatusInlineFeedback = (code) => {
  const definition = EMPLOYEE_STATUS_INLINE_ERRORS[code];
  if (!definition) return null;
  return resolveErrorFeedback({ code, ...definition, showCode: true });
};

export const EMPLOYEE_STATUS_LOADING_FEEDBACK = {
  DEACTIVATING: {
    type: "loading", display: "status", tone: "info",
    title: "Deactivating account…", message: "Please wait while the account status is updated.",
  },
  REACTIVATING: {
    type: "loading", display: "status", tone: "info",
    title: "Reactivating account…", message: "Please wait while the account status is updated.",
  },
  EMPLOYEES_REFRESHING: {
    type: "loading", display: "status", tone: "info",
    title: "Refreshing employees…", message: "Status updated. Refreshing the employee list.",
  },
  EMPLOYEES_REFRESH_FAILED: {
    type: "critical", display: "status", tone: "error",
    title: "Employee list could not refresh", message: EMPLOYEE_STATUS_FEEDBACK.REFRESH_FAILED,
    buttonLabel: "Retry refresh",
  },
};

export const getEmployeeStatusLoadingFeedback = (code) => {
  const definition = EMPLOYEE_STATUS_LOADING_FEEDBACK[code];
  if (!definition) return null;
  return resolveErrorFeedback({ code, ...definition });
};

export const EMPLOYEE_STATUS_TOAST_FEEDBACK = {
  EMPLOYEE_DEACTIVATED: {
    type: "notification", display: "toast", toastType: "success", title: "Account deactivated successfully",
  },
  EMPLOYEE_REACTIVATED: {
    type: "notification", display: "toast", toastType: "success", title: "Account reactivated successfully",
  },
};

export const getEmployeeStatusToastFeedback = (code, details = {}) => {
  const definition = EMPLOYEE_STATUS_TOAST_FEEDBACK[code];
  if (!definition) return null;
  const resolved = resolveErrorFeedback(definition);
  let caption = "’s account has been reactivated.";
  if (code === "EMPLOYEE_DEACTIVATED") caption = "’s account has been deactivated.";
  return {
    type: resolved.toastType,
    title: resolved.title,
    description: `${details.employeeName}${caption}`,
    timeout: resolved.duration,
    data: { descriptionParts: [{ label: details.employeeName }, { text: caption }] },
  };
};

// Missing responses and server failures do not prove the update was rejected.
export const getEmployeeStatusSaveErrorCode = (error) => {
  if (!error || !error.response) return "SAVE_UNCONFIRMED";
  const status = error.response.status;
  if (status === 401) return "SESSION_EXPIRED";
  if (status === 403) return "PERMISSION_DENIED";
  if (status === 409) return "STATUS_CONFLICT";
  if (status === 422) return "VALIDATION_FAILED";
  if (!status || status >= 500) return "SAVE_UNCONFIRMED";
  return "SAVE_FAILED";
};
