export const getOrderCashierName = (order) => {
  if (!order.cashier) return "Owner / System";
  const name = `${order.cashier.first_name || ""} ${order.cashier.last_name || ""}`.trim();
  return name || "Owner / System";
};

export const getOrderRecordedByOptions = (orders) => {
  const names = [...new Set(orders.map(getOrderCashierName))];
  names.sort((first, second) => first.localeCompare(second));
  return names.map((name) => {
    return { label: name, value: name };
  });
};
