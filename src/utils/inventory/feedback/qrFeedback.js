import { resolveErrorFeedback } from "@/utils/feedback/errorFeedback";

export const QR_FEEDBACK = {
  QR_ITEM_MISSING: "This QR item could not be found. Check the label.",
  QR_ITEM_ARCHIVED: "This inventory item is archived and cannot be restocked.",
  QR_LOAD_FAILED: "Could not load the QR item. Close this form and refresh Inventory.",
};

export const QR_STATUS_FEEDBACK = {
  QR_ITEM_MISSING: {
    title: "Item not found", message: QR_FEEDBACK.QR_ITEM_MISSING,
  },
  QR_ITEM_ARCHIVED: {
    title: "Item archived", message: QR_FEEDBACK.QR_ITEM_ARCHIVED,
  },
  QR_LOAD_FAILED: {
    title: "Unable to load item", message: QR_FEEDBACK.QR_LOAD_FAILED,
  },
};

export const getQrStatusFeedback = (code) => {
  const definition = QR_STATUS_FEEDBACK[code];
  if (!definition) return null;
  return resolveErrorFeedback({ code, ...definition, type: "critical", display: "status", tone: "error", showCode: true });
};
