export const canRequestOrderVoid = (order, userId, role) => {
  return role === "Cashier" && Boolean(userId) && order.cashier_id === userId;
};

export const getOrderVoidDisabledReason = (order) => {
  if (order.pending_void_request) return "A void request is already pending.";
  if (order.status !== "Completed") return "Only completed orders can be requested for void.";
  return "";
};

export const hasPendingOrderVoid = (order) => {
  return order.status === "Completed" && Boolean(order.pending_void_request)
    && order.pending_void_request.status === "pending";
};

export const isCountedSalesOrder = (order) => {
  return order.status !== "Cancelled" && order.status !== "Voided";
};

export const getVoidRequestStatusLabel = (status) => {
  if (status === "approved") return "Approved";
  if (status === "rejected") return "Rejected";
  return "Pending approval";
};

export const canReviewOrderVoid = (order, role) => {
  return role === "Owner" && hasPendingOrderVoid(order);
};

export const getVoidStaffName = (staff) => {
  if (!staff) return "Staff account";
  return `${staff.first_name} ${staff.last_name}`.trim();
};

export const canReturnOrderStock = (order) => {
  return order.stock_deductions_recorded === true;
};

export const getVoidStockHandlingLabel = (request) => {
  if (request.status !== "approved") return "";
  if (request.stock_handling === "return_stock") return "Unused stock returned to original batches.";
  if (request.stock_handling === "keep_deducted") return "Stock kept deducted.";
  return "Stock unchanged (approved before stock-return tracking).";
};
