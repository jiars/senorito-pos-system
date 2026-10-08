import { useState } from "react";
import { useNavigate } from "react-router-dom";

import PageLayout from "@/components/layout/PageLayout";
import { Button } from "@/components/ui/button";
import { useExpenseManagement } from "@/hooks/useExpenseManagement";
import RestoreExpenseModal from "../Restore Expense/RestoreExpenseModal";
import { buildCategoryColorMap } from "@/utils/expenses/expenseCalculations";

import ExpenseArchiveTable from "./components/ExpenseArchiveTable";

import "./expenseArchive.css";

const ExpenseArchivePage = () => {
  const navigate = useNavigate();
  const [expenseToRestore, setExpenseToRestore] = useState(null);
  const {
    archivedExpenses,
    categories,
    isLoading,
    error,
    refetchExpenseManagement,
  } = useExpenseManagement();

  const categoryColorMap = buildCategoryColorMap(categories);

  const getCategoryColor = (categoryName) => {
    return categoryColorMap[categoryName] || "#888888";
  };

  const handleRestoreExpense = (expense) => {
    if (expenseToRestore) return;
    setExpenseToRestore(expense);
  };

  const pageActions = (
    <Button
      type="button"
      variant="outline"
      onClick={() => navigate("/expenses")}
      className="h-[var(--app-touch-target-min)] rounded-[var(--app-radius-control)] border-[var(--app-color-border-subtle)] bg-[var(--app-color-surface)] px-[var(--app-space-4)] text-[length:var(--app-font-size-body-secondary)] text-[var(--app-color-filter-font-color)] hover:bg-[var(--app-color-control-hover)] transition-shadow hover:shadow-brand active:shadow-brand"
    >
      <i aria-hidden="true" className="bi bi-arrow-left" />
      Back
    </Button>
  );

  return (
    <PageLayout
      title="Expense Archive"
      subtitle="View archived expense records and restore them when needed."
      actions={pageActions}
      className="expense-archive-page-shell flex flex-col gap-[var(--app-gap-section)]"
    >
      <div className="expense-archive-page-layout">
        <ExpenseArchiveTable
          archivedExpenses={archivedExpenses}
          categories={categories}
          isLoading={isLoading}
          error={error}
          restoringExpenseId={expenseToRestore ? expenseToRestore.id : null}
          getCategoryColor={getCategoryColor}
          onRestoreExpense={handleRestoreExpense}
        />
      </div>
      <RestoreExpenseModal
        isOpen={Boolean(expenseToRestore)}
        expense={expenseToRestore}
        onClose={() => setExpenseToRestore(null)}
        refetch={refetchExpenseManagement}
      />
    </PageLayout>
  );
};

export default ExpenseArchivePage;
