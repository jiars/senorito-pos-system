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
  categories,
  selectedCategories,
  onCategorySelect,
}) => {
  const salaryCategories = categories.filter((category) => {
    const name = category.category_name.trim().toLowerCase();
    return name === "salary" || name === "salaries";
  }).map((category) => category.category_name);
  const inventoryCategories = categories.filter((category) => {
    return category.category_name.trim().toLowerCase() === "inventory purchase";
  }).map((category) => category.category_name);
  const isSalarySelected = selectedCategories.length > 0 &&
    selectedCategories.every((category) => salaryCategories.includes(category));
  const isInventorySelected = selectedCategories.length > 0 &&
    selectedCategories.every((category) => inventoryCategories.includes(category));

  const cards = [
    {
      id: "total-expenses",
      isActive: selectedCategories.length === 0,
      onClick: () => onCategorySelect([]),
      title: "Total Expenses",
      value: formatCurrency(overallExpenses),
      descriptionAccent: `${expenseTransactionCount} records`,
      description: " in the selected period",
      descriptionAccentClassName: "text-[var(--app-color-success)]",
      titleClassName: "text-[var(--app-color-brand)]",
    },
    {
      id: "salary-expenses",
      isActive: isSalarySelected,
      onClick: salaryCategories.length > 0 ? () => onCategorySelect(salaryCategories) : undefined,
      title: "Salary",
      value: formatCurrency(salaryExpenses),
      descriptionAccent: `${salaryTransactionCount} transactions`,
      description: " in the selected period",
      descriptionAccentClassName: "text-[var(--app-color-success)]",
      titleClassName: "text-[var(--app-color-brand)]",
    },
    {
      id: "inventory-purchases",
      isActive: isInventorySelected,
      onClick: inventoryCategories.length > 0 ? () => onCategorySelect(inventoryCategories) : undefined,
      title: "Inventory Purchases",
      value: formatCurrency(totalInventoryPurchases),
      descriptionAccent: `${inventoryPurchasePercentage}%`,
      description: " of total expenses",
      descriptionAccentClassName: "text-[var(--app-color-success)]",
      titleClassName: "text-[var(--app-color-brand)]",
    },
    {
      id: "top-expense-category",
      isActive: selectedCategories.length === 1 && selectedCategories[0] === topExpenseCategory.category,
      onClick: expenseTransactionCount > 0 ? () => onCategorySelect([topExpenseCategory.category], true) : undefined,
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
