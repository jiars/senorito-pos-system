import React, { useState, useEffect } from "react";
import { useExpenseManagement } from "../../hooks/useExpenseManagement";
import { useSalesReport } from "../../hooks/useSalesReport";

import ManageExpenseCategoriesModal from "./Manage Expense Categories/ManageExpenseCategoriesModal";
import AddExpenseModal from "./Add Expense/AddExpenseModal";
import EditExpenseModal from "./Edit Expense/EditExpenseModal";
import ConfirmDeleteExpenseModal from "./Confirm Delete Expense/ConfirmDeleteExpenseModal";

// CBA Components
import ExpenseFilterBar from "./components/ExpenseFilterBar";
import ExpenseSummaryCards from "./components/ExpenseSummaryCards";
import ExpenseDistributionPanel from "./components/ExpenseDistributionPanel";
import ExpenseRecordsTable from "./components/ExpenseRecordsTable";
import ExpenseCategoryBreakdown from "./components/ExpenseCategoryBreakdown";
import ExpenseHeader from "./components/ExpenseHeader";

import "./expenseTracking.css";

// Utilities
import {
  buildCategoryColorMap,
  calculateExpenseSummary,
  calculateCategoryBreakdown,
  calculateChartSegments
} from "../../utils/expense/expenseCalculations";
import { filterExpenseRecords, getDateRangeFromPreset } from "../../utils/expense/expenseFilters";
import { exportExpensesToExcel } from "../../utils/expense/expenseExportUtils";
import { calculateSalesSummary } from "../../utils/reports/salesReportCalculations";
import { filterSalesOrders } from "../../utils/reports/salesReportFilters";

const ExpenseTrackingPage = () => {
  const { expenses, categories, isLoading, refetchExpenseManagement } =
    useExpenseManagement();

  // Wastage remains in Inventory and is excluded from cash Expenses.
  const visibleExpenses = expenses.filter(
    (expense) =>
      expense.expense_categories?.category_name !== "Inventory Wastage",
  );

  const [searchTerm, setSearchTerm] = useState("");
  const [fromDate, setFromDate] = useState("");
  const [toDate, setToDate] = useState("");
  const [datePreset, setDatePreset] = useState("All Time");

  const [isManageCategoriesOpen, setIsManageCategoriesOpen] = useState(false);
  const [isAddExpenseOpen, setIsAddExpenseOpen] = useState(false);
  const [isEditExpenseOpen, setIsEditExpenseOpen] = useState(false);
  const [expenseToEdit, setExpenseToEdit] = useState(null);
  const [isArchiveExpenseOpen, setIsArchiveExpenseOpen] = useState(false);
  const [expenseToArchive, setExpenseToArchive] = useState(null);
  const [hoveredSegment, setHoveredSegment] = useState(null);

  const [expensePage, setExpensePage] = useState(1);
  const itemsPerPage = 10;

  const {
    orders: salesOrders,
    isLoading: isLoadingSales,
  } = useSalesReport();

  // Reuse the cached Sales Report data for the selected Expense date range.
  const filteredSalesOrders = filterSalesOrders(
    salesOrders,
    fromDate,
    toDate,
    "All Order Sources",
    "All Categories",
  );
  const salesSummary = calculateSalesSummary(filteredSalesOrders, []);
  const netSales = salesSummary.netSales;

  // --- 1. Filter Logic ---
  const filteredExpenseRecords = filterExpenseRecords(visibleExpenses, searchTerm, fromDate, toDate);

  // Reset pagination when filters change
  useEffect(() => {
    setExpensePage(1);
  }, [searchTerm, fromDate, toDate]);

  const handlePresetChange = (e) => {
    const preset = e.target.value;
    setDatePreset(preset);

    const { start, end } = getDateRangeFromPreset(preset);
    setFromDate(start);
    setToDate(end);
  };

  // --- Pagination Data ---
  const sortedExpenseRecords = [...filteredExpenseRecords].sort((a, b) => {
    const dateDiff = new Date(b.expense_date) - new Date(a.expense_date);
    if (dateDiff === 0) return new Date(b.created_at) - new Date(a.created_at);
    return dateDiff;
  });

  const expenseTotalPages = Math.max(
    1,
    Math.ceil(sortedExpenseRecords.length / itemsPerPage),
  );
  const paginatedExpenses = sortedExpenseRecords.slice(
    (expensePage - 1) * itemsPerPage,
    expensePage * itemsPerPage,
  );

  // --- 2. Compute Totals ---
  const { overallExpenses, totalInventoryPurchases, netOperational } = calculateExpenseSummary(filteredExpenseRecords, netSales);

  // --- 3. Expense Breakdown by Category ---
  const categoryBreakdown = calculateCategoryBreakdown(filteredExpenseRecords, overallExpenses);

  // --- Handlers ---
  const handleEditExpense = (record) => {
    const categoryName = record.expense_categories?.category_name;
    if (categoryName === "Inventory Purchase") {
      alert(
        "System-generated inventory expenses cannot be edited here. Please use the Inventory module.",
      );
      return;
    }
    setExpenseToEdit(record);
    setIsEditExpenseOpen(true);
  };

  const handleArchiveExpense = (record) => {
    const categoryName = record.expense_categories?.category_name;
    if (categoryName === "Inventory Purchase") {
      alert(
        "System-generated inventory expenses cannot be archived here. Please use the Inventory module.",
      );
      return;
    }
    setExpenseToArchive(record);
    setIsArchiveExpenseOpen(true);
  };

  // Create a color map for all categories coming from the database
  const categoryColorMap = buildCategoryColorMap(categories);

  const getCategoryColor = (categoryName) => {
    return categoryColorMap[categoryName] || "#888888";
  };

  // SVG Chart Calculation
  const chartSegments = calculateChartSegments(categoryBreakdown, overallExpenses, categoryColorMap);

  if (isLoading || isLoadingSales) {
    return (
      <div className="expense-page">
        <p>Loading expense data...</p>
      </div>
    );
  }

  const handleExportExcel = () => {
    const dateRangeStr = (fromDate || toDate) ? `${fromDate || 'Start'} to ${toDate || 'End'}` : "All Time";
    exportExpensesToExcel(
      sortedExpenseRecords,
      categoryBreakdown,
      overallExpenses,
      netSales,
      netOperational,
      dateRangeStr
    );
  };

  return (
    <div className="expense-page">
      {/* ───── Page Header ───── */}
      <ExpenseHeader
        onManageCategories={() => setIsManageCategoriesOpen(true)}
        onExport={handleExportExcel}
        onAddExpense={() => setIsAddExpenseOpen(true)}
      />

      {/* ───── Filter Bar ───── */}
      <ExpenseFilterBar
        searchTerm={searchTerm}
        setSearchTerm={setSearchTerm}
        datePreset={datePreset}
        handlePresetChange={handlePresetChange}
        fromDate={fromDate}
        setFromDate={setFromDate}
        setDatePreset={setDatePreset}
        toDate={toDate}
        setToDate={setToDate}
      />

      {/* ───── Main Dashboard Grid ───── */}
      <div className="expense-main-dashboard">
        {/* Left Column */}
        <div className="expense-left-col">
          <ExpenseSummaryCards
            overallExpenses={overallExpenses}
            totalInventoryPurchases={totalInventoryPurchases}
            netOperational={netOperational}
          />
        </div>

        {/* Right Column */}
        <div className="expense-right-col">
          <ExpenseDistributionPanel
            chartSegments={chartSegments}
            overallExpenses={overallExpenses}
            categoryBreakdown={categoryBreakdown}
            getCategoryColor={getCategoryColor}
            hoveredSegment={hoveredSegment}
            setHoveredSegment={setHoveredSegment}
            radius={80}
            strokeWidth={40}
          />

          <ExpenseCategoryBreakdown
            overallExpenses={overallExpenses}
            categories={categoryBreakdown}
            getCategoryColor={getCategoryColor}
          />
        </div>
      </div>

      <ExpenseRecordsTable
        filteredExpenseRecords={filteredExpenseRecords}
        paginatedExpenses={paginatedExpenses}
        getCategoryColor={getCategoryColor}
        handleEditExpense={handleEditExpense}
        handleArchiveExpense={handleArchiveExpense}
        expenseTotalPages={expenseTotalPages}
        expensePage={expensePage}
        setExpensePage={setExpensePage}
      />

      {/* ───── Modals ───── */}
      <ManageExpenseCategoriesModal
        isOpen={isManageCategoriesOpen}
        onClose={() => setIsManageCategoriesOpen(false)}
        categories={categories}
        refetch={refetchExpenseManagement}
      />

      <AddExpenseModal
        isOpen={isAddExpenseOpen}
        onClose={() => setIsAddExpenseOpen(false)}
        categories={categories}
        refetch={refetchExpenseManagement}
      />

      <EditExpenseModal
        isOpen={isEditExpenseOpen}
        onClose={() => setIsEditExpenseOpen(false)}
        expenseData={expenseToEdit}
        categories={categories}
        refetch={refetchExpenseManagement}
      />

      <ConfirmDeleteExpenseModal
        isOpen={isArchiveExpenseOpen}
        onClose={() => setIsArchiveExpenseOpen(false)}
        expense={expenseToArchive}
        refetch={refetchExpenseManagement}
      />
    </div>
  );
};

export default ExpenseTrackingPage;
