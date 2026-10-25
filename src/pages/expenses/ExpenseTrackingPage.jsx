import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useExpenseManagement } from "@/hooks/useExpenseManagement";

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
import {
  filterExpenseRecords,
  getDateRangeFromPreset,
  sortExpenseRecords,
} from "@/utils/expenses/expenseFilters";
import { exportExpensesToExcel } from "@/utils/expenses/expenseExportUtils";

const ExpenseTrackingPage = () => {
  const navigate = useNavigate();
  const {
    expenses,
    categories,
    isLoading,
    error,
    refetchExpenseManagement,
  } = useExpenseManagement();

  const [searchTerm, setSearchTerm] = useState("");
  const [initialDateRange] = useState(() => getDateRangeFromPreset("This Week"));
  const [fromDate, setFromDate] = useState(initialDateRange.start);
  const [toDate, setToDate] = useState(initialDateRange.end);
  const [datePreset, setDatePreset] = useState("This Week");
  const [selectedCategories, setSelectedCategories] = useState([]);
  const [sortBy, setSortBy] = useState("latest");

  const [isManageCategoriesOpen, setIsManageCategoriesOpen] = useState(false);
  const [isAddExpenseOpen, setIsAddExpenseOpen] = useState(false);
  const [addExpenseInitialCategory, setAddExpenseInitialCategory] =
    useState(null);
  const [isEditExpenseOpen, setIsEditExpenseOpen] = useState(false);
  const [expenseToEdit, setExpenseToEdit] = useState(null);
  const [isArchiveExpenseOpen, setIsArchiveExpenseOpen] = useState(false);
  const [expenseToArchive, setExpenseToArchive] = useState(null);

  // --- 1. Filter Logic ---
  const filteredExpenseRecords = filterExpenseRecords(
    expenses,
    searchTerm,
    fromDate,
    toDate,
    selectedCategories,
  );

  const sortedExpenseRecords = sortExpenseRecords(filteredExpenseRecords, sortBy);

  // Cards retain their date/search context, just like Inventory's status cards.
  const summaryRecords = filterExpenseRecords(expenses, searchTerm, fromDate, toDate);

  // --- 2. Compute Totals ---
  const {
    overallExpenses,
    salaryExpenses,
    salaryTransactionCount,
    totalInventoryPurchases,
    inventoryPurchasePercentage,
    topExpenseCategory,
    expenseTransactionCount,
  } = calculateExpenseSummary(summaryRecords);
  const filteredSummary = calculateExpenseSummary(filteredExpenseRecords);

  // --- 3. Expense Breakdown by Category ---
  const categoryBreakdown = calculateCategoryBreakdown(
    filteredExpenseRecords,
    filteredSummary.overallExpenses,
  );
  const expenseDistributionData = calculateExpenseDistributionData(
    filteredExpenseRecords,
    fromDate,
    toDate,
    datePreset,
  );

  // --- Handlers ---
  const handleSummaryCategorySelect = (nextCategories, highestAmountFirst = false) => {
    setSelectedCategories(nextCategories);
    if (highestAmountFirst) setSortBy("highest-amount");
  };

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
      filteredSummary.overallExpenses,
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
            topExpenseCategory={topExpenseCategory}
            expenseTransactionCount={expenseTransactionCount}
            isLoading={isLoading}
            categories={categories}
            selectedCategories={selectedCategories}
            onCategorySelect={handleSummaryCategorySelect}
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
            sortBy={sortBy}
            onSortChange={setSortBy}
            onExport={handleExportExcel}
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
