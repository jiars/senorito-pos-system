import { resolveErrorFeedback } from "@/utils/feedback/errorFeedback";

export const AUDIT_LOG_TOAST_FEEDBACK = {
  AUDIT_EXPORT_FAILED: {
    type: "notification",
    display: "toast",
    toastType: "error",
    title: "Could not export audit logs",
    message: "Try exporting again. (Code: AUDIT_EXPORT_FAILED)",
  },
};

export const getAuditLogToastFeedback = (code) => {
  const definition = AUDIT_LOG_TOAST_FEEDBACK[code];
  if (!definition) return null;
  const resolved = resolveErrorFeedback(definition);
  return {
    type: resolved.toastType,
    title: resolved.title,
    description: resolved.message,
    timeout: resolved.duration,
  };
};
