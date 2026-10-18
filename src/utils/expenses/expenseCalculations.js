import { formatDate } from "@/utils/shared/formatters/dateFormatters";

// Premium Color Palette for Categories
export const CATEGORY_PALETTE = [
  "#4E342E", // Deep Brown
  "#827717", // Olive Green
  "#BF360C", // Earthy Red
  "#E65100", // Earthy Orange
  "#5D4037", // Dark Brown
  "#8D6E63", // Light Brown
  "#3E2723", // Very Dark Brown
  "#795548", // Standard Brown
  "#6D4C41", // Medium Brown
  "#A1887F", // Soft Brown
];

/**
 * Maps category names to colors from the palette.
 * @param {Array} categories List of category objects from the DB.
 * @returns {Object} A map of category names to hex color codes.
 */
export const buildCategoryColorMap = (categories) => {
  const map = {};
  categories.forEach((cat, idx) => {
    map[cat.category_name] = CATEGORY_PALETTE[idx % CATEGORY_PALETTE.length];
  });
  return map;
};

/**
 * Calculates top-level expense summaries.
 * @param {Array} filteredExpenseRecords The filtered list of expense records.
 * @param {number} netSales Total net sales from the sales report.
 * @returns {Object} Summary totals (overallExpenses, totalInventoryPurchases, netOperational)
 */
export const calculateExpenseSummary = (
  filteredExpenseRecords,
  netSales = 0,
) => {
  const normalizedRecords = filteredExpenseRecords.map((expense) => ({
    ...expense,
    normalizedCategory:
      expense.expense_categories?.category_name?.trim().toLowerCase() ??
      "uncategorized",
    numericAmount: Number(expense.amount) || 0,
  }));

  const overallExpenses = normalizedRecords.reduce(
    (total, expense) => total + expense.numericAmount,
    0,
  );

  const salaryRecords = normalizedRecords.filter((expense) =>
    ["salary", "salaries"].includes(expense.normalizedCategory),
  );

  const salaryExpenses = salaryRecords.reduce(
    (total, expense) => total + expense.numericAmount,
    0,
  );

  const inventoryPurchaseRecords = normalizedRecords.filter(
    (expense) => expense.normalizedCategory === "inventory purchase",
  );

  const totalInventoryPurchases = inventoryPurchaseRecords.reduce(
    (total, expense) => total + expense.numericAmount,
    0,
  );

  const categoryTotals = normalizedRecords.reduce(
    (totals, expense) => {
      const categoryName =
        expense.expense_categories?.category_name || "Uncategorized";

      totals[categoryName] =
        (totals[categoryName] || 0) + expense.numericAmount;

      return totals;
    },
    {},
  );

  const topExpenseCategoryEntry = Object.entries(categoryTotals).sort(
    ([, amountA], [, amountB]) => amountB - amountA,
  )[0];

  const topExpenseCategory = topExpenseCategoryEntry
    ? {
        category: topExpenseCategoryEntry[0],
        amount: topExpenseCategoryEntry[1],
      }
    : {
        category: "No data",
        amount: 0,
      };

  const inventoryPurchasePercentage =
    overallExpenses > 0
      ? Math.round((totalInventoryPurchases / overallExpenses) * 100)
      : 0;

  // Temporarily retained for the existing Excel export.
  const netOperational = netSales - overallExpenses;

  return {
    overallExpenses,
    salaryExpenses,
    salaryTransactionCount: salaryRecords.length,
    totalInventoryPurchases,
    inventoryPurchasePercentage,
    topExpenseCategory,
    expenseTransactionCount: normalizedRecords.length,
    netOperational,
  };
};

// Group the selected range, not a second independent current-week filter.
export const calculateExpenseDistributionData = (
  expenseRecords = [],
  fromDate = "",
  toDate = "",
  datePreset = "All Time",
) => {
  const recordedDates = expenseRecords
    .map((expense) => String(expense.expense_date || "").slice(0, 10))
    .filter((date) => Boolean(date))
    .sort();

  // All Time uses the earliest/latest matching record, including filtered categories.
  const rangeStart = fromDate || recordedDates[0];
  const rangeEnd = toDate || recordedDates.at(-1);
  if (!rangeStart || !rangeEnd || rangeStart > rangeEnd) return [];

  // Manila date-only labels are stepped in UTC so device timezone/DST cannot shift them.
  const start = new Date(`${rangeStart}T00:00:00Z`);
  const end = new Date(`${rangeEnd}T00:00:00Z`);
  const dayCount = Math.round((end - start) / 86400000) + 1;
  let grouping = "daily";
  if (dayCount > 731) {
    grouping = "yearly";
  } else if (dayCount > 90) {
    grouping = "monthly";
  } else if (dayCount > 14 || datePreset === "This Month") {
    grouping = "weekly";
  }

  const includesMultipleYears = start.getUTCFullYear() !== end.getUTCFullYear();
  const periods = [];
  const cursor = new Date(start);

  while (cursor <= end) {
    const periodEnd = new Date(cursor);
    if (grouping === "weekly") {
      periodEnd.setUTCDate(cursor.getUTCDate() + 6 - cursor.getUTCDay());
    } else if (grouping === "monthly") {
      periodEnd.setUTCMonth(cursor.getUTCMonth() + 1, 0);
    } else if (grouping === "yearly") {
      periodEnd.setUTCMonth(11, 31);
    }
    // Partial weeks/months/years count only dates inside the selected range.
    if (periodEnd > end) periodEnd.setTime(end.getTime());

    const date = cursor.toISOString().slice(0, 10);
    const endDate = periodEnd.toISOString().slice(0, 10);
    let label = cursor.toLocaleDateString("en-US", {
      month: "short",
      day: "numeric",
      timeZone: "UTC",
    });

    if (grouping === "daily" && dayCount <= 7) {
      label = cursor.toLocaleDateString("en-US", {
        weekday: "short",
        timeZone: "UTC",
      });
    } else if (grouping === "weekly" && date !== endDate) {
      const endLabel = periodEnd.toLocaleDateString("en-US", {
        month: "short",
        day: "numeric",
        timeZone: "UTC",
      });
      label = `${label} - ${endLabel}`;
    } else if (grouping === "monthly") {
      const monthOptions = { month: "short", timeZone: "UTC" };
      if (includesMultipleYears) monthOptions.year = "numeric";
      label = cursor.toLocaleDateString("en-US", monthOptions);
    } else if (grouping === "yearly") {
      label = String(cursor.getUTCFullYear());
    }

    let periodLabel = formatDate(date);
    if (date !== endDate) periodLabel += ` - ${formatDate(endDate)}`;
    periods.push({ date, endDate, label, periodLabel, grouping, amount: 0 });
    cursor.setTime(periodEnd.getTime());
    cursor.setUTCDate(cursor.getUTCDate() + 1);
  }

  expenseRecords.forEach((expense) => {
    const date = String(expense.expense_date || "").slice(0, 10);
    const period = periods.find((row) => date >= row.date && date <= row.endDate);
    if (period) period.amount += Number(expense.amount) || 0;
  });

  return periods;
};

/**
 * Calculates the breakdown of expenses by category.
 * @param {Array} filteredExpenseRecords The filtered list of expense records.
 * @param {number} overallExpenses The total overall expenses amount.
 * @returns {Array} An array of objects representing category breakdowns, sorted by amount descending.
 */
export const calculateCategoryBreakdown = (
  filteredExpenseRecords,
  overallExpenses,
) => {
  const categoryTotals = {};

  filteredExpenseRecords.forEach((e) => {
    const catName = e.expense_categories?.category_name || "Uncategorized";
    if (!categoryTotals[catName]) categoryTotals[catName] = 0;
    categoryTotals[catName] += Number(e.amount);
  });

  return Object.entries(categoryTotals)
    .map(([category, amount]) => ({
      category,
      amount,
      pct:
        overallExpenses > 0 ? ((amount / overallExpenses) * 100).toFixed(2) : 0,
    }))
    .sort((a, b) => b.amount - a.amount);
};
