import { resolveErrorFeedback } from "@/utils/feedback/errorFeedback";

// Module copy only; timing and HTTP classification stay shared.
export const CORRECTION_FEEDBACK = {
  SAVE_FAILED: "Couldn’t save correction. Please try again.",
  REFRESH_FAILED: "Correction saved. Couldn’t refresh inventory.",
  CORRECTION_SAVED: "Stock corrected successfully",
  SESSION_EXPIRED: "Session expired. Sign in again.",
  PERMISSION_DENIED: "You don’t have permission to correct stock.",
  VALIDATION_FAILED: "Some details were rejected. Review your inputs.",
  SAVE_UNCONFIRMED:
    "Couldn’t confirm the save. Check stock and correction logs before trying again.",
};

export const CORRECTION_INLINE_ERRORS = {
  SAVE_FAILED: {
    type: "critical",
    message: CORRECTION_FEEDBACK.SAVE_FAILED,
  },
  REFRESH_FAILED: {
    type: "critical",
    message: CORRECTION_FEEDBACK.REFRESH_FAILED,
  },
  SESSION_EXPIRED: {
    type: "critical",
    message: CORRECTION_FEEDBACK.SESSION_EXPIRED,
  },
  PERMISSION_DENIED: {
    type: "critical",
    message: CORRECTION_FEEDBACK.PERMISSION_DENIED,
  },
  VALIDATION_FAILED: {
    type: "validation",
    message: CORRECTION_FEEDBACK.VALIDATION_FAILED,
  },
  SAVE_UNCONFIRMED: {
    type: "critical",
    message: CORRECTION_FEEDBACK.SAVE_UNCONFIRMED,
    buttonLabel: "Check stock first",
  },
};

export const getCorrectionInlineFeedback = (code) => {
  const definition = CORRECTION_INLINE_ERRORS[code];
  if (!definition) return null;
  return resolveErrorFeedback({ code, ...definition, showCode: true });
};

export const CORRECTION_STATUS_FEEDBACK = {
  STOCK_SAVING: {
    type: "loading",
    display: "status",
    tone: "info",
    title: "Saving correction…",
    message: "Please wait while the correction is saved.",
  },
  INVENTORY_REFRESHING: {
    type: "loading",
    display: "status",
    tone: "info",
    title: "Refreshing inventory…",
    message: "Correction saved. Updating inventory.",
  },
  INVENTORY_REFRESH_FAILED: {
    type: "critical",
    display: "status",
    tone: "error",
    title: "Inventory could not refresh",
    message: CORRECTION_FEEDBACK.REFRESH_FAILED,
    buttonLabel: "Retry refresh",
  },
};

export const getCorrectionStatusFeedback = (code) => {
  const definition = CORRECTION_STATUS_FEEDBACK[code];
  if (!definition) return null;
  return resolveErrorFeedback({ code, ...definition });
};

export const CORRECTION_TOAST_FEEDBACK = {
  CORRECTION_SAVED: {
    type: "notification",
    toastType: "success",
    display: "toast",
    title: CORRECTION_FEEDBACK.CORRECTION_SAVED,
    timeout: 6000,
    buttonLabel: "Correct stock again",
    actionTone: "success",
  },
};

export const getCorrectionToastFeedback = (code, details = {}) => {
  const definition = CORRECTION_TOAST_FEEDBACK[code];
  if (!definition) return null;

  const resolved = resolveErrorFeedback(definition);
  const toastFeedback = {
    type: resolved.toastType,
    title: resolved.title,
    timeout: definition.timeout || resolved.duration,
  };

  if (code === "CORRECTION_SAVED") {
    const caption = [
      `${details.itemName} stock has been adjusted to ${details.actualCount} ${details.unit}`,
      `Reason: ${details.reason} | Batch: ${details.batchNumber}`,
    ];

    toastFeedback.description = caption.join("\n");
    toastFeedback.data = {
      width: "38rem",
      descriptionParts: [
        { label: details.itemName },
        { text: ` stock has been adjusted to ${details.actualCount} ${details.unit}\n` },
        { label: "Reason:" }, { text: ` ${details.reason} | ` },
        { label: "Batch:" }, { text: ` ${details.batchNumber}` },
      ],
    };

    if (details.onCorrectionAgain) {
      toastFeedback.data.actionTone = definition.actionTone;
      toastFeedback.actionProps = {
        children: definition.buttonLabel,
        onClick: details.onCorrectionAgain,
      };
    }
  }

  return toastFeedback;
};
