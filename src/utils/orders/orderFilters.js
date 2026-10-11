export const getOrderCashierName = (order) => {
  if (!order.cashier) return "Owner / System";
  const name = `${order.cashier.first_name || ""} ${order.cashier.last_name || ""}`.trim();
  return name || "Owner / System";
};

// Only show the uploader when another staff member uploaded this sale.
export const getOrderUploaderName = (order) => {
  if (!order.uploaded_by || !order.cashier_id) return "";
  if (order.uploaded_by === order.cashier_id) return "";
  if (!order.uploader) return "Name unavailable";

  const name = `${order.uploader.first_name || ""} ${order.uploader.last_name || ""}`.trim();
  return name || "Name unavailable";
};

export const getOrderRecordedByOptions = (orders) => {
  const names = [...new Set(orders.map(getOrderCashierName))];
  names.sort((first, second) => first.localeCompare(second));
  return names.map((name) => {
    return { label: name, value: name };
  });
};
