export const getSalesCategory = (orderItem) => {
  const menuItem = orderItem.menu_item;
  if (!menuItem || !menuItem.menu_categories) return "Uncategorized";
  return menuItem.menu_categories.category_name;
};

export const matchesSalesCategory = (category, selectedCategories = []) => {
  if (selectedCategories.length === 0) return true;
  return selectedCategories.some((selected) => {
    return category.toLowerCase() === selected.toLowerCase();
  });
};

export const getSalesCents = (value) => {
  return Math.round((Number(value) || 0) * 100);
};

// Allocate recorded money, not current menu prices. Largest remainders receive
// the leftover centavos so the lines always add up to the recorded order total.
const allocateCents = (totalCents, weights) => {
  const totalWeight = weights.reduce((sum, weight) => sum + weight, 0);
  if (totalWeight === 0) return weights.map(() => 0);

  const shares = weights.map((weight, index) => {
    const exactShare = totalCents * weight / totalWeight;
    const cents = Math.floor(exactShare);
    return { index, cents, remainder: exactShare - cents };
  });
  const allocated = shares.reduce((sum, share) => sum + share.cents, 0);
  const remainderOrder = [...shares].sort((first, second) => {
    return second.remainder - first.remainder || first.index - second.index;
  });
  for (let index = 0; index < totalCents - allocated; index++) {
    remainderOrder[index].cents += 1;
  }
  return shares.map((share) => share.cents);
};

export const getCategoryScopedOrder = (order, selectedCategories = []) => {
  let items = order.order_items || [];
  let weights = items.map((item) => Math.max(0, getSalesCents(item.subtotal)));
  const lineTotal = weights.reduce((sum, weight) => sum + weight, 0);
  let grossCents = lineTotal;
  if (order.subtotal != null) grossCents = getSalesCents(order.subtotal);
  let netCents = grossCents;
  if (order.total != null) netCents = getSalesCents(order.total);

  // Keep old receipts with missing item details in financial history, without
  // inventing a product or assigning their revenue to an unrelated category.
  if (lineTotal === 0 && (grossCents !== 0 || netCents !== 0)) {
    items = [...items, { menu_item: null, quantity: 0, subtotal: 0 }];
    weights = [...weights, 1];
  }
  const grossShares = allocateCents(grossCents, weights);
  const netShares = allocateCents(netCents, weights);
  const scopedItems = [];
  let selectedGross = 0;
  let selectedNet = 0;

  items.forEach((item, index) => {
    if (!matchesSalesCategory(getSalesCategory(item), selectedCategories)) return;
    selectedGross += grossShares[index];
    selectedNet += netShares[index];
    // Stored item subtotals already include add-ons. Do not add them again.
    scopedItems.push({
      ...item,
      report_gross_subtotal: grossShares[index] / 100,
      report_net_subtotal: netShares[index] / 100,
    });
  });

  if (selectedCategories.length > 0 && scopedItems.length === 0) return null;
  return {
    ...order,
    subtotal: selectedGross / 100,
    total: selectedNet / 100,
    order_items: scopedItems,
  };
};
