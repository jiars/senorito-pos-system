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

export const validateVoidStockHandling = (stockHandling, decision, canReturnStock) => {
  if (decision !== "approved") return "";
  if (!["keep_deducted", "return_stock"].includes(stockHandling)) return "Choose how to handle the deducted stock.";
  if (stockHandling === "return_stock" && !canReturnStock) return "Original stock tracking is unavailable. Choose Keep stock deducted.";
  return "";
};

export const getVoidReviewFieldErrors = (error) => {
  if (!error || !error.response || error.response.status !== 422) return {};
  const errors = error.response.data.errors;
  if (!errors) return {};
  return {
    stockHandling: errors.stock_handling ? errors.stock_handling[0] : "",
    reviewReason: errors.review_reason ? errors.review_reason[0] : "",
  };
};
