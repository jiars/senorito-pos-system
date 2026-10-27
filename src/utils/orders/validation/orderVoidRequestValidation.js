export const VOID_REASON_MAX_LENGTH = 500;

export const validateOrderVoidReason = (reason) => {
  if (!reason.trim()) return "Enter a reason for requesting this void.";
  if (reason.trim().length > VOID_REASON_MAX_LENGTH) return "Keep the reason within 500 characters.";
  return "";
};

export const validateVoidReviewReason = (reason, decision) => {
  if (decision === "rejected" && !reason.trim()) return "Enter a reason for rejecting this request.";
  if (reason.trim().length > VOID_REASON_MAX_LENGTH) return "Keep the reason within 500 characters.";
  return "";
};
