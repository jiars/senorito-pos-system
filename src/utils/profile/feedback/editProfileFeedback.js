import { resolveErrorFeedback } from "@/utils/feedback/errorFeedback";

export const EDIT_PROFILE_FEEDBACK = {
  SAVE_FAILED: "Could not save your profile. Please try again.",
  SESSION_EXPIRED: "Session expired. Sign in again.",
  PERMISSION_DENIED: "You do not have permission to update this account.",
  ENDPOINT_UNAVAILABLE: "Profile editing is not available. Please contact the administrator.",
  VALIDATION_FAILED: "Review your personal details and try again.",
  PROFILE_CONFLICT: "Your account details have changed. Close and reload the page.",
  RATE_LIMITED: "Please wait before trying again.",
  SAVE_UNCONFIRMED: "Could not confirm the update. Close and reload the page before trying again.",
  REFRESH_FAILED: "Changes saved, but your account details could not refresh.",
};

export const EDIT_PROFILE_INLINE_ERRORS = {
  SAVE_FAILED: { type: "critical", message: EDIT_PROFILE_FEEDBACK.SAVE_FAILED },
  SESSION_EXPIRED: { type: "critical", message: EDIT_PROFILE_FEEDBACK.SESSION_EXPIRED },
  PERMISSION_DENIED: { type: "critical", message: EDIT_PROFILE_FEEDBACK.PERMISSION_DENIED },
  ENDPOINT_UNAVAILABLE: { type: "critical", message: EDIT_PROFILE_FEEDBACK.ENDPOINT_UNAVAILABLE },
  VALIDATION_FAILED: { type: "validation", message: EDIT_PROFILE_FEEDBACK.VALIDATION_FAILED },
  PROFILE_CONFLICT: { type: "critical", message: EDIT_PROFILE_FEEDBACK.PROFILE_CONFLICT },
  RATE_LIMITED: { type: "critical", message: EDIT_PROFILE_FEEDBACK.RATE_LIMITED },
  SAVE_UNCONFIRMED: { type: "critical", message: EDIT_PROFILE_FEEDBACK.SAVE_UNCONFIRMED },
};

export const getEditProfileInlineFeedback = (code) => {
  const definition = EDIT_PROFILE_INLINE_ERRORS[code];
  if (!definition) return null;
  return resolveErrorFeedback({ code, ...definition, showCode: true });
};

export const EDIT_PROFILE_STATUS_FEEDBACK = {
  PROFILE_SAVING: {
    type: "loading", display: "status", tone: "info",
    title: "Saving changes...", message: "Please wait while your personal details are updated.",
  },
  PROFILE_REFRESHING: {
    type: "loading", display: "status", tone: "info",
    title: "Refreshing profile...", message: "Changes saved. Updating your account details.",
  },
  PROFILE_REFRESH_FAILED: {
    type: "critical", display: "status", tone: "error",
    title: "Profile could not refresh", message: EDIT_PROFILE_FEEDBACK.REFRESH_FAILED,
    buttonLabel: "Retry refresh",
  },
};

export const getEditProfileStatusFeedback = (code) => {
  const definition = EDIT_PROFILE_STATUS_FEEDBACK[code];
  if (!definition) return null;
  return resolveErrorFeedback({ code, ...definition });
};

export const EDIT_PROFILE_TOAST_FEEDBACK = {
  PROFILE_UPDATED: {
    type: "notification", display: "toast", toastType: "success",
    title: "Profile updated successfully",
  },
};

export const getEditProfileToastFeedback = (code) => {
  const definition = EDIT_PROFILE_TOAST_FEEDBACK[code];
  if (!definition) return null;
  const resolved = resolveErrorFeedback(definition);
  return {
    type: resolved.toastType,
    title: resolved.title,
    description: "Your personal information has been updated.",
    timeout: resolved.duration,
    data: { descriptionParts: [{ label: "Your personal information" }, { text: " has been updated." }] },
  };
};

export const getEditProfileErrorCode = (error) => {
  if (!error || !error.response) return "SAVE_UNCONFIRMED";
  const status = error.response.status;
  if (status === 401) return "SESSION_EXPIRED";
  if (status === 403) return "PERMISSION_DENIED";
  if (status === 404 || status === 405) return "ENDPOINT_UNAVAILABLE";
  if (status === 409) return "PROFILE_CONFLICT";
  if (status === 422) return "VALIDATION_FAILED";
  if (status === 429) return "RATE_LIMITED";
  if (!status || status >= 500) return "SAVE_UNCONFIRMED";
  return "SAVE_FAILED";
};
