import { resolveErrorFeedback } from "@/utils/feedback/errorFeedback";
import { formatCurrency } from "@/utils/shared/formatters/currencyFormatters";

// Add Item copy only; timing and feedback presentation stay shared.
export const ADD_INVENTORY_FEEDBACK = {
  SAVE_FAILED: "Couldn’t add the item. Please try again.",
  REFRESH_FAILED: "Item saved. Couldn’t refresh inventory.",
  ITEM_ADDED: "Item successfully added.",
  SESSION_EXPIRED: "Session expired. Sign in again.",
  PERMISSION_DENIED: "You don’t have permission to add inventory.",
  VALIDATION_FAILED: "Some details were rejected. Review your inputs.",
  SAVE_UNCONFIRMED:
    "Couldn’t confirm the save. Check inventory before trying again.",
};

export const ADD_INVENTORY_INLINE_ERRORS = {
  SAVE_FAILED: {
    type: "critical",
    message: ADD_INVENTORY_FEEDBACK.SAVE_FAILED,
  },
  REFRESH_FAILED: {
    type: "critical",
    message: ADD_INVENTORY_FEEDBACK.REFRESH_FAILED,
  },
  SESSION_EXPIRED: {
    type: "critical",
    message: ADD_INVENTORY_FEEDBACK.SESSION_EXPIRED,
  },
  PERMISSION_DENIED: {
    type: "critical",
    message: ADD_INVENTORY_FEEDBACK.PERMISSION_DENIED,
  },
  VALIDATION_FAILED: {
    type: "validation",
    message: ADD_INVENTORY_FEEDBACK.VALIDATION_FAILED,
  },
  SAVE_UNCONFIRMED: {
    type: "critical",
    message: ADD_INVENTORY_FEEDBACK.SAVE_UNCONFIRMED,
    buttonLabel: "Check inventory first",
  },
};

export const getAddInventoryInlineFeedback = (code) => {
  const definition = ADD_INVENTORY_INLINE_ERRORS[code];
  if (!definition) return null;
  return resolveErrorFeedback({ code, ...definition, showCode: true });
};

export const ADD_INVENTORY_STATUS_FEEDBACK = {
  ITEM_SAVING: {
    type: "loading",
    display: "status",
    tone: "info",
    title: "Adding item…",
    message: "Please wait while the item is saved.",
  },
  INVENTORY_REFRESHING: {
    type: "loading",
    display: "status",
    tone: "info",
    title: "Refreshing inventory…",
    message: "Item saved. Updating inventory.",
  },
  INVENTORY_REFRESH_FAILED: {
    type: "critical",
    display: "status",
    tone: "error",
    title: "Inventory could not refresh",
    message: ADD_INVENTORY_FEEDBACK.REFRESH_FAILED,
    buttonLabel: "Retry refresh",
  },
};

export const getAddInventoryStatusFeedback = (code) => {
  const definition = ADD_INVENTORY_STATUS_FEEDBACK[code];
  if (!definition) return null;
  return resolveErrorFeedback({ code, ...definition });
};

export const ADD_INVENTORY_TOAST_FEEDBACK = {
  ITEM_ADDED: {
    type: "notification",
    toastType: "success",
    display: "toast",
    title: ADD_INVENTORY_FEEDBACK.ITEM_ADDED,
  },
};

export const getAddInventoryToastFeedback = (code, details = {}) => {
  const definition = ADD_INVENTORY_TOAST_FEEDBACK[code];
  if (!definition) return null;
  const resolved = resolveErrorFeedback(definition);
  const introduction = `${details.itemName} is now logged in your inventory\n`;
  const stock = ` ${details.initialStock} ${details.unit} | `;
  const cost = ` ${formatCurrency(details.totalCost)}`;
  const toastFeedback = {
    type: resolved.toastType,
    title: resolved.title,
    description: `${introduction}Initial Stock:${stock}Cost:${cost}`,
    timeout: 6000,
    data: {
      width: details.width || "32rem",
      actionTone: "success",
      descriptionParts: [
        { text: introduction },
        { label: "Initial Stock:" },
        { text: stock },
        { label: "Cost:" },
        { text: cost },
      ],
    },
  };
  if (details.onAddAnotherItem) {
    toastFeedback.actionProps = {
      children: "Add another item",
      onClick: details.onAddAnotherItem,
    };
  }
  return toastFeedback;
};
