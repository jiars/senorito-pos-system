import { resolveErrorFeedback } from "@/utils/feedback/errorFeedback";

export const PASSWORD_REQUEST_FEEDBACK = {
  SAVE_FAILED: "Could not update the password request. Please try again.",
  SESSION_EXPIRED: "Session expired. Sign in again.",
  PERMISSION_DENIED: "You do not have permission to review password requests.",
  VALIDATION_FAILED: "The action was rejected. Review the employee and request.",
  REQUEST_CONFLICT: "This request is expired or already handled. Refresh the employee list.",
  RATE_LIMITED: "Please wait before sending another reset link.",
  SAVE_UNCONFIRMED: "Could not confirm the action. Check the request and email before trying again.",
  REFRESH_FAILED: "Request updated. Could not refresh the employee list.",
};

export const PASSWORD_REQUEST_INLINE_ERRORS = {
  SAVE_FAILED: { type: "critical", message: PASSWORD_REQUEST_FEEDBACK.SAVE_FAILED },
  SESSION_EXPIRED: { type: "critical", message: PASSWORD_REQUEST_FEEDBACK.SESSION_EXPIRED },
  PERMISSION_DENIED: { type: "critical", message: PASSWORD_REQUEST_FEEDBACK.PERMISSION_DENIED },
  VALIDATION_FAILED: { type: "validation", message: PASSWORD_REQUEST_FEEDBACK.VALIDATION_FAILED },
  REQUEST_CONFLICT: { type: "critical", message: PASSWORD_REQUEST_FEEDBACK.REQUEST_CONFLICT },
  RATE_LIMITED: { type: "critical", message: PASSWORD_REQUEST_FEEDBACK.RATE_LIMITED },
  SAVE_UNCONFIRMED: { type: "critical", message: PASSWORD_REQUEST_FEEDBACK.SAVE_UNCONFIRMED },
};

export const getPasswordRequestInlineFeedback = (code) => {
  const definition = PASSWORD_REQUEST_INLINE_ERRORS[code];
  if (!definition) return null;
  return resolveErrorFeedback({ code, ...definition, showCode: true });
};

export const PASSWORD_REQUEST_STATUS_FEEDBACK = {
  REQUEST_APPROVING: {
    type: "loading", display: "status", tone: "info",
    title: "Approving request...", message: "Please wait while the password request is reviewed.",
  },
  REQUEST_CANCELLING: {
    type: "loading", display: "status", tone: "info",
    title: "Cancelling request...", message: "Please wait while the password request is cancelled.",
  },
  RESET_LINK_SENDING: {
    type: "loading", display: "status", tone: "info",
    title: "Sending reset link...", message: "Please wait while the reset link is sent.",
  },
  EMPLOYEES_REFRESHING: {
    type: "loading", display: "status", tone: "info",
    title: "Refreshing employees...", message: "Request updated. Refreshing the employee list.",
  },
  EMPLOYEES_REFRESH_FAILED: {
    type: "critical", display: "status", tone: "error",
    title: "Employee list could not refresh", message: PASSWORD_REQUEST_FEEDBACK.REFRESH_FAILED,
    buttonLabel: "Retry refresh",
  },
};

export const getPasswordRequestStatusFeedback = (code) => {
  const definition = PASSWORD_REQUEST_STATUS_FEEDBACK[code];
  if (!definition) return null;
  return resolveErrorFeedback({ code, ...definition });
};

export const PASSWORD_REQUEST_TOAST_FEEDBACK = {
  REQUEST_APPROVED: {
    type: "notification", display: "toast", toastType: "success", title: "Password request approved",
    caption: " has been sent a password reset link.",
  },
  REQUEST_APPROVED_EMAIL_FAILED: {
    type: "notification", display: "toast", toastType: "warning", title: "Request approved, email not sent",
    caption: "'s request was approved. Use Resend Link to send the reset email.",
  },
  REQUEST_CANCELLED: {
    type: "notification", display: "toast", toastType: "success", title: "Password request cancelled",
    caption: "'s password reset request has been cancelled.",
  },
  RESET_LINK_SENT: {
    type: "notification", display: "toast", toastType: "success", title: "Reset link sent successfully",
    caption: " has been sent a new password reset link.",
  },
};

export const getPasswordRequestToastFeedback = (code, details = {}) => {
  const definition = PASSWORD_REQUEST_TOAST_FEEDBACK[code];
  if (!definition) return null;
  const resolved = resolveErrorFeedback(definition);
  return {
    type: resolved.toastType,
    title: resolved.title,
    description: `${details.employeeName}${resolved.caption}`,
    timeout: resolved.duration,
    data: { descriptionParts: [{ label: details.employeeName }, { text: resolved.caption }] },
  };
};

export const getPasswordRequestErrorCode = (error) => {
  if (!error || !error.response) return "SAVE_UNCONFIRMED";
  const status = error.response.status;
  if (status === 401) return "SESSION_EXPIRED";
  if (status === 403) return "PERMISSION_DENIED";
  if (status === 404 || status === 409) return "REQUEST_CONFLICT";
  if (status === 422) return "VALIDATION_FAILED";
  if (status === 429) return "RATE_LIMITED";
  if (!status || status >= 500) return "SAVE_UNCONFIRMED";
  return "SAVE_FAILED";
};
