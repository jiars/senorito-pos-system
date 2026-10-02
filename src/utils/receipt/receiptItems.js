// Display adapters only: order totals remain supplied by checkout/order history.
export const getPOSReceiptItems = (cartItems) => cartItems.map((item) => ({
  ...item,
  basePrice: item.basePrice ?? item.price,
  addOns: item.addOns || [],
}));

export const getOrderReceiptItems = (orderItems) => orderItems.map((item) => {
  let addonSum = 0;
  const addOns = (item.addons || []).map((orderAddon) => {
    const qty = Number(orderAddon.quantity) || 0;
    const price = Number(orderAddon.price) || 0;
    addonSum += price * qty;

    return {
      name: orderAddon.addon ? orderAddon.addon.addon_name : "Unknown Add-on",
      qty,
      price,
    };
  });

  return {
    name: item.menu_item ? item.menu_item.item_name : "Unknown Item",
    variant: item.variant ? item.variant.variant_name : "Regular",
    qty: Number(item.quantity) || 0,
    // Stored unit_price includes per-unit add-ons, which have their own rows.
    basePrice: (Number(item.unit_price) || 0) - addonSum,
    addOns,
  };
});
