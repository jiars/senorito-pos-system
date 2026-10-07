import { resolveErrorFeedback } from "@/utils/feedback/errorFeedback";

export const SETUP_LINK_FEEDBACK = {
  SEND_FAILED: "Could not send the setup link. Please try again.",
  SESSION_EXPIRED: "Session expired. Sign in again.",
  PERMISSION_DENIED: "You do not have permission to send setup links.",
  VALIDATION_FAILED: "The setup link could not be sent. Review the employee details.",
  NOT_ELIGIBLE: "This employee is no longer eligible. Close this dialog and refresh the list.",
  RATE_LIMITED: "Please wait before sending another setup link.",
  SEND_UNCONFIRMED: "Could not confirm the send. Check the employee's email before trying again.",
  REFRESH_FAILED: "The request is complete, but the employee list could not refresh.",
};

export const SETUP_LINK_INLINE_ERRORS = {
  SEND_FAILED: { type: "critical", message: SETUP_LINK_FEEDBACK.SEND_FAILED },
  SESSION_EXPIRED: { type: "critical", message: SETUP_LINK_FEEDBACK.SESSION_EXPIRED },
  PERMISSION_DENIED: { type: "critical", message: SETUP_LINK_FEEDBACK.PERMISSION_DENIED },
  VALIDATION_FAILED: { type: "validation", message: SETUP_LINK_FEEDBACK.VALIDATION_FAILED },
  NOT_ELIGIBLE: { type: "critical", message: SETUP_LINK_FEEDBACK.NOT_ELIGIBLE },
  RATE_LIMITED: { type: "critical", message: SETUP_LINK_FEEDBACK.RATE_LIMITED },
  SEND_UNCONFIRMED: { type: "critical", message: SETUP_LINK_FEEDBACK.SEND_UNCONFIRMED },
};

export const getSetupLinkInlineFeedback = (code) => {
  const definition = SETUP_LINK_INLINE_ERRORS[code];
  if (!definition) return null;
  return resolveErrorFeedback({ code, ...definition, showCode: true });
};

export const SETUP_LINK_STATUS_FEEDBACK = {
  SETUP_LINK_SENDING: {
    type: "loading", display: "status", tone: "info",
    title: "Sending setup link...", message: "Please wait while the setup link is sent.",
  },
  EMPLOYEES_REFRESHING: {
    type: "loading", display: "status", tone: "info",
    title: "Refreshing employees...", message: "Request complete. Updating the employee list.",
  },
  EMPLOYEES_REFRESH_FAILED: {
    type: "critical", display: "status", tone: "error",
    title: "Employee list could not refresh", message: SETUP_LINK_FEEDBACK.REFRESH_FAILED,
    buttonLabel: "Retry refresh",
  },
};

export const getSetupLinkStatusFeedback = (code) => {
  const definition = SETUP_LINK_STATUS_FEEDBACK[code];
  if (!definition) return null;
  return resolveErrorFeedback({ code, ...definition });
};

export const SETUP_LINK_TOAST_FEEDBACK = {
  SETUP_LINK_SENT: {
    type: "notification", display: "toast", toastType: "success", title: "Setup link sent successfully",
  },
  SETUP_ALREADY_COMPLETE: {
    type: "notification", display: "toast", toastType: "info", title: "Password setup already complete",
  },
};

export const getSetupLinkToastFeedback = (code, details = {}) => {
  const definition = SETUP_LINK_TOAST_FEEDBACK[code];
  if (!definition) return null;
  const resolved = resolveErrorFeedback(definition);
  let caption = " has been sent a password setup link.";
  if (code === "SETUP_ALREADY_COMPLETE") caption = " has already completed password setup.";
  return {
    type: resolved.toastType,
    title: resolved.title,
    description: `${details.employeeName}${caption}`,
    timeout: resolved.duration,
    data: { descriptionParts: [{ label: details.employeeName }, { text: caption }] },
  };
};

// An uncertain email send must not be repeated automatically.
export const getSetupLinkErrorCode = (error) => {
  if (!error || !error.response) return "SEND_UNCONFIRMED";
  const status = error.response.status;
  if (status === 401) return "SESSION_EXPIRED";
  if (status === 403) return "PERMISSION_DENIED";
  if (status === 409) return "SETUP_ALREADY_COMPLETE";
  if (status === 422) return "VALIDATION_FAILED";
  if (status === 429) return "RATE_LIMITED";
  if (!status || status >= 500) return "SEND_UNCONFIRMED";
  return "SEND_FAILED";
};
