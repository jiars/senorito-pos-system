import { useMemo, useState } from "react";

import DataTable from "@/components/data-table/DataTable";
import DataTablePagination from "@/components/data-table/DataTablePagination";
import FilterDateRange from "@/components/filters/FilterDateRange";
import FilterOptionGroup from "@/components/filters/FilterOptionGroup";
import FilterPopover from "@/components/filters/FilterPopover";
import ToolbarSearchInput from "@/components/filters/ToolbarSearchInput";
import { Skeleton } from "@/components/ui/skeleton";
import { formatCurrency } from "@/utils/currencyFormatters";
import { formatDateTime } from "@/utils/dateFormatters";
import {
  filterAndSortInventoryPurchases,
  normalizeInventoryPurchaseHistory,
} from "@/utils/inventory/inventoryPurchaseHistoryUtils";

const sortOptions = [
  { label: "Latest Added", value: "latest" },
  { label: "Oldest Added", value: "oldest" },
];

const InventoryPurchaseHistoryToolbar = ({
  searchTerm,
  filters,
  supplierOptions,
  sort,
  isLoading,
  onSearchChange,
  onApplyFilters,
  onSortChange,
}) => {
  const [draftFilters, setDraftFilters] = useState(filters);
  const sortLabel =
    sortOptions.find((option) => option.value === sort)?.label ??
    "Latest Added";

  const [supplierSearch, setSupplierSearch] = useState("");
  const visibleSupplierOptions = supplierOptions.filter((option) =>
    option.label
      .toLocaleLowerCase()
      .includes(supplierSearch.trim().toLocaleLowerCase()),
  );
  const clearFilters = () => {
    const clearedFilters = {
      suppliers: [],
      purchaseDateRange: undefined,
    };
    setSupplierSearch("");
    setDraftFilters(clearedFilters);
    onApplyFilters(clearedFilters);
  };

  const sidebarSections = [
    {
      id: "purchase-timeframe",
      label: "Timeframe",
      icon: "bi-calendar-range",
      indicator: Boolean(draftFilters.purchaseDateRange?.from),
      content: (
        <FilterDateRange
          id="inventory-purchase-date"
          label="Purchase Date"
          fromDate={draftFilters.purchaseDateRange?.from ?? ""}
          toDate={draftFilters.purchaseDateRange?.to ?? ""}
          onRangeChange={(from, to) =>
            setDraftFilters((current) => ({
              ...current,
              purchaseDateRange: { from, to },
            }))
          }
        />
      ),
    },
    {
      id: "purchase-suppliers",
      label: "Suppliers",
      icon: "bi-truck",
      indicator: draftFilters.suppliers.length > 0,
      content: (
        <div className="flex flex-col gap-[var(--app-space-2)]">
          <ToolbarSearchInput
            placeholder="Search suppliers..."
            value={supplierSearch}
            onValueChange={setSupplierSearch}
          />

          <FilterOptionGroup
            id="inventory-purchase-suppliers"
            label="Suppliers"
            options={visibleSupplierOptions}
            selectedValues={draftFilters.suppliers}
            onSelectedValuesChange={(suppliers) =>
              setDraftFilters((current) => ({ ...current, suppliers }))
            }
            collapsible={false}
          />
        </div>
      ),
    },
  ];

  if (isLoading) {
    return (
      <div className="flex flex-wrap justify-end gap-[var(--app-space-2)]">
        <Skeleton className="h-[var(--app-touch-target-min)] w-full rounded-[var(--app-radius-control)] sm:w-[22rem]" />
        <Skeleton className="h-[var(--app-touch-target-min)] w-28 rounded-[var(--app-radius-control)]" />
        <Skeleton className="h-[var(--app-touch-target-min)] w-32 rounded-[var(--app-radius-control)]" />
      </div>
    );
  }

  return (
    <div className="flex flex-wrap items-center justify-end gap-[var(--app-space-2)]">
      <div className="w-full sm:w-[22rem]">
        <ToolbarSearchInput
          placeholder="Search item, batch, supplier..."
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
          id="inventory-purchase-sort"
          label="Sort purchases"
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

const InventoryPurchaseHistoryTable = ({
  purchaseHistory,
  isLoading,
  error,
}) => {
  const [searchTerm, setSearchTerm] = useState("");
  const [supplierFilters, setSupplierFilters] = useState([]);
  const [purchaseDateRange, setPurchaseDateRange] = useState(undefined);
  const [sort, setSort] = useState("latest");
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);

  const purchases = useMemo(
    () => normalizeInventoryPurchaseHistory(purchaseHistory),
    [purchaseHistory],
  );
  const supplierOptions = useMemo(
    () =>
      [
        ...new Set(
          purchases.map((purchase) => purchase.supplier).filter(Boolean),
        ),
      ]
        .sort((first, second) => first.localeCompare(second))
        .map((supplier) => ({ label: supplier, value: supplier })),
    [purchases],
  );
  const filters = useMemo(
    () => ({ suppliers: supplierFilters, purchaseDateRange }),
    [purchaseDateRange, supplierFilters],
  );
  const filteredPurchases = useMemo(
    () =>
      filterAndSortInventoryPurchases({
        purchases,
        searchTerm,
        suppliers: supplierFilters,
        purchaseDateRange,
        sort,
      }),
    [purchases, purchaseDateRange, searchTerm, sort, supplierFilters],
  );
  const totalPages = Math.max(
    1,
    Math.ceil(filteredPurchases.length / pageSize),
  );
  const safeCurrentPage = Math.min(currentPage, totalPages);
  const paginatedPurchases = filteredPurchases.slice(
    (safeCurrentPage - 1) * pageSize,
    safeCurrentPage * pageSize,
  );

  const columns = useMemo(
    () => [
      {
        accessorKey: "purchased_at",
        header: "Purchase Date",
        meta: { width: "13rem" },
        cell: ({ row }) => formatDateTime(row.original.purchased_at),
      },
      {
        accessorKey: "itemName",
        header: "Item",
        meta: { width: "13rem" },
        cell: ({ row }) => (
          <span className="font-semibold">{row.original.itemName}</span>
        ),
      },
      {
        accessorKey: "batchNumber",
        header: "Batch #",
        meta: { width: "12rem" },
      },
      {
        accessorKey: "quantity_purchased",
        header: "Quantity",
        meta: { width: "10rem" },
        cell: ({ row }) => (
          <span className="font-semibold">
            {row.original.quantity_purchased} {row.original.purchase_unit}
          </span>
        ),
      },
      {
        accessorKey: "cost_per_unit",
        header: "Unit Cost",
        meta: { width: "9rem" },
        cell: ({ row }) => formatCurrency(row.original.cost_per_unit),
      },
      {
        accessorKey: "total_cost",
        header: "Total Cost",
        meta: { width: "10rem" },
        cell: ({ row }) => (
          <span className="font-semibold">
            {formatCurrency(row.original.total_cost)}
          </span>
        ),
      },
      {
        accessorKey: "supplier",
        header: "Supplier",
        meta: { width: "12rem" },
        cell: ({ row }) => row.original.supplier || "—",
      },
      {
        accessorKey: "recordedBy",
        header: "Recorded By",
        meta: { width: "12rem" },
      },
    ],
    [],
  );

  const handleApplyFilters = (nextFilters) => {
    setSupplierFilters(nextFilters.suppliers);
    setPurchaseDateRange(nextFilters.purchaseDateRange);
    setCurrentPage(1);
  };

  return (
    <section className="inventory-purchase-history-table-section grid min-w-0 gap-[var(--app-gap-section)]">
      <div className="inventory-purchase-history-toolbar-region flex flex-wrap items-center justify-between gap-[var(--app-gap-related)] max-lg:items-stretch">
        <h2 className="ml-[var(--app-space-6)] text-[length:var(--app-font-size-h3)] font-bold leading-[var(--app-line-height-h3)] text-[var(--app-color-text)] max-lg:w-full">
          Purchase History
        </h2>

        <InventoryPurchaseHistoryToolbar
          key={`${supplierFilters.join("|")}-${purchaseDateRange?.from ?? ""}-${purchaseDateRange?.to ?? ""}`}
          searchTerm={searchTerm}
          filters={filters}
          supplierOptions={supplierOptions}
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
        data={paginatedPurchases}
        getRowId={(purchase) => String(purchase.id)}
        tableLabel="Inventory purchase history"
        isLoading={isLoading}
        skeletonRowCount={6}
        errorMessage={error ?? ""}
        emptyMessage="No purchase history matches your filters."
        tableClassName="table-fixed"
        scrollAreaClassName="inventory-purchase-history-table-scroll-area"
        scrollbarOrientation="both"
      />

      <DataTablePagination
        totalItems={filteredPurchases.length}
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

export default InventoryPurchaseHistoryTable;
