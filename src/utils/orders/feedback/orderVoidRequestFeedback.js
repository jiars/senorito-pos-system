import { resolveErrorFeedback } from "@/utils/feedback/errorFeedback";

const requestErrors = {
  SAVE_FAILED: "Could not submit the void request. Please try again.",
  SESSION_EXPIRED: "Session expired. Sign in again.",
  PERMISSION_DENIED: "You cannot request a void for this order.",
  ORDER_NOT_FOUND: "This order is unavailable. Close and refresh Order History.",
  ORDER_CONFLICT: "This order has changed. Close and refresh Order History before trying again.",
  VALIDATION_FAILED: "Review the reason and try again.",
  RATE_LIMITED: "Too many requests. Please wait a minute before trying again.",
  SAVE_UNCONFIRMED: "Could not confirm whether the request was saved. Close and refresh Order History before trying again.",
};

export const getVoidRequestErrorCode = (error) => {
  if (!error || !error.response) return "SAVE_UNCONFIRMED";
  const status = error.response.status;
  if (status === 401) return "SESSION_EXPIRED";
  if (status === 403) return "PERMISSION_DENIED";
  if (status === 404) return "ORDER_NOT_FOUND";
  if (status === 409) return "ORDER_CONFLICT";
  if (status === 422) return "VALIDATION_FAILED";
  if (status === 429) return "RATE_LIMITED";
  if (!status || status >= 500) return "SAVE_UNCONFIRMED";
  return "SAVE_FAILED";
};

export const getVoidRequestInlineFeedback = (code) => {
  if (!requestErrors[code]) return null;
  return resolveErrorFeedback({ code, type: "critical", message: requestErrors[code], showCode: true });
};

export const getVoidRequestLoadingFeedback = (code) => {
  if (code === "REFRESH_FAILED") {
    return { title: "Order History could not refresh", message: "Request saved. Retry refresh only; do not submit it again." };
  }
  if (code === "REFRESHING") {
    return { title: "Refreshing Order History...", message: "Your request is saved. Updating the order list." };
  }
  return { title: "Submitting void request...", message: "Please wait while your request is saved." };
};

export const getVoidRequestToastFeedback = (orderNumber, alreadyRequested) => {
  const feedback = resolveErrorFeedback({ type: "notification", display: "toast" });
  let title = "Void request submitted";
  if (alreadyRequested) title = "Void request already pending";
  return {
    type: "success", title,
    description: `${orderNumber} is awaiting Owner approval. Sales and stock are unchanged.`,
    timeout: feedback.duration,
  };
};

export const getVoidReviewInlineFeedback = (code) => {
  const messages = {
    SAVE_FAILED: "Could not save the decision. Please try again.",
    PERMISSION_DENIED: "Only an active Owner can review void requests.",
    VALIDATION_FAILED: "Review the decision and reason before trying again.",
    STOCK_REFRESH_FAILED: "Could not prepare the POS stock refresh. No decision was submitted. Please try again.",
    SAVE_UNCONFIRMED: "Could not confirm the decision. Close and refresh Order History before trying again.",
  };
  const message = messages[code] || requestErrors[code];
  if (!message) return null;
  return resolveErrorFeedback({ code, type: "critical", message, showCode: true });
};

export const getVoidReviewToastFeedback = (orderNumber, decision, alreadyReviewed, stockHandling) => {
  const policy = resolveErrorFeedback({ type: "notification", display: "toast" });
  let title = "Void request rejected";
  let description = `${orderNumber} remains completed and included in sales.`;
  if (decision === "approved") {
    title = "Order voided";
    description = `${orderNumber} is excluded from sales. Stock kept deducted. No automatic refund.`;
    if (stockHandling === "return_stock") {
      description = `${orderNumber} is excluded from sales. Unused stock returned. No automatic refund.`;
    }
  }
  if (alreadyReviewed) title = "Decision already recorded";
  return { type: "success", title, description, timeout: policy.duration };
};

export const getVoidReviewLoadingFeedback = (code) => {
  if (code === "REFRESH_FAILED") {
    return { title: "Order and stock data could not refresh", message: "Decision saved. Retry refresh only; do not approve or reject again." };
  }
  if (code === "REFRESHING") {
    return { title: "Refreshing order data...", message: "Decision saved. Updating Order History and any returned stock." };
  }
  return { title: "Saving void decision...", message: "Please wait while the decision is recorded." };
};
