import {
  getBusinessDateKey,
  getBusinessPeriodDates,
} from "@/utils/shared/formatters/businessDates";
import { matchesOrderSource } from "@/utils/orders/orderOptions";
import { getCategoryScopedOrder } from "./salesRevenue";
import { isCountedSalesOrder } from "@/utils/orders/orderVoidUtils";

export const getSalesReportPresetDates = (reportPeriod) => {
  if (reportPeriod === "All Time") return getBusinessPeriodDates("all");
  if (reportPeriod === "Today") return getBusinessPeriodDates("today");
  if (reportPeriod === "This Week") return getBusinessPeriodDates("week");
  return getBusinessPeriodDates("month");
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
    if (!isCountedSalesOrder(order)) return false;
    const orderDate = getBusinessDateKey(order.order_datetime);
    const orderSource = order.order_source || "In-Store";

    if (fromDate && orderDate < fromDate) return false;
    if (toDate && orderDate > toDate) return false;

    if (!matchesOrderSource(orderSource, selectedSources)) return false;

    return true;
  }).map((order) => {
    // Allocate discounts before selecting categories, never after removing lines.
    return getCategoryScopedOrder(order, selectedCategories);
  }).filter(Boolean);
};

// Wastage is affected only by the selected date range.
export const filterWastageRecords = (records, fromDate, toDate) => {
  return records.filter((record) => {
    const recordDate = getBusinessDateKey(record.created_at);

    if (fromDate && recordDate < fromDate) return false;
    if (toDate && recordDate > toDate) return false;

    return true;
  });
};
