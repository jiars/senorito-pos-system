import { useMemo, useState } from "react";

import DataTable from "@/components/data-table/DataTable";
import DataTablePagination from "@/components/data-table/DataTablePagination";
import FilterOptionGroup from "@/components/filters/FilterOptionGroup";
import FilterPopover from "@/components/filters/FilterPopover";
import ToolbarSearchInput from "@/components/filters/ToolbarSearchInput";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { formatCurrency } from "@/utils/shared/formatters/currencyFormatters";
import { formatDate, formatDateTime } from "@/utils/shared/formatters/dateFormatters";

import ExpenseCategoryBadge from "../../components/ExpenseCategoryBadge";

const ExpenseArchiveToolbar = ({
  searchTerm,
  categories,
  selectedCategories,
  isLoading,
  onSearchChange,
  onApplyCategories,
}) => {
  const [draftCategories, setDraftCategories] = useState(selectedCategories);

  const categoryOptions = categories.map((category) => ({
    label: category.category_name,
    value: category.category_name,
  }));

  const handleClear = () => {
    setDraftCategories([]);
    onApplyCategories([]);
  };

  if (isLoading) {
    return (
      <div className="flex w-full flex-wrap justify-end gap-[var(--app-gap-related)]">
        <Skeleton className="h-[var(--app-touch-target-min)] w-full rounded-[var(--app-radius-control)] sm:w-[22rem]" />
        <Skeleton className="h-[var(--app-touch-target-min)] w-28 rounded-[var(--app-radius-control)]" />
      </div>
    );
  }

  return (
    <div className="flex w-full flex-wrap items-center justify-end gap-[var(--app-gap-related)]">
      <div className="w-full sm:w-[22rem]">
        <ToolbarSearchInput
          placeholder="Search archived expense..."
          value={searchTerm}
          onValueChange={onSearchChange}
        />
      </div>

      <FilterPopover
        onApply={() => onApplyCategories(draftCategories)}
        onClear={handleClear}
      >
        <FilterOptionGroup
          id="expense-archive-categories"
          label="Category"
          options={categoryOptions}
          selectedValues={draftCategories}
          onSelectedValuesChange={setDraftCategories}
          defaultOpen
        />
      </FilterPopover>
    </div>
  );
};

const ExpenseArchiveTable = ({
  archivedExpenses,
  categories,
  isLoading,
  error,
  restoringExpenseId,
  getCategoryColor,
  onRestoreExpense,
}) => {
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedCategories, setSelectedCategories] = useState([]);
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);

  const filteredExpenses = useMemo(() => {
    const normalizedSearch = searchTerm.trim().toLocaleLowerCase();

    return archivedExpenses.filter((expense) => {
      const categoryName =
        expense.expense_categories?.category_name || "Uncategorized";
      const recordedBy = expense.profiles
        ? `${expense.profiles.first_name} ${expense.profiles.last_name}`
        : "Auto / Unknown";
      const searchValues = [
        expense.description,
        expense.vendor,
        categoryName,
        recordedBy,
      ];
      const searchableText = searchValues
        .filter(Boolean)
        .join(" ")
        .toLocaleLowerCase();
      const matchesSearch =
        normalizedSearch.length === 0 ||
        searchableText.includes(normalizedSearch);
      const matchesCategory =
        selectedCategories.length === 0 ||
        selectedCategories.includes(categoryName);

      return matchesSearch && matchesCategory;
    });
  }, [archivedExpenses, searchTerm, selectedCategories]);

  const totalPages = Math.max(1, Math.ceil(filteredExpenses.length / pageSize));
  const safeCurrentPage = Math.min(currentPage, totalPages);
  const paginatedExpenses = filteredExpenses.slice(
    (safeCurrentPage - 1) * pageSize,
    safeCurrentPage * pageSize,
  );

  const columns = useMemo(
    () => [
      {
        accessorKey: "expense_date",
        header: "Expense Date",
        meta: { width: "10rem" },
        cell: ({ row }) => formatDate(row.original.expense_date),
      },
      {
        id: "category",
        header: "Category",
        meta: { width: "12rem" },
        cell: ({ row }) => {
          const categoryName =
            row.original.expense_categories?.category_name || "Uncategorized";

          return (
            <ExpenseCategoryBadge
              categoryName={categoryName}
              categoryColor={getCategoryColor(categoryName)}
            />
          );
        },
      },
      {
        accessorKey: "description",
        header: "Description",
        meta: { width: "16rem" },
      },
      {
        accessorKey: "vendor",
        header: "Vendor / Supplier",
        meta: { width: "12rem" },
        cell: ({ row }) => row.original.vendor || "—",
      },
      {
        accessorKey: "amount",
        header: "Amount",
        meta: { width: "10rem" },
        cell: ({ row }) => (
          <span className="font-semibold">
            {formatCurrency(row.original.amount)}
          </span>
        ),
      },
      {
        id: "recorded-by",
        header: "Recorded By",
        meta: { width: "12rem" },
        cell: ({ row }) => {
          const profile = row.original.profiles;
          return profile
            ? `${profile.first_name} ${profile.last_name}`
            : "Auto / Unknown";
        },
      },
      {
        accessorKey: "archived_at",
        header: "Archived Date",
        meta: { width: "13rem" },
        cell: ({ row }) =>
          row.original.archived_at
            ? formatDateTime(row.original.archived_at)
            : "—",
      },
      {
        id: "archived-by",
        header: "Archived By",
        meta: { width: "12rem" },
        cell: ({ row }) => {
          const profile = row.original.archived_by_profile;
          return profile ? `${profile.first_name} ${profile.last_name}` : "—";
        },
      },
      {
        id: "actions",
        header: "Actions",
        meta: {
          width: "6rem",
          headerClassName: "text-center",
          cellClassName: "text-center",
        },
        cell: ({ row }) => {
          const expense = row.original;
          const isRestoring = restoringExpenseId === expense.id;

          return (
            <Button
              type="button"
              variant="ghost"
              size="icon"
              aria-label={`Restore ${expense.description}`}
              title="Restore expense"
              disabled={restoringExpenseId !== null}
              onClick={() => onRestoreExpense(expense)}
              className="size-[var(--app-touch-target-min)] rounded-[var(--app-radius-control)] text-[var(--app-color-brand)] hover:bg-[var(--app-color-control-hover)]"
            >
              <i
                aria-hidden="true"
                className={
                  isRestoring ? "bi bi-arrow-repeat" : "bi bi-box-arrow-up"
                }
              />
            </Button>
          );
        },
      },
    ],
    [getCategoryColor, onRestoreExpense, restoringExpenseId],
  );

  return (
    <section className="expense-archive-table-section grid min-w-0 gap-[var(--app-gap-section)]">
      <div className="expense-archive-toolbar-region flex min-w-0 flex-wrap items-center justify-end gap-[var(--app-gap-related)]">
        <ExpenseArchiveToolbar
          key={selectedCategories.join("|")}
          searchTerm={searchTerm}
          categories={categories}
          selectedCategories={selectedCategories}
          isLoading={isLoading}
          onSearchChange={(value) => {
            setSearchTerm(value);
            setCurrentPage(1);
          }}
          onApplyCategories={(nextCategories) => {
            setSelectedCategories(nextCategories);
            setCurrentPage(1);
          }}
        />
      </div>

      <DataTable
        columns={columns}
        data={paginatedExpenses}
        getRowId={(expense) => String(expense.id)}
        tableLabel="Archived expense records"
        isLoading={isLoading}
        skeletonRowCount={6}
        errorMessage={error || ""}
        emptyMessage="No archived expense records match your filters."
        tableClassName="table-fixed"
        scrollAreaClassName="expense-archive-table-scroll-area"
        scrollbarOrientation="both"
      />

      <DataTablePagination
        totalItems={filteredExpenses.length}
        pageSize={pageSize}
        pageSizeOptions={[10, 20, 30, 40]}
        currentPage={safeCurrentPage}
        onPageChange={setCurrentPage}
        onPageSizeChange={setPageSize}
        isLoading={isLoading}
      />
    </section>
  );
};

export default ExpenseArchiveTable;
