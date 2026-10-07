import { resolveErrorFeedback } from "@/utils/feedback/errorFeedback";

export const EDIT_EMPLOYEE_FEEDBACK = {
  SAVE_FAILED: "Could not save changes. Please try again.",
  SESSION_EXPIRED: "Session expired. Sign in again.",
  PERMISSION_DENIED: "You do not have permission to edit this employee.",
  VALIDATION_FAILED: "Review the employee details and try again.",
  EMPLOYEE_CONFLICT: "Employee details have changed. Close and refresh the list.",
  RATE_LIMITED: "Please wait before trying again.",
  SAVE_UNCONFIRMED: "Could not confirm the update. Close and refresh the list before trying again.",
  REFRESH_FAILED: "Changes saved, but the employee list could not refresh.",
};

export const EDIT_EMPLOYEE_INLINE_ERRORS = {
  SAVE_FAILED: { type: "critical", message: EDIT_EMPLOYEE_FEEDBACK.SAVE_FAILED },
  SESSION_EXPIRED: { type: "critical", message: EDIT_EMPLOYEE_FEEDBACK.SESSION_EXPIRED },
  PERMISSION_DENIED: { type: "critical", message: EDIT_EMPLOYEE_FEEDBACK.PERMISSION_DENIED },
  VALIDATION_FAILED: { type: "validation", message: EDIT_EMPLOYEE_FEEDBACK.VALIDATION_FAILED },
  EMPLOYEE_CONFLICT: { type: "critical", message: EDIT_EMPLOYEE_FEEDBACK.EMPLOYEE_CONFLICT },
  RATE_LIMITED: { type: "critical", message: EDIT_EMPLOYEE_FEEDBACK.RATE_LIMITED },
  SAVE_UNCONFIRMED: { type: "critical", message: EDIT_EMPLOYEE_FEEDBACK.SAVE_UNCONFIRMED },
};

export const getEditEmployeeInlineFeedback = (code) => {
  const definition = EDIT_EMPLOYEE_INLINE_ERRORS[code];
  if (!definition) return null;
  return resolveErrorFeedback({ code, ...definition, showCode: true });
};

export const EDIT_EMPLOYEE_STATUS_FEEDBACK = {
  EMPLOYEE_SAVING: {
    type: "loading", display: "status", tone: "info",
    title: "Saving changes...", message: "Please wait while employee details are updated.",
  },
  EMPLOYEES_REFRESHING: {
    type: "loading", display: "status", tone: "info",
    title: "Refreshing employees...", message: "Changes saved. Updating the employee list.",
  },
  EMPLOYEES_REFRESH_FAILED: {
    type: "critical", display: "status", tone: "error",
    title: "Employee list could not refresh", message: EDIT_EMPLOYEE_FEEDBACK.REFRESH_FAILED,
    buttonLabel: "Retry refresh",
  },
};

export const getEditEmployeeStatusFeedback = (code) => {
  const definition = EDIT_EMPLOYEE_STATUS_FEEDBACK[code];
  if (!definition) return null;
  return resolveErrorFeedback({ code, ...definition });
};

export const EDIT_EMPLOYEE_TOAST_FEEDBACK = {
  EMPLOYEE_UPDATED: {
    type: "notification", display: "toast", toastType: "success", title: "Employee updated successfully",
  },
};

export const getEditEmployeeToastFeedback = (code, details = {}) => {
  const definition = EDIT_EMPLOYEE_TOAST_FEEDBACK[code];
  if (!definition) return null;
  const resolved = resolveErrorFeedback(definition);
  const caption = "'s employee details have been updated.";
  return {
    type: resolved.toastType, title: resolved.title,
    description: `${details.employeeName}${caption}`, timeout: resolved.duration,
    data: { descriptionParts: [{ label: details.employeeName }, { text: caption }] },
  };
};

export const getEditEmployeeErrorCode = (error) => {
  if (!error || !error.response) return "SAVE_UNCONFIRMED";
  const status = error.response.status;
  if (status === 401) return "SESSION_EXPIRED";
  if (status === 403) return "PERMISSION_DENIED";
  if (status === 404 || status === 409) return "EMPLOYEE_CONFLICT";
  if (status === 422) return "VALIDATION_FAILED";
  if (status === 429) return "RATE_LIMITED";
  if (!status || status >= 500) return "SAVE_UNCONFIRMED";
  return "SAVE_FAILED";
};
