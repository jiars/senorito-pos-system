import { resolveErrorFeedback } from "@/utils/feedback/errorFeedback";

export const ADD_EMPLOYEE_FEEDBACK = {
  SAVE_FAILED: "Could not add the employee. Please try again.",
  SESSION_EXPIRED: "Session expired. Sign in again.",
  PERMISSION_DENIED: "You do not have permission to add employees.",
  VALIDATION_FAILED: "Review the employee details and try again.",
  EMPLOYEE_CONFLICT: "Employee details already exist. Review the employee list.",
  RATE_LIMITED: "Please wait before trying again.",
  SAVE_UNCONFIRMED: "Could not confirm creation. Close and refresh the employee list before trying again.",
  REFRESH_FAILED: "Employee added, but the employee list could not refresh.",
};

export const ADD_EMPLOYEE_INLINE_ERRORS = {
  SAVE_FAILED: { type: "critical", message: ADD_EMPLOYEE_FEEDBACK.SAVE_FAILED },
  SESSION_EXPIRED: { type: "critical", message: ADD_EMPLOYEE_FEEDBACK.SESSION_EXPIRED },
  PERMISSION_DENIED: { type: "critical", message: ADD_EMPLOYEE_FEEDBACK.PERMISSION_DENIED },
  VALIDATION_FAILED: { type: "validation", message: ADD_EMPLOYEE_FEEDBACK.VALIDATION_FAILED },
  EMPLOYEE_CONFLICT: { type: "critical", message: ADD_EMPLOYEE_FEEDBACK.EMPLOYEE_CONFLICT },
  RATE_LIMITED: { type: "critical", message: ADD_EMPLOYEE_FEEDBACK.RATE_LIMITED },
  SAVE_UNCONFIRMED: { type: "critical", message: ADD_EMPLOYEE_FEEDBACK.SAVE_UNCONFIRMED },
};

export const getAddEmployeeInlineFeedback = (code) => {
  const definition = ADD_EMPLOYEE_INLINE_ERRORS[code];
  if (!definition) return null;
  return resolveErrorFeedback({ code, ...definition, showCode: true });
};

export const ADD_EMPLOYEE_STATUS_FEEDBACK = {
  EMPLOYEE_ADDING: {
    type: "loading", display: "status", tone: "info",
    title: "Adding employee...", message: "Please wait while the account is created.",
  },
  EMPLOYEES_REFRESHING: {
    type: "loading", display: "status", tone: "info",
    title: "Refreshing employees...", message: "Account created. Updating the employee list.",
  },
  EMPLOYEES_REFRESH_FAILED: {
    type: "critical", display: "status", tone: "error",
    title: "Employee list could not refresh", message: ADD_EMPLOYEE_FEEDBACK.REFRESH_FAILED,
    buttonLabel: "Retry refresh",
  },
};

export const getAddEmployeeStatusFeedback = (code) => {
  const definition = ADD_EMPLOYEE_STATUS_FEEDBACK[code];
  if (!definition) return null;
  return resolveErrorFeedback({ code, ...definition });
};

export const ADD_EMPLOYEE_TOAST_FEEDBACK = {
  EMPLOYEE_ADDED: {
    type: "notification", display: "toast", toastType: "success", title: "Employee added successfully",
  },
  EMPLOYEE_ADDED_EMAIL_FAILED: {
    type: "notification", display: "toast", toastType: "warning", title: "Employee added, setup email not sent",
  },
};

export const getAddEmployeeToastFeedback = (code, details = {}) => {
  const definition = ADD_EMPLOYEE_TOAST_FEEDBACK[code];
  if (!definition) return null;
  const resolved = resolveErrorFeedback(definition);
  let caption = " is now registered. A password setup link was sent.";
  if (code === "EMPLOYEE_ADDED_EMAIL_FAILED") caption = " is now registered. Use Resend Setup Link to send the email.";
  return {
    type: resolved.toastType, title: resolved.title,
    description: `${details.employeeName}${caption}`, timeout: resolved.duration,
    data: { descriptionParts: [{ label: details.employeeName }, { text: caption }] },
  };
};

export const getAddEmployeeErrorCode = (error) => {
  if (!error || !error.response) return "SAVE_UNCONFIRMED";
  const status = error.response.status;
  if (status === 401) return "SESSION_EXPIRED";
  if (status === 403) return "PERMISSION_DENIED";
  if (status === 409) return "EMPLOYEE_CONFLICT";
  if (status === 422) return "VALIDATION_FAILED";
  if (status === 429) return "RATE_LIMITED";
  if (!status || status >= 500) return "SAVE_UNCONFIRMED";
  return "SAVE_FAILED";
};
