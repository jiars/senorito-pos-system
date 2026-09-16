/**
 * Filters the visible expense records by search term and date range.
 * @param {Array} visibleExpenses The base list of visible expenses.
 * @param {string} searchTerm The current search term.
 * @param {string} fromDate The start date filter.
 * @param {string} toDate The end date filter.
 * @returns {Array} The filtered list of expense records.
 */
export const filterExpenseRecords = (visibleExpenses, searchTerm, fromDate, toDate) => {
  return visibleExpenses.filter((record) => {
    // Search
    const searchLower = searchTerm.toLowerCase();
    const categoryName = record.expense_categories?.category_name || "Uncategorized";

    // Clean description to make startsWith more useful (e.g., removing 'Wastage: ' or 'Restock: ' prefix)
    let searchDesc = record.description.toLowerCase();
    if (searchDesc.startsWith("wastage: ")) searchDesc = searchDesc.replace("wastage: ", "");
    if (searchDesc.startsWith("restock: ")) searchDesc = searchDesc.replace("restock: ", "");

    const matchesSearch =
      categoryName.toLowerCase().startsWith(searchLower) ||
      searchDesc.startsWith(searchLower) ||
      (record.vendor && record.vendor.toLowerCase().startsWith(searchLower));

    // Date
    let matchesDate = true;
    if (fromDate || toDate) {
      const recordDate = new Date(record.expense_date);
      if (fromDate) {
        const start = new Date(fromDate);
        start.setHours(0, 0, 0, 0);
        if (recordDate < start) matchesDate = false;
      }
      if (toDate) {
        const end = new Date(toDate);
        end.setHours(23, 59, 59, 999);
        if (recordDate > end) matchesDate = false;
      }
    }

    return matchesSearch && matchesDate;
  });
};

/**
 * Returns the date range based on a selected preset.
 * @param {string} preset The selected preset (e.g. 'Today', 'This Month').
 * @returns {Object} An object containing { start, end } formatted date strings.
 */
export const getDateRangeFromPreset = (preset) => {
  const now = new Date();
  
  if (preset === "All Time" || preset === "Custom") {
    return { start: "", end: "" };
  } 

  if (preset === "This Month") {
    const start = new Date(now.getFullYear(), now.getMonth(), 1);
    const end = new Date(now.getFullYear(), now.getMonth() + 1, 0);
    return { 
      start: start.toISOString().split("T")[0], 
      end: end.toISOString().split("T")[0] 
    };
  } 

  if (preset === "Last Month") {
    const start = new Date(now.getFullYear(), now.getMonth() - 1, 1);
    const end = new Date(now.getFullYear(), now.getMonth(), 0);
    return { 
      start: start.toISOString().split("T")[0], 
      end: end.toISOString().split("T")[0] 
    };
  } 

  if (preset === "This Year") {
    const start = new Date(now.getFullYear(), 0, 1);
    const end = new Date(now.getFullYear(), 11, 31);
    return { 
      start: start.toISOString().split("T")[0], 
      end: end.toISOString().split("T")[0] 
    };
  }

  return { start: "", end: "" };
};
