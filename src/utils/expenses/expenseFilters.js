import { getBusinessPeriodDates } from "@/utils/shared/formatters/businessDates";

export const expenseSortOptions = [
  { label: "Latest", value: "latest" },
  { label: "Oldest", value: "oldest" },
  { label: "Highest Amount", value: "highest-amount" },
  { label: "Lowest Amount", value: "lowest-amount" },
];

// Sort a copy so API records keep their original order.
export const sortExpenseRecords = (records, sortBy = "latest") => {
  return [...records].sort((first, second) => {
    const amountDifference = (Number(second.amount) || 0) - (Number(first.amount) || 0);
    if (sortBy === "highest-amount" && amountDifference !== 0) return amountDifference;
    if (sortBy === "lowest-amount" && amountDifference !== 0) return -amountDifference;

    const dateDifference = new Date(second.expense_date) - new Date(first.expense_date);
    const createdDifference = new Date(second.created_at) - new Date(first.created_at);
    const latestDifference = dateDifference || createdDifference || String(first.id).localeCompare(String(second.id));
    if (sortBy === "oldest") return -latestDifference;
    return latestDifference;
  });
};

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
