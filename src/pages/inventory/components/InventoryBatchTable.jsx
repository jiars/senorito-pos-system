import { useMemo, useState } from "react";

import DataTable from "@/components/data-table/DataTable";
import DataTablePagination from "@/components/data-table/DataTablePagination";
import FilterDateRange from "@/components/filters/FilterDateRange";
import FilterOptionGroup from "@/components/filters/FilterOptionGroup";
import FilterPopover from "@/components/filters/FilterPopover";
import ToolbarSearchInput from "@/components/filters/ToolbarSearchInput";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { Skeleton } from "@/components/ui/skeleton";
import { formatDate } from "@/utils/dateFormatters";
import { formatCurrency } from "@/utils/currencyFormatters";
import {
  filterAndSortInventoryBatches,
  flattenInventoryBatches,
} from "@/utils/inventory/inventoryBatchUtils";

const batchStatusOptions = [
  { label: "Good", value: "Good" },
  { label: "Expiring in 7 days", value: "Expiring in 7 days" },
  { label: "Expired", value: "Expired" },
  { label: "No Expiry", value: "No Expiry" },
];

const sortOptions = [
  { label: "Latest Added", value: "latest" },
  { label: "Oldest Added", value: "oldest" },
];

const getStatusClassName = (status) => {
  if (status === "Good" || status === "No Expiry") {
    return "bg-[var(--app-color-success-surface)] text-[var(--app-color-success)]";
  }

  if (status === "Expiring in 7 days") {
    return "bg-[var(--app-color-warning-surface)] text-[var(--app-color-warning)]";
  }

  return "bg-[var(--app-color-danger-surface)] text-[var(--app-color-danger)]";
};

const InventoryBatchToolbar = ({
  searchTerm,
  categories,
  filters,
  sort,
  selectedCount,
  isLoading,
  onSearchChange,
  onApplyFilters,
  onSortChange,
  onPrintQRCode,
}) => {
  const [draftFilters, setDraftFilters] = useState(filters);
  const categoryOptions = categories.map((category) => ({
    label: category.category_name,
    value: category.category_name,
  }));
  const sortLabel =
    sortOptions.find((option) => option.value === sort)?.label ??
    "Latest Added";

  const clearFilters = () => {
    const clearedFilters = {
      categories: [],
      statuses: [],
      receivedDateRange: undefined,
      expirationDateRange: undefined,
    };
    setDraftFilters(clearedFilters);
    onApplyFilters(clearedFilters);
  };

  const sidebarSections = [
    {
      id: "batch-timeframe",
      label: "Timeframe",
      icon: "bi-calendar-range",
      indicator:
        Boolean(draftFilters.receivedDateRange?.from) ||
        Boolean(draftFilters.expirationDateRange?.from),
      content: (
        <div className="flex flex-col gap-[var(--app-gap-related)]">
          <FilterDateRange
            id="inventory-batch-received-date"
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
            id="inventory-batch-expiration-date"
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
      id: "batch-categories",
      label: "Categories",
      icon: "bi-grid",
      indicator: draftFilters.categories.length > 0,
      content: (
        <FilterOptionGroup
          id="inventory-batch-categories"
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
      id: "batch-status",
      label: "Batch Status",
      icon: "bi-calendar2-check",
      indicator: draftFilters.statuses.length > 0,
      content: (
        <FilterOptionGroup
          id="inventory-batch-status"
          label="Batch Status"
          options={batchStatusOptions}
          selectedValues={draftFilters.statuses}
          onSelectedValuesChange={(statuses) =>
            setDraftFilters((current) => ({ ...current, statuses }))
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
          placeholder="Search item, batch, source..."
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
          id="inventory-batch-sort"
          label="Sort batches"
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

      <Button
        type="button"
        variant="outline"
        disabled={selectedCount === 0}
        onClick={onPrintQRCode}
        className="h-[var(--app-touch-target-min)] rounded-[var(--app-radius-control)] border-[var(--app-color-border-subtle)] bg-[var(--app-color-surface)] px-[var(--app-space-4)] text-[length:var(--app-font-size-body-secondary)] text-[var(--app-color-filter-font-color)] shadow-[var(--app-shadow-card)] hover:bg-[var(--app-color-control-hover)]"
      >
        <i aria-hidden="true" className="bi bi-qr-code" />
        Print QR
      </Button>
    </div>
  );
};

const InventoryBatchTable = ({
  inventoryItems,
  categories,
  isLoading,
  error,
  selectedStatuses,
  onSelectedStatusesChange,
  selectedBatchIds,
  onToggleVisibleBatches,
  onToggleBatch,
  onPrintQRCode,
}) => {
  const [searchTerm, setSearchTerm] = useState("");
  const [categoryFilters, setCategoryFilters] = useState([]);
  const [receivedDateRange, setReceivedDateRange] = useState(undefined);
  const [expirationDateRange, setExpirationDateRange] = useState(undefined);
  const [sort, setSort] = useState("latest");
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);

  const allBatches = useMemo(
    () => flattenInventoryBatches(inventoryItems),
    [inventoryItems],
  );
  const filters = useMemo(
    () => ({
      categories: categoryFilters,
      statuses: selectedStatuses,
      receivedDateRange,
      expirationDateRange,
    }),
    [categoryFilters, expirationDateRange, receivedDateRange, selectedStatuses],
  );
  const filteredBatches = useMemo(
    () =>
      filterAndSortInventoryBatches({
        batches: allBatches,
        searchTerm,
        categories: categoryFilters,
        statuses: selectedStatuses,
        receivedDateRange,
        expirationDateRange,
        sort,
      }),
    [
      allBatches,
      categoryFilters,
      expirationDateRange,
      receivedDateRange,
      searchTerm,
      selectedStatuses,
      sort,
    ],
  );
  const totalPages = Math.max(1, Math.ceil(filteredBatches.length / pageSize));
  const safeCurrentPage = Math.min(currentPage, totalPages);
  const paginatedBatches = filteredBatches.slice(
    (safeCurrentPage - 1) * pageSize,
    safeCurrentPage * pageSize,
  );
  const visibleBatchIds = useMemo(
    () => paginatedBatches.map((batch) => batch.id),
    [paginatedBatches],
  );
  const areAllVisibleBatchesSelected =
    visibleBatchIds.length > 0 &&
    visibleBatchIds.every((id) => selectedBatchIds.includes(id));

  const columns = useMemo(
    () => [
      {
        id: "select",
        header: () => (
          <Checkbox
            aria-label="Select all visible batches"
            checked={areAllVisibleBatchesSelected}
            onCheckedChange={() => onToggleVisibleBatches(visibleBatchIds)}
          />
        ),
        meta: { width: "3rem" },
        cell: ({ row }) => (
          <Checkbox
            aria-label={`Select batch ${row.original.batch_number}`}
            checked={selectedBatchIds.includes(row.original.id)}
            onCheckedChange={() => onToggleBatch(row.original.id)}
          />
        ),
      },
      {
        accessorKey: "batch_number",
        header: "Batch #",
        meta: { width: "12rem" },
        cell: ({ row }) => (
          <span className="font-semibold">
            {row.original.batch_number || "—"}
          </span>
        ),
      },
      {
        accessorKey: "quantity",
        header: "Quantity",
        meta: { width: "9rem" },
        cell: ({ row }) => (
          <span>
            {row.original.quantity} {row.original.unit}
          </span>
        ),
      },
      {
        accessorKey: "unit_cost",
        header: "Unit Cost",
        meta: { width: "9rem" },
        cell: ({ row }) => formatCurrency(Number(row.original.unit_cost ?? 0)),
      },
      {
        accessorKey: "expiration_date",
        header: "Expiration",
        meta: { width: "10rem" },
        cell: ({ row }) =>
          row.original.expiration_date
            ? formatDate(row.original.expiration_date)
            : "No Expiry",
      },
      {
        accessorKey: "displayStatus",
        header: "Status",
        meta: { width: "11rem" },
        cell: ({ row }) => (
          <Badge
            className={`h-6 rounded-full px-2 text-[length:var(--app-font-size-caption)] ${getStatusClassName(row.original.displayStatus)}`}
          >
            {row.original.displayStatus}
          </Badge>
        ),
      },
      {
        accessorKey: "source",
        header: "Source",
        meta: { width: "10rem" },
        cell: ({ row }) => row.original.source || "—",
      },
      {
        accessorKey: "created_at",
        header: "Added",
        meta: { width: "10rem" },
        cell: ({ row }) =>
          row.original.created_at ? formatDate(row.original.created_at) : "—",
      },
    ],
    [
      areAllVisibleBatchesSelected,
      onToggleBatch,
      onToggleVisibleBatches,
      selectedBatchIds,
      visibleBatchIds,
    ],
  );

  const handleApplyFilters = (nextFilters) => {
    setCategoryFilters(nextFilters.categories);
    onSelectedStatusesChange(nextFilters.statuses);
    setReceivedDateRange(nextFilters.receivedDateRange);
    setExpirationDateRange(nextFilters.expirationDateRange);
    setCurrentPage(1);
  };

  return (
    <section className="inventory-batch-table-section grid min-w-0 gap-[var(--app-gap-section)]">
      <div className="inventory-batch-toolbar-region flex flex-wrap items-center justify-between max-lg:items-stretch">
        <h2 className="ml-[var(--app-space-6)] text-[length:var(--app-font-size-h3)] font-bold leading-[var(--app-line-height-h3)] text-[var(--app-color-text)] max-lg:w-full">
          Item Batches
        </h2>

        <InventoryBatchToolbar
          key={`${categoryFilters.join("|")}-${selectedStatuses.join("|")}-${receivedDateRange?.from ?? ""}-${receivedDateRange?.to ?? ""}-${expirationDateRange?.from ?? ""}-${expirationDateRange?.to ?? ""}`}
          searchTerm={searchTerm}
          categories={categories}
          filters={filters}
          sort={sort}
          selectedCount={selectedBatchIds.length}
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
          onPrintQRCode={onPrintQRCode}
        />
      </div>

      <DataTable
        columns={columns}
        data={paginatedBatches}
        getRowId={(batch) => String(batch.id)}
        tableLabel="Inventory item batches"
        isLoading={isLoading}
        skeletonRowCount={6}
        errorMessage={error ?? ""}
        emptyMessage="No inventory batches match your filters."
        tableClassName="table-fixed"
        scrollAreaClassName="inventory-batch-table-scroll-area"
        scrollbarOrientation="both"
      />

      <DataTablePagination
        totalItems={filteredBatches.length}
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

export default InventoryBatchTable;
