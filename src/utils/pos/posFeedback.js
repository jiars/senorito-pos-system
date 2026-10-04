import { resolveErrorFeedback } from "@/utils/feedback/errorFeedback";

// POS messages/types only; shared policies own timing and presentation behavior.
export const POS_FEEDBACK = {
  SIZE_REQUIRED: "Select a size first.",
  STOCK_LIMIT_REACHED: "Stock limit reached.",
  QUANTITY_STOCK_INSUFFICIENT: "Not enough stock. Reduce quantity.",
  ADDON_STOCK_INSUFFICIENT: "Not enough stock. Reduce quantity or remove an add-on.",
  ADDON_UNAVAILABLE: "Remove unavailable add-ons to continue.",
  VARIANT_UNAVAILABLE: "Select an available size.",
  CART_STOCK_TITLE: "Not enough stock",
  CART_STOCK_DESCRIPTION: "Reduce quantity or check ingredient stock.",
  ADDED_TO_ORDER: "Added to order",
  CHECKOUT_WAITING: "Please wait…",
  CHECKOUT_REFRESHING: "Please wait while the menu and stock are refreshing.",
  ORDER_REFRESH_FAILED: "Your order is saved. Check your connection and retry to refresh menu and stock.",
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
  STOCK_LIMIT_REACHED: { type: "transient", message: POS_FEEDBACK.STOCK_LIMIT_REACHED },
  QUANTITY_STOCK_INSUFFICIENT: { type: "validation", message: POS_FEEDBACK.QUANTITY_STOCK_INSUFFICIENT },
  ADDON_STOCK_INSUFFICIENT: { type: "validation", message: POS_FEEDBACK.ADDON_STOCK_INSUFFICIENT },
  ADDON_UNAVAILABLE: { type: "validation", message: POS_FEEDBACK.ADDON_UNAVAILABLE },
  VARIANT_UNAVAILABLE: { type: "validation", message: POS_FEEDBACK.VARIANT_UNAVAILABLE },
};

export const getPOSInlineFeedback = (code) => {
  const definition = POS_INLINE_ERRORS[code];
  return definition ? resolveErrorFeedback({ code, ...definition }) : null;
};

export const POS_TOAST_FEEDBACK = {
  ORDER_REFRESH_READY: {
    type: "notification", toastType: "success", display: "toast",
    title: "Ready for the next order", description: "Menu and stock updated.",
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

const unavailableMessages = {
  "Out of Stock": "Ingredients are out of stock.",
  "Insufficient Stock": "Not enough stock for this order.",
  "On Hold": "Recipe needs attention.",
  Incomplete: "Recipe is incomplete.",
  Unavailable: "Disabled for sale.",
  "Not Available": "Currently unavailable.",
};

export const getPOSUnavailableMessage = (status) =>
  unavailableMessages[status] || unavailableMessages["Not Available"];

export const getPOSAddedDescription = (selection) =>
  `${selection.drinkQty} × ${selection.name} (${selection.selectedVariant})`;
