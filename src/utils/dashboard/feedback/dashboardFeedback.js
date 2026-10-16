import { resolveErrorFeedback } from "@/utils/feedback/errorFeedback";

export const DASHBOARD_STATUS_FEEDBACK = {
  DASHBOARD_LOAD_FAILED: {
    title: "Could not load Dashboard",
    message: "Please try again.",
  },
  DASHBOARD_CONNECTION_FAILED: {
    title: "Could not connect to Dashboard",
    message: "Check your connection and try again.",
  },
  DASHBOARD_SESSION_EXPIRED: {
    title: "Sign in required",
    message: "Sign in again to view Dashboard.",
    canRetry: false,
  },
  DASHBOARD_ACCESS_DENIED: {
    title: "Dashboard access denied",
    message: "Your account does not have permission to view Dashboard.",
    canRetry: false,
  },
  DASHBOARD_RATE_LIMITED: {
    title: "Please wait before retrying",
    message: "Too many requests. Try again shortly.",
  },
  DASHBOARD_INVALID_RESPONSE: {
    title: "Could not read Dashboard data",
    message: "Please try again. If this continues, contact your administrator.",
  },
};

export const getDashboardErrorCode = (error) => {
  if (!error) return null;
  if (error.code === "DASHBOARD_INVALID_RESPONSE" || error instanceof SyntaxError) {
    return "DASHBOARD_INVALID_RESPONSE";
  }
  if (error.status === 401) return "DASHBOARD_SESSION_EXPIRED";
  if (error.status === 403) return "DASHBOARD_ACCESS_DENIED";
  if (error.status === 429) return "DASHBOARD_RATE_LIMITED";
  if (!error.status && error instanceof TypeError) {
    return "DASHBOARD_CONNECTION_FAILED";
  }
  return "DASHBOARD_LOAD_FAILED";
};

export const getDashboardStatusFeedback = (code) => {
  const definition = DASHBOARD_STATUS_FEEDBACK[code];
  if (!definition) return null;
  return resolveErrorFeedback({
    code,
    type: "critical",
    display: "status",
    tone: "error",
    canRetry: true,
    ...definition,
  });
};
