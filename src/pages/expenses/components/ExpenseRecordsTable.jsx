import { useMemo, useState } from "react";

import DataTable from "@/components/data-table/DataTable";
import DataTablePagination from "@/components/data-table/DataTablePagination";
import FilterDateRange from "@/components/filters/FilterDateRange";
import FilterOptionGroup from "@/components/filters/FilterOptionGroup";
import FilterPopover from "@/components/filters/FilterPopover";
import FilterSelectField from "@/components/filters/FilterSelectField";
import ToolbarSearchInput from "@/components/filters/ToolbarSearchInput";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Skeleton } from "@/components/ui/skeleton";
import { formatCurrency } from "@/utils/shared/formatters/currencyFormatters";
import { formatDate } from "@/utils/shared/formatters/dateFormatters";
import { getDateRangeFromPreset } from "@/utils/expenses/expenseFilters";

import ExpenseCategoryBadge from "./ExpenseCategoryBadge";

const expensePeriodOptions = [
  { label: "All Time", value: "All Time" },
  { label: "This Day", value: "This Day" },
  { label: "This Week", value: "This Week" },
  { label: "This Month", value: "This Month" },
];

const ExpenseRecordsToolbar = ({
  searchTerm,
  datePreset,
  fromDate,
  toDate,
  selectedCategories,
  categories,
  isLoading,
  onSearchChange,
  onApplyFilters,
}) => {
  const [draftFilters, setDraftFilters] = useState({
    datePreset,
    fromDate,
    toDate,
    categories: selectedCategories,
  });

  const categoryOptions = categories.map((category) => ({
    label: category.category_name,
    value: category.category_name,
  }));

  const handlePeriodChange = (nextPeriod) => {
    const { start, end } = getDateRangeFromPreset(nextPeriod);
    setDraftFilters((current) => ({
      ...current,
      datePreset: nextPeriod,
      fromDate: start,
      toDate: end,
    }));
  };

  const handleManualDateChange = (nextFromDate, nextToDate) => {
    setDraftFilters((current) => ({
      ...current,
      datePreset: "Custom",
      fromDate: nextFromDate,
      toDate: nextToDate,
    }));
  };

  const handleClear = () => {
    const clearedFilters = {
      datePreset: "All Time",
      fromDate: "",
      toDate: "",
      categories: [],
    };
    setDraftFilters(clearedFilters);
    onApplyFilters(clearedFilters);
  };

  if (isLoading) {
    return (
      <div className="flex flex-wrap justify-end gap-[var(--app-gap-related)]">
        <Skeleton className="h-[var(--app-touch-target-min)] w-full rounded-[var(--app-radius-control)] sm:w-[22rem]" />
        <Skeleton className="h-[var(--app-touch-target-min)] w-28 rounded-[var(--app-radius-control)]" />
      </div>
    );
  }

  return (
    <div className="flex flex-wrap items-center justify-end gap-[var(--app-gap-related)]">
      <div className="w-full sm:w-[22rem]">
        <ToolbarSearchInput
          placeholder="Search expense, vendor, description..."
          value={searchTerm}
          onValueChange={onSearchChange}
        />
      </div>

      <FilterPopover
        onApply={() => onApplyFilters(draftFilters)}
        onClear={handleClear}
      >
        <FilterSelectField
          id="expense-filter-period"
          label="Expense Period"
          value={draftFilters.datePreset}
          options={expensePeriodOptions}
          onValueChange={handlePeriodChange}
        />

        <FilterDateRange
          id="expense-filter-date-range"
          fromDate={draftFilters.fromDate}
          toDate={draftFilters.toDate}
          onRangeChange={handleManualDateChange}
        />

        <FilterOptionGroup
          id="expense-filter-categories"
          label="Category"
          options={categoryOptions}
          selectedValues={draftFilters.categories}
          onSelectedValuesChange={(nextCategories) =>
            setDraftFilters((current) => ({
              ...current,
              categories: nextCategories,
            }))
          }
          defaultOpen
        />
      </FilterPopover>
    </div>
  );
};

const ExpenseRecordsTable = ({
  records,
  categories,
  searchTerm,
  datePreset,
  fromDate,
  toDate,
  selectedCategories,
  isLoading,
  error,
  getCategoryColor,
  onSearchChange,
  onApplyFilters,
  onEditExpense,
  onArchiveExpense,
}) => {
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);
  const totalPages = Math.max(1, Math.ceil(records.length / pageSize));
  const safeCurrentPage = Math.min(currentPage, totalPages);
  const paginatedExpenses = records.slice(
    (safeCurrentPage - 1) * pageSize,
    safeCurrentPage * pageSize,
  );

  const columns = useMemo(
    () => [
      {
        accessorKey: "expense_date",
        header: "Date",
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
        id: "recordedBy",
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
        id: "actions",
        header: "Actions",
        meta: {
          width: "5rem",
          headerClassName: "text-center",
          cellClassName: "text-center",
        },
        cell: ({ row }) => {
          const record = row.original;
          const isSystemPurchase =
            record.expense_categories?.category_name === "Inventory Purchase";
          return (
            <DropdownMenu>
              <DropdownMenuTrigger
                render={
                  <Button
                    type="button"
                    variant="ghost"
                    size="icon"
                    className="size-[var(--app-touch-target-min)] rounded-[var(--app-radius-control)] text-[var(--app-color-text)]"
                  >
                    <i
                      aria-hidden="true"
                      className="bi bi-three-dots-vertical"
                    />
                  </Button>
                }
              />

              <DropdownMenuContent align="end" className="z-[100] w-40">
                <DropdownMenuItem
                  disabled={isSystemPurchase}
                  onClick={() => onEditExpense(record)}
                >
                  <i aria-hidden="true" className="bi bi-pencil" />
                  Edit
                </DropdownMenuItem>
                <DropdownMenuItem
                  disabled={isSystemPurchase}
                  onClick={() => onArchiveExpense(record)}
                >
                  <i aria-hidden="true" className="bi bi-archive" />
                  Archive
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          );
        },
      },
    ],
    [getCategoryColor, onArchiveExpense, onEditExpense],
  );

  const handleApplyFilters = (nextFilters) => {
    onApplyFilters(nextFilters);
    setCurrentPage(1);
  };

  return (
    <section className="grid min-w-0 gap-[var(--app-gap-section)]">
      <div className="flex flex-wrap items-center justify-between gap-[var(--app-gap-related)] max-lg:items-stretch">
        <h2 className="ml-[var(--app-space-6)] text-[length:var(--app-font-size-h3)] font-bold leading-[var(--app-line-height-h3)] text-[var(--app-color-text)] max-lg:w-full">
          Expense Records
        </h2>

        <ExpenseRecordsToolbar
          key={`${datePreset}-${fromDate}-${toDate}-${selectedCategories.join("|")}`}
          searchTerm={searchTerm}
          datePreset={datePreset}
          fromDate={fromDate}
          toDate={toDate}
          selectedCategories={selectedCategories}
          categories={categories}
          isLoading={isLoading}
          onSearchChange={(value) => {
            onSearchChange(value);
            setCurrentPage(1);
          }}
          onApplyFilters={handleApplyFilters}
        />
      </div>

      <DataTable
        columns={columns}
        data={paginatedExpenses}
        getRowId={(record) => String(record.id)}
        tableLabel="Expense records"
        isLoading={isLoading}
        skeletonRowCount={6}
        errorMessage={error ?? ""}
        emptyMessage="No expense records match your filters."
        tableClassName="table-fixed"
        scrollAreaClassName="expense-table-scroll-area"
        scrollbarOrientation="both"
      />

      <DataTablePagination
        totalItems={records.length}
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

export default ExpenseRecordsTable;
