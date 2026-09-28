const toInputDateValue = (date) => {
  const timezoneOffset = date.getTimezoneOffset() * 60 * 1000;

  return new Date(date.getTime() - timezoneOffset).toISOString().slice(0, 10);
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
  const today = new Date();
  const toDate = toInputDateValue(today);

  if (preset === "All Time" || preset === "Custom")
    return { start: "", end: "" };

  if (preset === "This Day") return { start: toDate, end: toDate };

  if (preset === "This Week") {
    const startOfWeek = new Date(today);
    startOfWeek.setDate(today.getDate() - today.getDay());

    return {
      start: toInputDateValue(startOfWeek),
      end: toDate,
    };
  }

  if (preset === "This Month") {
    const startOfMonth = new Date(today.getFullYear(), today.getMonth(), 1);

    return {
      start: toInputDateValue(startOfMonth),
      end: toDate,
    };
  }

  return { start: "", end: "" };
};
