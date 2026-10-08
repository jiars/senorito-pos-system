import { resolveErrorFeedback } from "@/utils/feedback/errorFeedback";
import { formatCurrency } from "@/utils/shared/formatters/currencyFormatters";

// Restock copy only; shared policies own timing and presentation behavior.
export const RESTOCK_FEEDBACK = {
  SAVE_FAILED: "Couldn’t save changes. Please try again.",
  REFRESH_FAILED: "Stock saved. Couldn’t refresh inventory.",
  RESTOCK_SAVED: "Stock updated successfully",

  SESSION_EXPIRED: "Session expired. Sign in again.",
  PERMISSION_DENIED: "You don’t have permission to restock.",
  VALIDATION_FAILED: "Some details were rejected. Review your inputs.",
  SAVE_UNCONFIRMED:
    "Couldn’t confirm the save. Check stock before trying again.",
};

export const RESTOCK_INLINE_ERRORS = {
  SAVE_FAILED: {
    type: "critical",
    message: RESTOCK_FEEDBACK.SAVE_FAILED,
  },
  REFRESH_FAILED: {
    type: "critical",
    message: RESTOCK_FEEDBACK.REFRESH_FAILED,
  },
  SESSION_EXPIRED: {
    type: "critical",
    message: RESTOCK_FEEDBACK.SESSION_EXPIRED,
  },
  PERMISSION_DENIED: {
    type: "critical",
    message: RESTOCK_FEEDBACK.PERMISSION_DENIED,
  },
  VALIDATION_FAILED: {
    type: "validation",
    message: RESTOCK_FEEDBACK.VALIDATION_FAILED,
  },
  SAVE_UNCONFIRMED: {
    type: "critical",
    message: RESTOCK_FEEDBACK.SAVE_UNCONFIRMED,
    buttonLabel: "Check stock first",
  },
};

export const getRestockInlineFeedback = (code) => {
  const definition = RESTOCK_INLINE_ERRORS[code];
  if (!definition) return null;
  return resolveErrorFeedback({ code, ...definition, showCode: true });
};

export const RESTOCK_STATUS_FEEDBACK = {
  STOCK_SAVING: {
    type: "loading",
    display: "status",
    tone: "info",
    title: "Saving stock…",
    message: "Please wait while the stock change is saved.",
  },
  INVENTORY_REFRESHING: {
    type: "loading",
    display: "status",
    tone: "info",
    title: "Refreshing inventory…",
    message: "Stock saved. Updating inventory.",
  },
  INVENTORY_REFRESH_FAILED: {
    type: "critical",
    display: "status",
    tone: "error",
    title: "Inventory could not refresh",
    message: RESTOCK_FEEDBACK.REFRESH_FAILED,
    buttonLabel: "Retry refresh",
  },
};

export const getRestockStatusFeedback = (code) => {
  const definition = RESTOCK_STATUS_FEEDBACK[code];
  if (!definition) return null;
  return resolveErrorFeedback({ code, ...definition });
};

export const RESTOCK_TOAST_FEEDBACK = {
  RESTOCK_SAVED: {
    type: "notification",
    toastType: "success",
    display: "toast",
    title: RESTOCK_FEEDBACK.RESTOCK_SAVED,
    timeout: 6000,
    buttonLabel: "Restock again",
    actionTone: "success",
  },
};

export const getRestockToastFeedback = (code, details = {}) => {
  const definition = RESTOCK_TOAST_FEEDBACK[code];
  if (!definition) return null;

  const resolved = resolveErrorFeedback(definition);
  const toastFeedback = {
    type: resolved.toastType,
    title: resolved.title,
    description: resolved.description,
    timeout: definition.timeout || resolved.duration,
  };

  if (code === "RESTOCK_SAVED") {
    const caption = [
      `Added ${details.quantity} ${details.unit} to ${details.itemName}.`,
    ];
    const summary = [];
    if (details.totalStock !== undefined && details.totalStock !== null) {
      summary.push(`New Total Stock: ${details.totalStock} ${details.unit}`);
    }
    summary.push(`Total Cost: ${formatCurrency(details.totalCost)}`);
    caption.push(summary.join(" | "));
    toastFeedback.description = caption.join("\n");
    const descriptionParts = [
      { text: `Added ${details.quantity} ${details.unit} to ` },
      { label: details.itemName },
      { text: ".\n" },
    ];
    if (details.totalStock !== undefined && details.totalStock !== null) {
      descriptionParts.push(
        { label: "New Total Stock:" },
        { text: ` ${details.totalStock} ${details.unit} | ` },
      );
    }
    descriptionParts.push(
      { label: "Total Cost:" },
      { text: ` ${formatCurrency(details.totalCost)}` },
    );
    toastFeedback.data = { width: "32rem", descriptionParts };
    if (details.onRestockAgain) {
      toastFeedback.data.actionTone = definition.actionTone;
      toastFeedback.actionProps = {
        children: definition.buttonLabel,
        onClick: details.onRestockAgain,
      };
    }
  }

  return toastFeedback;
};
