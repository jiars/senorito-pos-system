import { useMemo, useState } from "react";

import DataTable from "@/components/data-table/DataTable";
import DataTablePagination from "@/components/data-table/DataTablePagination";
import FilterDateRange from "@/components/filters/FilterDateRange";
import FilterOptionGroup from "@/components/filters/FilterOptionGroup";
import FilterPopover from "@/components/filters/FilterPopover";
import ToolbarSearchInput from "@/components/filters/ToolbarSearchInput";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { formatCurrency } from "@/utils/shared/formatters/currencyFormatters";
import { formatDateTime } from "@/utils/shared/formatters/dateFormatters";
import {
  filterAndSortInventoryWastage,
  flattenInventoryWastageLogs,
} from "@/utils/inventory/inventoryWastageUtils";

const sortOptions = [
  { label: "Latest Added", value: "latest" },
  { label: "Oldest Added", value: "oldest" },
];

const getUniqueOptions = (values) => {
  return [...new Set(values.filter(Boolean))]
    .sort((first, second) => first.localeCompare(second))
    .map((value) => ({ label: value, value }));
};

const InventoryWastageToolbar = ({
  searchTerm,
  categories,
  logs,
  filters,
  sort,
  isLoading,
  onSearchChange,
  onApplyFilters,
  onSortChange,
}) => {
  const [draftFilters, setDraftFilters] = useState(filters);
  const categoryOptions = categories.map((category) => ({
    label: category.category_name,
    value: category.category_name,
  }));
  const reasonOptions = getUniqueOptions(logs.map((log) => log.reasonCategory));
  const sortLabel =
    sortOptions.find((option) => option.value === sort)?.label ??
    "Latest Added";

  const clearFilters = () => {
    const clearedFilters = {
      categories: [],
      reasons: [],
      receivedDateRange: undefined,
      expirationDateRange: undefined,
    };
    setDraftFilters(clearedFilters);
    onApplyFilters(clearedFilters);
  };

  const sidebarSections = [
    {
      id: "wastage-timeframe",
      label: "Timeframe",
      icon: "bi-calendar-range",
      indicator:
        Boolean(draftFilters.receivedDateRange?.from) ||
        Boolean(draftFilters.expirationDateRange?.from),
      content: (
        <div className="flex flex-col gap-[var(--app-gap-related)]">
          <FilterDateRange
            id="inventory-wastage-received-date"
            label="Received Date"
            fromDate={draftFilters.receivedDateRange?.from ?? ""}
            toDate={draftFilters.receivedDateRange?.to ?? ""}
            onRangeChange={(from, to) =>
              setDraftFilters((current) => ({
                ...current,
                receivedDateRange: { from, to },
              }))
            }
          />

          <FilterDateRange
            id="inventory-wastage-expiration-date"
            label="Expiration Date"
            fromDate={draftFilters.expirationDateRange?.from ?? ""}
            toDate={draftFilters.expirationDateRange?.to ?? ""}
            onRangeChange={(from, to) =>
              setDraftFilters((current) => ({
                ...current,
                expirationDateRange: { from, to },
              }))
            }
          />
        </div>
      ),
    },
    {
      id: "wastage-categories",
      label: "Categories",
      icon: "bi-grid",
      indicator: draftFilters.categories.length > 0,
      content: (
        <FilterOptionGroup
          id="inventory-wastage-categories"
          label="Categories"
          options={categoryOptions}
          selectedValues={draftFilters.categories}
          onSelectedValuesChange={(selectedCategories) =>
            setDraftFilters((current) => ({
              ...current,
              categories: selectedCategories,
            }))
          }
          collapsible={false}
        />
      ),
    },
    {
      id: "wastage-reasons",
      label: "Reasons",
      icon: "bi-card-text",
      indicator: draftFilters.reasons.length > 0,
      content: (
        <FilterOptionGroup
          id="inventory-wastage-reasons"
          label="Reasons"
          options={reasonOptions}
          selectedValues={draftFilters.reasons}
          onSelectedValuesChange={(reasons) =>
            setDraftFilters((current) => ({ ...current, reasons }))
          }
          collapsible={false}
        />
      ),
    },
  ];

  if (isLoading) {
    return (
      <div className="flex flex-wrap justify-end gap-[var(--app-space-2)]">
        <Skeleton className="h-[var(--app-touch-target-min)] w-full rounded-[var(--app-radius-control)] sm:w-[22rem]" />
        <Skeleton className="h-[var(--app-touch-target-min)] w-28 rounded-[var(--app-radius-control)]" />
        <Skeleton className="h-[var(--app-touch-target-min)] w-32 rounded-[var(--app-radius-control)]" />
        <Skeleton className="h-[var(--app-touch-target-min)] w-28 rounded-[var(--app-radius-control)]" />
      </div>
    );
  }

  return (
    <div className="flex flex-wrap items-center justify-end gap-[var(--app-space-2)]">
      <div className="w-full sm:w-[22rem]">
        <ToolbarSearchInput
          placeholder="Search item, batch, reason..."
          value={searchTerm}
          onValueChange={onSearchChange}
        />
      </div>

      <FilterPopover
        sidebarSections={sidebarSections}
        onApply={() => onApplyFilters(draftFilters)}
        onClear={clearFilters}
      />

      <FilterPopover
        label={sortLabel}
        triggerIcon="bi-arrow-down-up"
        showFooter={false}
        maxWidth="12rem"
      >
        <FilterOptionGroup
          id="inventory-wastage-sort"
          label="Sort wastage"
          options={sortOptions}
          selectedValues={[sort]}
          onSelectedValuesChange={(values) => {
            const nextSort = values.at(-1);
            if (nextSort) onSortChange(nextSort);
          }}
          selectionMode="single"
          collapsible={false}
          showLabel={false}
        />
      </FilterPopover>
    </div>
  );
};

const InventoryWastageTable = ({
  inventoryItems,
  categories,
  isLoading,
  error,
  quickFilter,
  onQuickFilterChange,
}) => {
  const [searchTerm, setSearchTerm] = useState("");
  const [categoryFilters, setCategoryFilters] = useState([]);
  const [reasonFilters, setReasonFilters] = useState([]);
  const [receivedDateRange, setReceivedDateRange] = useState(undefined);
  const [expirationDateRange, setExpirationDateRange] = useState(undefined);
  const [sort, setSort] = useState("latest");
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);

  const allLogs = useMemo(
    () => flattenInventoryWastageLogs(inventoryItems),
    [inventoryItems],
  );
  const filters = useMemo(
    () => ({
      categories: categoryFilters,
      reasons: reasonFilters,
      receivedDateRange,
      expirationDateRange,
    }),
    [categoryFilters, expirationDateRange, reasonFilters, receivedDateRange],
  );
  const filteredLogs = useMemo(
    () =>
      filterAndSortInventoryWastage({
        logs: allLogs,
        searchTerm,
        categories: categoryFilters,
        reasons: reasonFilters,
        receivedDateRange,
        expirationDateRange,
        quickFilter,
        sort,
      }),
    [
      allLogs,
      categoryFilters,
      expirationDateRange,
      quickFilter,
      reasonFilters,
      receivedDateRange,
      searchTerm,
      sort,
    ],
  );
  const totalPages = Math.max(1, Math.ceil(filteredLogs.length / pageSize));
  const safeCurrentPage = Math.min(currentPage, totalPages);
  const paginatedLogs = filteredLogs.slice(
    (safeCurrentPage - 1) * pageSize,
    safeCurrentPage * pageSize,
  );
  const columns = useMemo(
    () => [
      {
        accessorKey: "itemName",
        header: "Item",
        meta: { width: "12rem" },
        cell: ({ row }) => (
          <span className="font-semibold">{row.original.itemName}</span>
        ),
      },
      {
        accessorKey: "quantityWasted",
        header: "Quantity Wasted",
        meta: { width: "10rem" },
        cell: ({ row }) =>
          `${row.original.quantityWasted} ${row.original.unit}`,
      },
      {
        accessorKey: "unitCost",
        header: "Unit Cost",
        meta: { width: "9rem" },
        cell: ({ row }) => formatCurrency(row.original.unitCost),
      },
      {
        accessorKey: "totalCost",
        header: "Total Cost",
        meta: { width: "9rem" },
        cell: ({ row }) => (
          <span className="font-semibold">
            {formatCurrency(row.original.totalCost)}
          </span>
        ),
      },
      {
        accessorKey: "reason",
        header: "Reason",
        meta: { width: "15rem", cellClassName: "whitespace-normal" },
      },
      {
        accessorKey: "batchNumber",
        header: "Batch #",
        meta: { width: "10rem" },
      },
      {
        accessorKey: "source",
        header: "Source",
        meta: { width: "10rem" },
        cell: ({ row }) => (
          <Badge className="h-6 rounded-full bg-[var(--app-color-highlight-muted)] px-2 text-[length:var(--app-font-size-caption)] text-[var(--app-color-brand)]">
            {row.original.source}
          </Badge>
        ),
      },
      {
        accessorKey: "created_at",
        header: "Added",
        meta: { width: "12rem" },
        cell: ({ row }) => formatDateTime(row.original.created_at),
      },
    ],
    [],
  );

  const handleApplyFilters = (nextFilters) => {
    setCategoryFilters(nextFilters.categories);
    setReasonFilters(nextFilters.reasons);
    setReceivedDateRange(nextFilters.receivedDateRange);
    setExpirationDateRange(nextFilters.expirationDateRange);
    onQuickFilterChange(null);
    setCurrentPage(1);
  };

  return (
    <section className="inventory-wastage-table-section grid min-w-0 gap-[var(--app-gap-section)]">
      <div className="inventory-wastage-toolbar-region flex flex-wrap items-center justify-between gap-[var(--app-gap-related)] max-lg:items-stretch">
        <h2 className="ml-[var(--app-space-6)] text-[length:var(--app-font-size-h3)] font-bold leading-[var(--app-line-height-h3)] text-[var(--app-color-text)] max-lg:w-full">
          Wastage Logs
        </h2>

        <InventoryWastageToolbar
          key={`${categoryFilters.join("|")}-${reasonFilters.join("|")}-${receivedDateRange?.from ?? ""}-${receivedDateRange?.to ?? ""}-${expirationDateRange?.from ?? ""}-${expirationDateRange?.to ?? ""}`}
          searchTerm={searchTerm}
          categories={categories}
          logs={allLogs}
          filters={filters}
          sort={sort}
          isLoading={isLoading}
          onSearchChange={(value) => {
            setSearchTerm(value);
            setCurrentPage(1);
          }}
          onApplyFilters={handleApplyFilters}
          onSortChange={(nextSort) => {
            setSort(nextSort);
            setCurrentPage(1);
          }}
        />
      </div>

      <DataTable
        columns={columns}
        data={paginatedLogs}
        getRowId={(log) => String(log.id)}
        tableLabel="Inventory wastage logs"
        isLoading={isLoading}
        skeletonRowCount={6}
        errorMessage={error ?? ""}
        emptyMessage="No wastage logs match your filters."
        tableClassName="table-fixed"
        scrollAreaClassName="inventory-wastage-table-scroll-area"
        scrollbarOrientation="both"
      />

      <DataTablePagination
        totalItems={filteredLogs.length}
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

export default InventoryWastageTable;
