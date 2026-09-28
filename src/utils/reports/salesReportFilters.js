const getLocalDate = (value) => {
  const date = new Date(value);

  if (Number.isNaN(date.getTime())) {
    return "";
  }

  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const day = String(date.getDate()).padStart(2, "0");

  return `${year}-${month}-${day}`;
};

const orderHasCategory = (order, selectedCategories = []) => {
  if (selectedCategories.length === 0) {
    return true;
  }

  const orderItems = order.order_items || [];

  return orderItems.some((orderItem) => {
    const menuItem = orderItem.menu_item;
    const category = menuItem ? menuItem.menu_categories : null;
    const categoryName = category ? category.category_name : "Uncategorized";

    return selectedCategories.some(
      (selectedCategory) =>
        categoryName.toLowerCase() === selectedCategory.toLowerCase(),
    );
  });
};

// Filter Orders without requesting Laravel again.
export const filterSalesOrders = (
  orders,
  fromDate,
  toDate,
  selectedSources = [],
  selectedCategories = [],
) => {
  return orders.filter((order) => {
    const orderDate = getLocalDate(order.order_datetime);
    const orderSource = order.order_source || "In-Store";

    if (fromDate && orderDate < fromDate) return false;
    if (toDate && orderDate > toDate) return false;

    if (
      selectedSources.length > 0 &&
      !selectedSources.some(
        (selectedSource) =>
          orderSource.toLowerCase() === selectedSource.toLowerCase(),
      )
    ) {
      return false;
    }

    return orderHasCategory(order, selectedCategories);
  });
};

// Wastage is affected only by the selected date range.
export const filterWastageRecords = (records, fromDate, toDate) => {
  return records.filter((record) => {
    const recordDate = getLocalDate(record.created_at);

    if (fromDate && recordDate < fromDate) return false;
    if (toDate && recordDate > toDate) return false;

    return true;
  });
};
