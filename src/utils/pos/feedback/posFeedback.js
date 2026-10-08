import { resolveErrorFeedback } from "@/utils/feedback/errorFeedback";

// POS messages/types only; shared policies own timing and presentation behavior.
export const POS_FEEDBACK = {
  SIZE_REQUIRED: "Select a size first.",
  STOCK_LIMIT_REACHED: "Stock limit reached.",
  QUANTITY_STOCK_INSUFFICIENT: "Not enough stock. Reduce quantity.",
  ADDON_STOCK_INSUFFICIENT:
    "Not enough stock. Reduce quantity or remove an add-on.",
  ADDON_UNAVAILABLE: "Remove unavailable add-ons to continue.",
  VARIANT_UNAVAILABLE: "Select an available size.",
  CART_STOCK_TITLE: "Not enough stock",
  CART_STOCK_DESCRIPTION:
    "Reduce quantity or check ingredient stock.",
  ADDED_TO_ORDER: "Added to order",
  CHECKOUT_WAITING: "Please wait…",
  CHECKOUT_REFRESHING: "Please wait while the menu and stock are refreshing.",
  ORDER_REFRESH_FAILED:
    "Your order is saved. Check your connection and retry to refresh menu and stock.",
};

export const POS_STATUS_FEEDBACK = {
  ORDER_REFRESH_PENDING: {
    type: "loading",
    display: "status",
    tone: "info",
    title: "Preparing the next order…",
    message: "Order saved. Updating menu and stock. Please wait.",
  },
  ORDER_REFRESH_FAILED: {
    type: "critical",
    display: "status",
    tone: "error",
    title: "Menu and stock could not refresh",
    message: POS_FEEDBACK.ORDER_REFRESH_FAILED,
    buttonLabel: "Retry refresh",
  },
  ORDER_PROCESSING: {
    type: "loading",
    display: "status",
    tone: "info",
    title: "Processing order…",
    message: "Saving your order. Please wait.",
    buttonLabel: "Processing…",
  },
  ORDERS_SYNCING: {
    type: "loading",
    display: "status",
    tone: "info",
    title: "Syncing offline orders…",
    message: "Sending saved orders to the server. Please wait.",
  },
  POS_REFRESHING: {
    type: "loading",
    display: "status",
    tone: "info",
    title: "Updating menu and stock…",
    message: "Please wait before processing another order.",
  },
};

export const getPOSStatusFeedback = (code) => {
  const definition = POS_STATUS_FEEDBACK[code];
  if (!definition) return null;
  return resolveErrorFeedback({ code, ...definition });
};

export const POS_INLINE_ERRORS = {
  SIZE_REQUIRED: { type: "validation", message: POS_FEEDBACK.SIZE_REQUIRED },
  STOCK_LIMIT_REACHED: {
    type: "transient",
    message: POS_FEEDBACK.STOCK_LIMIT_REACHED,
  },
  QUANTITY_STOCK_INSUFFICIENT: {
    type: "validation",
    message: POS_FEEDBACK.QUANTITY_STOCK_INSUFFICIENT,
  },
  ADDON_STOCK_INSUFFICIENT: {
    type: "validation",
    message: POS_FEEDBACK.ADDON_STOCK_INSUFFICIENT,
  },
  ADDON_UNAVAILABLE: {
    type: "validation",
    message: POS_FEEDBACK.ADDON_UNAVAILABLE,
  },
  VARIANT_UNAVAILABLE: {
    type: "validation",
    message: POS_FEEDBACK.VARIANT_UNAVAILABLE,
  },
};

export const getPOSInlineFeedback = (code) => {
  const definition = POS_INLINE_ERRORS[code];
  return definition ? resolveErrorFeedback({ code, ...definition }) : null;
};

export const POS_TOAST_FEEDBACK = {
  ORDER_REFRESH_READY: {
    type: "notification",
    toastType: "success",
    display: "toast",
    title: "Ready for the next order",
    description: "Menu and stock updated.",
  },
};

export const getPOSToastFeedback = (code) => {
  const definition = POS_TOAST_FEEDBACK[code];
  if (!definition) return null;
  const resolved = resolveErrorFeedback(definition);
  return {
    type: resolved.toastType,
    title: resolved.title,
    description: resolved.description,
    timeout: resolved.duration,
  };
};

// Build feedback for one attempt; this function does not display a toast.
export function getPOSSyncToastFeedback(
  result,
  { refreshFailed = false, syncFailed = false } = {},
) {
  let title = "Synchronization complete";
  let toastType = "success";
  const messages = [];

  if (result && result.synced > 0) {
    const label = result.synced === 1 ? "order" : "orders";
    messages.push(`${result.synced} offline ${label} synchronized.`);
  }

  if (result && result.attention > 0) {
    const label = result.attention === 1 ? "order needs" : "orders need";
    messages.push(`${result.attention} ${label} attention. Open Sync details.`);
    title = "Some orders need review";
    toastType = "warning";
  }

  if (result && result.skipped > 0) {
    messages.push("Other saved orders were not uploaded by this session.");
    title = "Some orders remain on this device";
    toastType = "warning";
  }

  if (result && result.connectionIssue) {
    messages.push("Could not continue uploading. Unsent orders remain saved.");
    title = "Connection issue";
    toastType = "warning";
  }

  if (result && result.signInRequired) {
    messages.push("Sign in with the order's cashier account to continue.");
    title = "Sign in required";
    toastType = "warning";
  }

  if (syncFailed) {
    messages.push("Synchronization could not finish. Check Sync details.");
    title = "Synchronization interrupted";
    toastType = "error";
  }

  if (refreshFailed) {
    messages.push(
      "Menu and stock refresh is still needed. Do not enter accepted sales again.",
    );
    title = "Menu and stock need refreshing";
    toastType = "warning";
  }

  // No work and no failure means no notification.
  if (messages.length === 0) return null;

  const feedback = resolveErrorFeedback({
    type: "notification",
    toastType,
    display: "toast",
    title,
    description: messages.join(" "),
  });

  return {
    type: feedback.toastType,
    title: feedback.title,
    description: feedback.description,
    timeout: feedback.duration,
  };
}

const unavailableMessages = {
  "Out of Stock": "Ingredients are out of stock.",
  "Insufficient Stock": "Not enough stock for this order.",
  "On Hold": "Recipe needs attention.",
  Incomplete: "Recipe is incomplete.",
  Unavailable: "Disabled for sale.",
  "Not Available": "Currently unavailable.",
};

export const getPOSUnavailableMessage = (status) => {
  const knownStatus = unavailableMessages[status] ? status : "Not Available";
  const code = `ITEM_${knownStatus.toUpperCase().replaceAll(" ", "_")}`;
  const feedback = resolveErrorFeedback({
    code,
    type: "critical",
    message: unavailableMessages[knownStatus],
  });
  return feedback.message;
};

export const getPOSAddedDescription = (selection) =>
  `${selection.drinkQty} × ${selection.name} (${selection.selectedVariant})`;
