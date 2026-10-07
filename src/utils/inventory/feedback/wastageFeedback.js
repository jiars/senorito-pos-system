import { resolveErrorFeedback } from "@/utils/feedback/errorFeedback";

// Wastage copy only; timing and HTTP classification stay shared.
export const WASTAGE_FEEDBACK = {
  SAVE_FAILED: "Couldn’t record wastage. Please try again.",
  REFRESH_FAILED: "Wastage saved. Couldn’t refresh inventory.",
  WASTAGE_SAVED: "Wastage recorded.",
  SESSION_EXPIRED: "Session expired. Sign in again.",
  PERMISSION_DENIED: "You don’t have permission to record wastage.",
  VALIDATION_FAILED: "Some details were rejected. Review your inputs.",
  SAVE_UNCONFIRMED:
    "Couldn’t confirm the save. Check stock and wastage logs before trying again.",
  SPILLOVER_NOTICE:
    "Quantity exceeds the selected batch's stock. Spillover will be applied to other batches.",
};

export const WASTAGE_INLINE_ERRORS = {
  SAVE_FAILED: { type: "critical", message: WASTAGE_FEEDBACK.SAVE_FAILED },
  REFRESH_FAILED: {
    type: "critical",
    message: WASTAGE_FEEDBACK.REFRESH_FAILED,
  },
  SESSION_EXPIRED: {
    type: "critical",
    message: WASTAGE_FEEDBACK.SESSION_EXPIRED,
  },
  PERMISSION_DENIED: {
    type: "critical",
    message: WASTAGE_FEEDBACK.PERMISSION_DENIED,
  },
  VALIDATION_FAILED: {
    type: "validation",
    message: WASTAGE_FEEDBACK.VALIDATION_FAILED,
  },
  SAVE_UNCONFIRMED: {
    type: "critical",
    message: WASTAGE_FEEDBACK.SAVE_UNCONFIRMED,
    buttonLabel: "Check stock first",
  },
};

export const getWastageInlineFeedback = (code) => {
  const definition = WASTAGE_INLINE_ERRORS[code];
  if (!definition) return null;
  return resolveErrorFeedback({ code, ...definition, showCode: true });
};

export const WASTAGE_STATUS_FEEDBACK = {
  STOCK_SAVING: {
    type: "loading",
    display: "status",
    tone: "info",
    title: "Saving wastage…",
    message: "Please wait while wastage is recorded.",
  },
  INVENTORY_REFRESHING: {
    type: "loading",
    display: "status",
    tone: "info",
    title: "Refreshing inventory…",
    message: "Wastage saved. Updating inventory.",
  },
  INVENTORY_REFRESH_FAILED: {
    type: "critical",
    display: "status",
    tone: "error",
    title: "Inventory could not refresh",
    message: WASTAGE_FEEDBACK.REFRESH_FAILED,
    buttonLabel: "Retry refresh",
  },
};

export const getWastageStatusFeedback = (code) => {
  const definition = WASTAGE_STATUS_FEEDBACK[code];
  if (!definition) return null;
  return resolveErrorFeedback({ code, ...definition });
};

export const WASTAGE_TOAST_FEEDBACK = {
  WASTAGE_SAVED: {
    type: "notification",
    toastType: "success",
    display: "toast",
    title: WASTAGE_FEEDBACK.WASTAGE_SAVED,
    timeout: 6000,
    buttonLabel: "Log wastage again",
    actionTone: "success",
  },
};

export const getWastageToastFeedback = (code, details = {}) => {
  const definition = WASTAGE_TOAST_FEEDBACK[code];
  if (!definition) return null;
  const resolved = resolveErrorFeedback(definition);
  const toastFeedback = {
    type: resolved.toastType,
    title: resolved.title,
    description: resolved.description,
    timeout: definition.timeout || resolved.duration,
  };

  if (code === "WASTAGE_SAVED") {
    const caption = [
      `Removed ${details.quantity} ${details.unit} from ${details.itemName}. Reason: ${details.reason}`,
    ];
    const summary = [];
    if (details.totalStock !== undefined && details.totalStock !== null) {
      summary.push(`New Total Stock: ${details.totalStock} ${details.unit}`);
    }

    // The save response does not list actual spillover batches.
    let batchLabel = "Batch";
    if (details.hasSpillover) batchLabel = "Starting Batch";
    if (details.batchNumber)
      summary.push(`${batchLabel}: ${details.batchNumber}`);
    if (summary.length > 0) caption.push(summary.join(" | "));
    toastFeedback.description = caption.join("\n");
    const descriptionParts = [
      { text: `Removed ${details.quantity} ${details.unit} from ` },
      { label: details.itemName },
      { text: `. Reason: ${details.reason}` },
    ];
    if (summary.length > 0) descriptionParts.push({ text: "\n" });
    const hasTotalStock = details.totalStock !== undefined && details.totalStock !== null;
    if (hasTotalStock) {
      descriptionParts.push(
        { label: "New Total Stock:" },
        { text: ` ${details.totalStock} ${details.unit}` },
      );
    }
    if (details.batchNumber) {
      if (hasTotalStock) descriptionParts.push({ text: " | " });
      descriptionParts.push(
        { label: `${batchLabel}:` },
        { text: ` ${details.batchNumber}` },
      );
    }
    toastFeedback.data = { width: "38rem", descriptionParts };

    if (details.onWastageAgain) {
      toastFeedback.data.actionTone = definition.actionTone;
      toastFeedback.actionProps = {
        children: definition.buttonLabel,
        onClick: details.onWastageAgain,
      };
    }
  }

  return toastFeedback;
};
