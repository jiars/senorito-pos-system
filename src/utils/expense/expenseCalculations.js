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
export const calculateExpenseSummary = (filteredExpenseRecords, netSales) => {
  const overallExpenses = filteredExpenseRecords.reduce(
    (sum, e) => sum + Number(e.amount),
    0
  );

  const totalInventoryPurchases = filteredExpenseRecords
    .filter((e) => e.expense_categories?.category_name === "Inventory Purchase")
    .reduce((sum, e) => sum + Number(e.amount), 0);

  const netOperational = netSales - overallExpenses;

  return { overallExpenses, totalInventoryPurchases, netOperational };
};

/**
 * Calculates the breakdown of expenses by category.
 * @param {Array} filteredExpenseRecords The filtered list of expense records.
 * @param {number} overallExpenses The total overall expenses amount.
 * @returns {Array} An array of objects representing category breakdowns, sorted by amount descending.
 */
export const calculateCategoryBreakdown = (filteredExpenseRecords, overallExpenses) => {
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
      pct: overallExpenses > 0 ? ((amount / overallExpenses) * 100).toFixed(2) : 0,
    }))
    .sort((a, b) => b.amount - a.amount);
};

/**
 * Calculates SVG properties (dashArray, dashOffset) for a circular chart.
 * @param {Array} categoryBreakdown The array of category breakdown objects.
 * @param {number} overallExpenses The total overall expenses amount.
 * @param {Object} categoryColorMap A map of category names to color hex codes.
 * @returns {Array} Array of segment objects with SVG rendering data.
 */
export const calculateChartSegments = (categoryBreakdown, overallExpenses, categoryColorMap) => {
  const radius = 80;
  const circumference = 2 * Math.PI * radius;
  let offset = 0;

  return categoryBreakdown.map((cat) => {
    const proportion = overallExpenses > 0 ? cat.amount / overallExpenses : 0;
    const dashArray = proportion * circumference;
    const gap = circumference - dashArray;
    const dashOffset = circumference - offset;
    offset += dashArray;

    return {
      ...cat,
      dashArray,
      gap,
      dashOffset,
      color: categoryColorMap[cat.category] || "#888888",
    };
  });
};
