import { getBusinessPeriodDates } from "@/utils/shared/formatters/businessDates";

export const filterExpenseRecords = (
  visibleExpenses,
  searchTerm,
  fromDate,
  toDate,
  selectedCategories = [],
) => {
  const normalizedSearch = searchTerm.trim().toLowerCase();

  return visibleExpenses.filter((record) => {
    const categoryName =
      record.expense_categories?.category_name || "Uncategorized";
    const description = String(record.description ?? "").toLowerCase();
    const vendor = String(record.vendor ?? "").toLowerCase();

    const matchesSearch =
      normalizedSearch.length === 0 ||
      categoryName.toLowerCase().includes(normalizedSearch) ||
      description.includes(normalizedSearch) ||
      vendor.includes(normalizedSearch);

    const matchesCategory =
      selectedCategories.length === 0 ||
      selectedCategories.includes(categoryName);

    const recordDate = String(record.expense_date ?? "").slice(0, 10);
    const matchesFromDate = !fromDate || recordDate >= fromDate;
    const matchesToDate = !toDate || recordDate <= toDate;

    return matchesSearch && matchesCategory && matchesFromDate && matchesToDate;
  });
};

export const getDateRangeFromPreset = (preset) => {
  if (preset === "All Time" || preset === "Custom")
    return { start: "", end: "" };

  const periods = { "This Day": "today", "This Week": "week", "This Month": "month" };
  const period = periods[preset];
  if (!period) return { start: "", end: "" };
  const dates = getBusinessPeriodDates(period);
  return { start: dates.fromDate, end: dates.toDate };
};
