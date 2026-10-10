import { resolveErrorFeedback } from "@/utils/feedback/errorFeedback";

export const LOGOUT_FEEDBACK = {
  LOGOUT_FAILED: "Could not log out. Check your connection and try again.",
};

export const LOGOUT_INLINE_ERRORS = {
  LOGOUT_FAILED: {
    type: "critical",
    message: LOGOUT_FEEDBACK.LOGOUT_FAILED,
  },
};

export const getLogoutInlineFeedback = (code) => {
  const definition = LOGOUT_INLINE_ERRORS[code];
  if (!definition) return null;
  return resolveErrorFeedback({ code, ...definition, showCode: true });
};
