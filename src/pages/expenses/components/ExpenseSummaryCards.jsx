import SummaryCards from "@/components/summary-cards/SummaryCards";
import { formatCurrency } from "@/utils/shared/formatters/currencyFormatters";

const ExpenseSummaryCards = ({
  overallExpenses,
  salaryExpenses,
  salaryTransactionCount,
  totalInventoryPurchases,
  inventoryPurchasePercentage,
  topExpenseCategory,
  expenseTransactionCount,
  isLoading,
}) => {
  const cards = [
    {
      id: "total-expenses",
      title: "Total Expenses",
      value: formatCurrency(overallExpenses),
      descriptionAccent: `${expenseTransactionCount} records`,
      description: " in the selected period",
      descriptionAccentClassName: "text-[var(--app-color-success)]",
      titleClassName: "text-[var(--app-color-brand)]",
    },
    {
      id: "salary-expenses",
      title: "Salary",
      value: formatCurrency(salaryExpenses),
      descriptionAccent: `${salaryTransactionCount} transactions`,
      description: " in the selected period",
      descriptionAccentClassName: "text-[var(--app-color-success)]",
      titleClassName: "text-[var(--app-color-brand)]",
    },
    {
      id: "inventory-purchases",
      title: "Inventory Purchases",
      value: formatCurrency(totalInventoryPurchases),
      descriptionAccent: `${inventoryPurchasePercentage}%`,
      description: " of total expenses",
      descriptionAccentClassName: "text-[var(--app-color-success)]",
      titleClassName: "text-[var(--app-color-brand)]",
    },
    {
      id: "top-expense-category",
      title: "Top Expense Category",
      value: topExpenseCategory.category,
      descriptionAccent: formatCurrency(topExpenseCategory.amount),
      description: " in the selected period",
      descriptionAccentClassName: "text-[var(--app-color-brand)]",
      titleClassName: "text-[var(--app-color-brand)]",
    },
  ];

  return (
    <SummaryCards
      cards={cards}
      isLoading={isLoading}
      gridClassName="grid grid-cols-1 gap-[var(--app-gap-related)] px-[var(--app-space-4)] sm:grid-cols-2 lg:grid-cols-4"
    />
  );
};

export default ExpenseSummaryCards;
