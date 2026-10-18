import { resolveErrorFeedback } from "@/utils/feedback/errorFeedback";

export const CHANGE_PASSWORD_FEEDBACK = {
  SAVE_FAILED: "Could not change your password. Please try again.",
  SESSION_EXPIRED: "Session expired. Sign in again.",
  PERMISSION_DENIED: "You do not have permission to change this account's password.",
  ENDPOINT_UNAVAILABLE: "Password changes are not available. Please contact the administrator.",
  VALIDATION_FAILED: "Review the password fields and try again.",
  PASSWORD_CONFLICT: "Your account details have changed. Close and reload the page.",
  RATE_LIMITED: "Please wait before trying again.",
  SAVE_UNCONFIRMED: "Could not confirm the password change. Close and verify your account before trying again.",
  REFRESH_FAILED: "Password changed, but your account details could not refresh.",
};

export const CHANGE_PASSWORD_INLINE_ERRORS = {
  SAVE_FAILED: { type: "critical", message: CHANGE_PASSWORD_FEEDBACK.SAVE_FAILED },
  SESSION_EXPIRED: { type: "critical", message: CHANGE_PASSWORD_FEEDBACK.SESSION_EXPIRED },
  PERMISSION_DENIED: { type: "critical", message: CHANGE_PASSWORD_FEEDBACK.PERMISSION_DENIED },
  ENDPOINT_UNAVAILABLE: { type: "critical", message: CHANGE_PASSWORD_FEEDBACK.ENDPOINT_UNAVAILABLE },
  VALIDATION_FAILED: { type: "validation", message: CHANGE_PASSWORD_FEEDBACK.VALIDATION_FAILED },
  PASSWORD_CONFLICT: { type: "critical", message: CHANGE_PASSWORD_FEEDBACK.PASSWORD_CONFLICT },
  RATE_LIMITED: { type: "critical", message: CHANGE_PASSWORD_FEEDBACK.RATE_LIMITED },
  SAVE_UNCONFIRMED: { type: "critical", message: CHANGE_PASSWORD_FEEDBACK.SAVE_UNCONFIRMED },
};

export const getChangePasswordInlineFeedback = (code) => {
  const definition = CHANGE_PASSWORD_INLINE_ERRORS[code];
  if (!definition) return null;
  return resolveErrorFeedback({ code, ...definition, showCode: true });
};

export const CHANGE_PASSWORD_STATUS_FEEDBACK = {
  PASSWORD_SAVING: {
    type: "loading", display: "status", tone: "info",
    title: "Changing password...", message: "Please wait while your password is updated.",
  },
  PASSWORD_REFRESHING: {
    type: "loading", display: "status", tone: "info",
    title: "Refreshing account...", message: "Password changed. Updating your security details.",
  },
  PASSWORD_REFRESH_FAILED: {
    type: "critical", display: "status", tone: "error",
    title: "Account could not refresh", message: CHANGE_PASSWORD_FEEDBACK.REFRESH_FAILED,
    buttonLabel: "Retry refresh",
  },
};

export const getChangePasswordStatusFeedback = (code) => {
  const definition = CHANGE_PASSWORD_STATUS_FEEDBACK[code];
  if (!definition) return null;
  return resolveErrorFeedback({ code, ...definition });
};

export const CHANGE_PASSWORD_TOAST_FEEDBACK = {
  PASSWORD_CHANGED: {
    type: "notification", display: "toast", toastType: "success",
    title: "Password changed successfully",
  },
};

export const getChangePasswordToastFeedback = (code) => {
  const definition = CHANGE_PASSWORD_TOAST_FEEDBACK[code];
  if (!definition) return null;
  const resolved = resolveErrorFeedback(definition);
  return {
    type: resolved.toastType,
    title: resolved.title,
    description: "Your account password has been updated.",
    timeout: resolved.duration,
    data: { descriptionParts: [{ label: "Your account password" }, { text: " has been updated." }] },
  };
};

export const getChangePasswordErrorCode = (error) => {
  if (!error || !error.response) return "SAVE_UNCONFIRMED";
  const status = error.response.status;
  if (status === 401) return "SESSION_EXPIRED";
  if (status === 403) return "PERMISSION_DENIED";
  if (status === 404 || status === 405) return "ENDPOINT_UNAVAILABLE";
  if (status === 409) return "PASSWORD_CONFLICT";
  if (status === 422) return "VALIDATION_FAILED";
  if (status === 429) return "RATE_LIMITED";
  if (!status || status >= 500) return "SAVE_UNCONFIRMED";
  return "SAVE_FAILED";
};
