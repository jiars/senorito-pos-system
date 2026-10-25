import * as XLSX from "xlsx";
import { formatDate } from "@/utils/shared/formatters/dateFormatters";
import { getBusinessDateKey } from "@/utils/shared/formatters/businessDates";

/**
 * Exports only the filtered expense records and their summary to Excel.
 * @param {Array} sortedExpenseRecords The sorted list of filtered expenses.
 * @param {Array} categoryBreakdown The array of breakdown data for categories.
 * @param {number} overallExpenses Total expenses.
 * @param {string} dateRange The string representation of the selected date range.
 */
export const exportExpensesToExcel = (
  sortedExpenseRecords,
  categoryBreakdown,
  overallExpenses,
  dateRange
) => {
  if (sortedExpenseRecords.length === 0) {
    alert("No expenses to export based on current filters.");
    return;
  }

  const workbook = XLSX.utils.book_new();

  // ==========================================
  // 1. Tab 1: Expense Records
  // ==========================================
  let mainExpensesTotal = 0;
  const mainData = sortedExpenseRecords.map((record) => {
    mainExpensesTotal += Number(record.amount);
    return {
      Date: formatDate(record.expense_date),
      Category: record.expense_categories?.category_name || "Uncategorized",
      Description: record.description,
      "Vendor/Supplier": record.vendor || "-",
      "Amount (₱)": Number(record.amount),
      "Recorded By": record.profiles
        ? `${record.profiles.first_name} ${record.profiles.last_name}`
        : "Auto/Unknown",
    };
  });

  mainData.push({
    Date: "TOTAL EXPENSES",
    Category: "",
    Description: "",
    "Vendor/Supplier": "",
    "Amount (₱)": mainExpensesTotal,
    "Recorded By": "",
  });

  const mainSheet = XLSX.utils.json_to_sheet(mainData);

  const mainColWidths = [
    { wch: 15 },
    { wch: 20 },
    { wch: 40 },
    { wch: 20 },
    { wch: 15 },
    { wch: 25 },
  ];
  mainSheet["!cols"] = mainColWidths;
  XLSX.utils.book_append_sheet(workbook, mainSheet, "Expense Records");

  // ==========================================
  // 2. Tab 2: Expense Analytics
  // ==========================================
  const analyticsData = [];

  analyticsData.push({ Metric: "OVERALL SUMMARY", Value: "" });
  analyticsData.push({ Metric: "Date Range", Value: dateRange });
  analyticsData.push({ Metric: "Total Expenses", Value: `₱${overallExpenses.toFixed(2)}` });
  
  analyticsData.push({ Metric: "", Value: "" }); // blank row

  analyticsData.push({ Metric: "CATEGORY BREAKDOWN", Value: "Amount (₱)", Percentage: "% of Total" });
  
  categoryBreakdown.forEach((cat) => {
    analyticsData.push({
      Metric: cat.category,
      Value: cat.amount,
      Percentage: `${cat.pct}%`,
    });
  });

  const analyticsSheet = XLSX.utils.json_to_sheet(analyticsData, {
    skipHeader: true, // we baked the headers into the rows for formatting
  });

  const analyticsColWidths = [{ wch: 30 }, { wch: 20 }, { wch: 15 }];
  analyticsSheet["!cols"] = analyticsColWidths;
  XLSX.utils.book_append_sheet(workbook, analyticsSheet, "Analytics & Breakdown");

  // ==========================================
  // Trigger Download
  // ==========================================
  const fileName = `Expense_Report_${getBusinessDateKey(new Date())}.xlsx`;
  XLSX.writeFile(workbook, fileName);
};
