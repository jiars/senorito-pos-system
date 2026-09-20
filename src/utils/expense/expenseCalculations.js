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

  const operatingCategoryTotals = normalizedRecords.reduce(
    (totals, expense) => {
      if (expense.normalizedCategory === "inventory purchase") {
        return totals;
      }

      const categoryName =
        expense.expense_categories?.category_name || "Uncategorized";

      totals[categoryName] =
        (totals[categoryName] || 0) + expense.numericAmount;

      return totals;
    },
    {},
  );

  const topOperatingExpenseEntry = Object.entries(operatingCategoryTotals).sort(
    ([, amountA], [, amountB]) => amountB - amountA,
  )[0];

  const topOperatingExpense = topOperatingExpenseEntry
    ? {
        category: topOperatingExpenseEntry[0],
        amount: topOperatingExpenseEntry[1],
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
    topOperatingExpense,
    expenseTransactionCount: normalizedRecords.length,
    netOperational,
  };
};

/**
 * Groups expenses into the current Sunday-to-Saturday week used by Dashboard.
 * Missing calendar days remain visible with a zero total.
 */
export const calculateExpenseDistributionData = (expenseRecords = []) => {
  const totalsByDate = expenseRecords.reduce((totals, expense) => {
    const dateKey = String(expense.expense_date ?? "").slice(0, 10);

    if (!dateKey) {
      return totals;
    }

    totals[dateKey] = (totals[dateKey] || 0) + (Number(expense.amount) || 0);

    return totals;
  }, {});

  const startOfWeek = new Date();
  startOfWeek.setHours(0, 0, 0, 0);
  startOfWeek.setDate(startOfWeek.getDate() - startOfWeek.getDay());

  return Array.from({ length: 7 }, (_, dayIndex) => {
    const currentDate = new Date(startOfWeek);
    currentDate.setDate(startOfWeek.getDate() + dayIndex);

    const timezoneOffset = currentDate.getTimezoneOffset() * 60 * 1000;
    const date = new Date(currentDate.getTime() - timezoneOffset)
      .toISOString()
      .slice(0, 10);

    return {
      date,
      label: currentDate.toLocaleDateString("en-US", { weekday: "short" }),
      amount: totalsByDate[date] || 0,
    };
  });
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
