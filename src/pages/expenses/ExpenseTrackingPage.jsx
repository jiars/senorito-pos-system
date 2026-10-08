import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useExpenseManagement } from "@/hooks/useExpenseManagement";
import { useSalesReport } from "@/hooks/useSalesReport";

import ManageExpenseCategoriesModal from "./Manage Expense Categories/ManageExpenseCategoriesModal";
import AddExpenseModal from "./Add Expense/AddExpenseModal";
import EditExpenseModal from "./Edit Expense/EditExpenseModal";
import ArchiveExpenseModal from "./Archive Expense/ArchiveExpenseModal";

// CBA Components
import PageLayout from "@/components/layout/PageLayout";
import ExpenseSummaryCards from "./components/ExpenseSummaryCards";
import ExpenseOverview from "./components/ExpenseOverview";
import ExpenseRecordsTable from "./components/ExpenseRecordsTable";
import ExpenseHeader from "./components/ExpenseHeader";

import "./expenseTracking.css";

// Utilities
import {
  buildCategoryColorMap,
  calculateExpenseSummary,
  calculateCategoryBreakdown,
  calculateExpenseDistributionData,
} from "@/utils/expenses/expenseCalculations";
import { filterExpenseRecords } from "@/utils/expenses/expenseFilters";
import { exportExpensesToExcel } from "@/utils/expenses/expenseExportUtils";
import { calculateSalesSummary } from "@/utils/reports/salesReportCalculations";
import { filterSalesOrders } from "@/utils/reports/salesReportFilters";

const ExpenseTrackingPage = () => {
  const navigate = useNavigate();
  const {
    expenses,
    categories,
    isLoading: isLoadingExpenses,
    error,
    refetchExpenseManagement,
  } = useExpenseManagement();

  const [searchTerm, setSearchTerm] = useState("");
  const [fromDate, setFromDate] = useState("");
  const [toDate, setToDate] = useState("");
  const [datePreset, setDatePreset] = useState("All Time");
  const [selectedCategories, setSelectedCategories] = useState([]);

  const [isManageCategoriesOpen, setIsManageCategoriesOpen] = useState(false);
  const [isAddExpenseOpen, setIsAddExpenseOpen] = useState(false);
  const [addExpenseInitialCategory, setAddExpenseInitialCategory] =
    useState(null);
  const [isEditExpenseOpen, setIsEditExpenseOpen] = useState(false);
  const [expenseToEdit, setExpenseToEdit] = useState(null);
  const [isArchiveExpenseOpen, setIsArchiveExpenseOpen] = useState(false);
  const [expenseToArchive, setExpenseToArchive] = useState(null);

  const { orders: salesOrders, isLoading: isLoadingSales } = useSalesReport();
  const isLoading = isLoadingExpenses || isLoadingSales;

  // Reuse the cached Sales Report data for the selected Expense date range.
  const filteredSalesOrders = filterSalesOrders(
    salesOrders,
    fromDate,
    toDate,
    [],
    [],
  );
  const salesSummary = calculateSalesSummary(filteredSalesOrders, []);
  const netSales = salesSummary.netSales;

  // --- 1. Filter Logic ---
  const filteredExpenseRecords = filterExpenseRecords(
    expenses,
    searchTerm,
    fromDate,
    toDate,
    selectedCategories,
  );

  // --- Sorted records for the table and export ---
  const sortedExpenseRecords = [...filteredExpenseRecords].sort((a, b) => {
    const dateDiff = new Date(b.expense_date) - new Date(a.expense_date);
    if (dateDiff === 0) return new Date(b.created_at) - new Date(a.created_at);
    return dateDiff;
  });

  // --- 2. Compute Totals ---
  const {
    overallExpenses,
    salaryExpenses,
    salaryTransactionCount,
    totalInventoryPurchases,
    inventoryPurchasePercentage,
    topOperatingExpense,
    expenseTransactionCount,
    netOperational,
  } = calculateExpenseSummary(filteredExpenseRecords, netSales);

  // --- 3. Expense Breakdown by Category ---
  const categoryBreakdown = calculateCategoryBreakdown(
    filteredExpenseRecords,
    overallExpenses,
  );
  const expenseDistributionData = calculateExpenseDistributionData(
    filteredExpenseRecords,
  );

  // --- Handlers ---
  const handleEditExpense = (record) => {
    setExpenseToEdit(record);
    setIsEditExpenseOpen(true);
  };

  const handleArchiveExpense = (record) => {
    const categoryName = record.expense_categories?.category_name;
    if (categoryName === "Inventory Purchase") return;
    setExpenseToArchive(record);
    setIsArchiveExpenseOpen(true);
  };

  const handleOpenAddExpense = (initialCategoryName = null) => {
    setAddExpenseInitialCategory(initialCategoryName);
    setIsAddExpenseOpen(true);
  };

  const handleCloseAddExpense = () => {
    setIsAddExpenseOpen(false);
    setAddExpenseInitialCategory(null);
  };

  // Create a color map for all categories coming from the database
  const categoryColorMap = buildCategoryColorMap(categories);

  const getCategoryColor = (categoryName) => {
    return categoryColorMap[categoryName] || "#888888";
  };

  const handleExportExcel = () => {
    const dateRangeStr =
      fromDate || toDate
        ? `${fromDate || "Start"} to ${toDate || "End"}`
        : "All Time";
    exportExpensesToExcel(
      sortedExpenseRecords,
      categoryBreakdown,
      overallExpenses,
      netSales,
      netOperational,
      dateRangeStr,
    );
  };

  const pageActions = (
    <ExpenseHeader
      onManageCategories={() => setIsManageCategoriesOpen(true)}
      onExport={handleExportExcel}
      onViewArchive={() => navigate("/expenses/archive")}
      onAddExpense={() => handleOpenAddExpense()}
    />
  );

  return (
    <PageLayout
      title="Expense Tracking"
      subtitle="Track and monitor your business expenses."
      actions={pageActions}
      className="expense-page-shell flex flex-col gap-[var(--app-gap-section)]"
    >
      <div className="expense-page-layout">
        <section className="expense-page-summary">
          <ExpenseSummaryCards
            overallExpenses={overallExpenses}
            salaryExpenses={salaryExpenses}
            salaryTransactionCount={salaryTransactionCount}
            totalInventoryPurchases={totalInventoryPurchases}
            inventoryPurchasePercentage={inventoryPurchasePercentage}
            topOperatingExpense={topOperatingExpense}
            expenseTransactionCount={expenseTransactionCount}
            isLoading={isLoading}
          />
        </section>

        <section className="expense-page-overview">
          <ExpenseOverview
            isLoading={isLoading}
            expenseDistributionData={expenseDistributionData}
            onPayEmployee={() => handleOpenAddExpense("salary")}
            onPurchaseInventory={() =>
              handleOpenAddExpense("inventory purchase")
            }
            onManageCategories={() => setIsManageCategoriesOpen(true)}
            onViewArchive={() => navigate("/expenses/archive")}
          />
        </section>

        <section className="expense-page-records">
          <ExpenseRecordsTable
            records={sortedExpenseRecords}
            categories={categories}
            searchTerm={searchTerm}
            datePreset={datePreset}
            fromDate={fromDate}
            toDate={toDate}
            selectedCategories={selectedCategories}
            isLoading={isLoading}
            error={error}
            getCategoryColor={getCategoryColor}
            onSearchChange={setSearchTerm}
            onApplyFilters={(nextFilters) => {
              setDatePreset(nextFilters.datePreset);
              setFromDate(nextFilters.fromDate);
              setToDate(nextFilters.toDate);
              setSelectedCategories(nextFilters.categories);
            }}
            onEditExpense={handleEditExpense}
            onArchiveExpense={handleArchiveExpense}
          />
        </section>
      </div>

      <ManageExpenseCategoriesModal
        isOpen={isManageCategoriesOpen}
        onClose={() => setIsManageCategoriesOpen(false)}
        categories={categories}
        refetch={refetchExpenseManagement}
      />

      <AddExpenseModal
        isOpen={isAddExpenseOpen}
        onClose={handleCloseAddExpense}
        categories={categories}
        refetch={refetchExpenseManagement}
        initialCategoryName={addExpenseInitialCategory}
      />

      <EditExpenseModal
        isOpen={isEditExpenseOpen}
        onClose={() => setIsEditExpenseOpen(false)}
        expenseData={expenseToEdit}
        categories={categories}
        refetch={refetchExpenseManagement}
      />

      <ArchiveExpenseModal
        isOpen={isArchiveExpenseOpen}
        onClose={() => setIsArchiveExpenseOpen(false)}
        expense={expenseToArchive}
        refetch={refetchExpenseManagement}
      />
    </PageLayout>
  );
};

export default ExpenseTrackingPage;
