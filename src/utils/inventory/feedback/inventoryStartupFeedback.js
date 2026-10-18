import { resolveErrorFeedback } from "@/utils/feedback/errorFeedback";

export const INVENTORY_STARTUP_COPY = {
  CHECKING: "Checking today's inventory...",
  RETRY: "Retry",
  RETRY_WAIT: "Retry available in 3 seconds",
};

const INVENTORY_STARTUP_ERRORS = {
  CHECK_FAILED: {
    title: "Inventory check could not finish",
    message: "Check your connection, then retry. The app will open after today's inventory is confirmed ready.",
  },
  SESSION_EXPIRED: {
    title: "Sign-in required",
    message: "Reload the app and sign in again. The inventory check has not been confirmed.",
  },
  ACCESS_DENIED: {
    title: "Inventory check is not allowed",
    message: "An active, authorized staff account is required. Ask the Owner to verify your access, then retry.",
  },
};

export const getInventoryStartupErrorFeedback = (error) => {
  let code = "CHECK_FAILED";
  if (error && error.response) {
    if (error.response.status === 401) code = "SESSION_EXPIRED";
    if (error.response.status === 403) code = "ACCESS_DENIED";
  }

  return resolveErrorFeedback({
    code,
    type: "critical",
    display: "blocking",
    tone: "error",
    ...INVENTORY_STARTUP_ERRORS[code],
  });
};
