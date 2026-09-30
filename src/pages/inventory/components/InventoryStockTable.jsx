import { useMemo, useState } from "react";

import DataTable from "@/components/data-table/DataTable";
import DataTablePagination from "@/components/data-table/DataTablePagination";
import FilterOptionGroup from "@/components/filters/FilterOptionGroup";
import FilterPopover from "@/components/filters/FilterPopover";
import ToolbarSearchInput from "@/components/filters/ToolbarSearchInput";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSub,
  DropdownMenuSubContent,
  DropdownMenuSubTrigger,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Skeleton } from "@/components/ui/skeleton";
import { getExpiryInfo } from "@/utils/inventoryExpiryUtils";
import {
  filterAndSortInventoryItems,
  getInventoryLastUpdatedInfo,
  getInventoryStockStatus,
} from "@/utils/inventory/inventoryStockOverviewUtils";

const stockStatusOptions = [
  { label: "In-stock", value: "In-stock" },
  { label: "Low Stock", value: "Low Stock" },
  { label: "Out of Stock", value: "Out of Stock" },
];

const expiryStatusOptions = [
  { label: "Good", value: "Good" },
  { label: "Expiring Soon", value: "Expiring Soon" },
  { label: "Expired", value: "Expired" },
  { label: "Non-Perishable", value: "Non-Perishable" },
  { label: "No Stock", value: "No Stock" },
];

const sortOptions = [
  { label: "0 - Z", value: "0-z" },
  { label: "Z - 0", value: "z-0" },
  { label: "Latest Added", value: "latest" },
  { label: "Oldest Added", value: "oldest" },
];

const getStatusClassName = (status) => {
  if (status === "In-stock")
    return "bg-[var(--app-color-success-surface)] text-[var(--app-color-success)]";

  if (status === "Low Stock")
    return "bg-[var(--app-color-warning-surface)] text-[var(--app-color-warning)]";

  return "bg-[var(--app-color-danger-surface)] text-[var(--app-color-danger)]";
};

const getExpiryClassName = (status) => {
  if (status === "Good" || status === "Non-Perishable")
    return "bg-[var(--app-color-success-surface)] text-[var(--app-color-success)]";

  if (status === "Expiring Soon")
    return "bg-[var(--app-color-warning-surface)] text-[var(--app-color-warning)]";

  return "bg-[var(--app-color-danger-surface)] text-[var(--app-color-danger)]";
};

const InventoryStockToolbar = ({
  searchTerm,
  categories,
  filters,
  sort,
  selectedItemsCount,
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
    sortOptions.find((option) => option.value === sort)?.label ?? "0 - Z";

  const clearFilters = () => {
    const clearedFilters = {
      categories: [],
      statuses: [],
      expiryStatuses: [],
    };
    setDraftFilters(clearedFilters);
    onApplyFilters(clearedFilters);
  };

  const sidebarSections = [
    {
      id: "categories",
      label: "Categories",
      icon: "bi-grid",
      indicator: draftFilters.categories.length > 0,
      content: (
        <FilterOptionGroup
          id="inventory-stock-categories"
          label="Categories"
          options={categoryOptions}
          selectedValues={draftFilters.categories}
          onSelectedValuesChange={(categories) =>
            setDraftFilters((current) => ({ ...current, categories }))
          }
          collapsible={false}
        />
      ),
    },
    {
      id: "status",
      label: "Status",
      icon: "bi-box-seam",
      indicator:
        draftFilters.statuses.length > 0 ||
        draftFilters.expiryStatuses.length > 0,
      content: (
        <div className="flex flex-col gap-[var(--app-gap-related)]">
          <FilterOptionGroup
            id="inventory-stock-status"
            label="Stock Status"
            options={stockStatusOptions}
            selectedValues={draftFilters.statuses}
            onSelectedValuesChange={(statuses) =>
              setDraftFilters((current) => ({ ...current, statuses }))
            }
            defaultOpen
          />

          <FilterOptionGroup
            id="inventory-expiry-status"
            label="Expiry Status"
            options={expiryStatusOptions}
            selectedValues={draftFilters.expiryStatuses}
            onSelectedValuesChange={(expiryStatuses) =>
              setDraftFilters((current) => ({
                ...current,
                expiryStatuses,
              }))
            }
            defaultOpen
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
        <Skeleton className="h-[var(--app-touch-target-min)] w-24 rounded-[var(--app-radius-control)]" />
        <Skeleton className="h-[var(--app-touch-target-min)] w-28 rounded-[var(--app-radius-control)]" />
      </div>
    );
  }

  return (
    <div className="flex flex-wrap items-center justify-end gap-[var(--app-space-2)]">
      <div className="w-full sm:w-[22rem]">
        <ToolbarSearchInput
          placeholder="Search for item..."
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
          id="inventory-stock-sort"
          label="Sort inventory"
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
        disabled={selectedItemsCount === 0}
        onClick={onPrintQRCode}
        className="h-[var(--app-touch-target-min)] rounded-[var(--app-radius-control)] border-[var(--app-color-border-subtle)] bg-[var(--app-color-surface)] px-[var(--app-space-4)] text-[length:var(--app-font-size-body-secondary)] text-[var(--app-color-filter-font-color)]  hover:bg-[var(--app-color-control-hover)]"
      >
        <i aria-hidden="true" className="bi bi-qr-code" />
        Print QR
      </Button>
    </div>
  );
};

const InventoryStockTable = ({
  inventoryItems,
  categories,
  isLoading,
  error,
  selectedStatuses,
  onSelectedStatusesChange,
  selectedItems,
  toggleVisibleItems,
  toggleItem,
  onPrintQRCode,
  onOpenRestock,
  onOpenWastage,
  onOpenCorrection,
  onOpenHistory,
  onOpenEdit,
  onOpenArchive,
}) => {
  const [searchTerm, setSearchTerm] = useState("");
  const [categoryFilters, setCategoryFilters] = useState([]);
  const [expiryStatusFilters, setExpiryStatusFilters] = useState([]);
  const [sort, setSort] = useState("0-z");
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);

  const filters = useMemo(
    () => ({
      categories: categoryFilters,
      statuses: selectedStatuses,
      expiryStatuses: expiryStatusFilters,
    }),
    [categoryFilters, expiryStatusFilters, selectedStatuses],
  );

  const filteredItems = useMemo(
    () =>
      filterAndSortInventoryItems({
        items: inventoryItems,
        searchTerm,
        categories: categoryFilters,
        statuses: selectedStatuses,
        expiryStatuses: expiryStatusFilters,
        sort,
      }),
    [
      categoryFilters,
      expiryStatusFilters,
      inventoryItems,
      searchTerm,
      selectedStatuses,
      sort,
    ],
  );

  const totalPages = Math.max(1, Math.ceil(filteredItems.length / pageSize));
  const safeCurrentPage = Math.min(currentPage, totalPages);
  const paginatedItems = filteredItems.slice(
    (safeCurrentPage - 1) * pageSize,
    safeCurrentPage * pageSize,
  );
  const visibleItemIds = useMemo(
    () => paginatedItems.map((item) => item.id),
    [paginatedItems],
  );
  const areAllVisibleItemsSelected =
    visibleItemIds.length > 0 &&
    visibleItemIds.every((id) => selectedItems.includes(id));

  const columns = useMemo(
    () => [
      {
        id: "select",
        header: () => (
          <Checkbox
            aria-label="Select all visible inventory items"
            checked={areAllVisibleItemsSelected}
            onCheckedChange={() => toggleVisibleItems(visibleItemIds)}
          />
        ),
        meta: { width: "3rem" },
        cell: ({ row }) => (
          <Checkbox
            aria-label={`Select ${row.original.item_name}`}
            checked={selectedItems.includes(row.original.id)}
            onCheckedChange={() => toggleItem(row.original.id)}
          />
        ),
      },
      {
        accessorKey: "item_name",
        header: "Name",
        meta: { width: "13rem" },
        cell: ({ row }) => (
          <span className="font-semibold">{row.original.item_name}</span>
        ),
      },
      {
        id: "category",
        header: "Category",
        meta: { width: "10rem" },
        cell: ({ row }) =>
          row.original.inventory_categories?.category_name ?? "—",
      },
      {
        accessorKey: "current_stock",
        header: "Qty",
        meta: { width: "5rem" },
        cell: ({ row }) => (
          <span className="font-semibold">{row.original.current_stock}</span>
        ),
      },
      { accessorKey: "base_unit", header: "Unit", meta: { width: "5rem" } },
      {
        accessorKey: "minimum_level",
        header: "Min Level",
        meta: { width: "7rem" },
      },
      {
        id: "status",
        header: "Status",
        meta: { width: "9rem" },
        cell: ({ row }) => {
          const status = getInventoryStockStatus(row.original);
          return (
            <Badge
              className={`h-6 rounded-full px-2 text-[length:var(--app-font-size-caption)] ${getStatusClassName(status)}`}
            >
              {status}
            </Badge>
          );
        },
      },
      {
        id: "expiry-status",
        header: "Expiry Status",
        meta: { width: "12rem" },
        cell: ({ row }) => {
          const expiry = getExpiryInfo(row.original);
          return (
            <div className="flex flex-col items-start gap-[var(--app-space-1)]">
              <Badge
                className={`h-6 rounded-full px-2 text-[length:var(--app-font-size-caption)] ${getExpiryClassName(expiry.status)}`}
              >
                {expiry.status}
              </Badge>
              <span className="text-[length:var(--app-font-size-caption)] text-[var(--app-color-text-subtle)]">
                {expiry.label}
              </span>
            </div>
          );
        },
      },
      {
        id: "last-updated",
        header: "Last Updated",
        meta: { width: "10rem" },
        cell: ({ row }) => {
          const update = getInventoryLastUpdatedInfo(row.original);
          return update ? (
            <div className="flex flex-col">
              <span>{update.date}</span>
              <span className="text-[length:var(--app-font-size-caption)] text-[var(--app-color-text-subtle)]">
                {update.action}
              </span>
            </div>
          ) : (
            "—"
          );
        },
      },
      {
        id: "actions",
        header: "Actions",
        meta: { width: "5rem" },
        cell: ({ row }) => (
          <DropdownMenu>
            <DropdownMenuTrigger
              render={
                <Button
                  type="button"
                  variant="ghost"
                  size="icon"
                  className="size-8 rounded-[var(--app-radius-nested)] text-[var(--app-color-text)] hover:bg-[var(--app-color-control-hover)]"
                >
                  <i aria-hidden="true" className="bi bi-three-dots-vertical" />
                </Button>
              }
            />
            <DropdownMenuContent align="end" className="z-[100] w-44">
              <DropdownMenuSub>
                <DropdownMenuSubTrigger>
                  <i aria-hidden="true" className="bi bi-card-list" />
                  Stock Log
                </DropdownMenuSubTrigger>
                <DropdownMenuSubContent className="z-[110] min-w-40">
                  <DropdownMenuItem onClick={() => onOpenRestock(row.original)}>
                    <i aria-hidden="true" className="bi bi-box-seam" />
                    Restock
                  </DropdownMenuItem>
                  <DropdownMenuItem
                    onClick={() => onOpenWastage(row.original)}
                  >
                    <i aria-hidden="true" className="bi bi-droplet" />
                    Wastage
                  </DropdownMenuItem>
                  <DropdownMenuItem
                    onClick={() => onOpenCorrection(row.original)}
                  >
                    <i
                      aria-hidden="true"
                      className="bi bi-arrow-counterclockwise"
                    />
                    Correction
                  </DropdownMenuItem>
                </DropdownMenuSubContent>
              </DropdownMenuSub>

              {[
                ["History", "bi-clock-history", onOpenHistory],
                ["Edit item", "bi-pencil", onOpenEdit],
                ["Archive item", "bi-archive", onOpenArchive],
              ].map(([label, icon, handler]) => (
                <DropdownMenuItem
                  key={label}
                  onClick={() => handler(row.original)}
                >
                  <i aria-hidden="true" className={`bi ${icon}`} />
                  {label}
                </DropdownMenuItem>
              ))}
            </DropdownMenuContent>
          </DropdownMenu>
        ),
      },
    ],
    [
      areAllVisibleItemsSelected,
      onOpenArchive,
      onOpenEdit,
      onOpenHistory,
      onOpenCorrection,
      onOpenRestock,
      onOpenWastage,
      selectedItems,
      toggleItem,
      toggleVisibleItems,
      visibleItemIds,
    ],
  );

  const handleApplyFilters = (nextFilters) => {
    setCategoryFilters(nextFilters.categories);
    setExpiryStatusFilters(nextFilters.expiryStatuses);
    onSelectedStatusesChange(nextFilters.statuses);
    setCurrentPage(1);
  };

  return (
    <section className="inventory-stock-table-section grid min-w-0 gap-[var(--app-gap-section)]">
      <div className="inventory-stock-toolbar-region flex flex-wrap items-center justify-between max-lg:items-stretch">
        <h2 className="ml-[var(--app-space-6)] text-[length:var(--app-font-size-h3)] font-bold leading-[var(--app-line-height-h3)] text-[var(--app-color-text)] max-lg:w-full">
          Inventory Items
        </h2>

        <InventoryStockToolbar
          key={`${categoryFilters.join("|")}-${selectedStatuses.join("|")}-${expiryStatusFilters.join("|")}`}
          searchTerm={searchTerm}
          categories={categories}
          filters={filters}
          sort={sort}
          selectedItemsCount={selectedItems.length}
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
        data={paginatedItems}
        getRowId={(item) => String(item.id)}
        tableLabel="Inventory stock overview"
        isLoading={isLoading}
        skeletonRowCount={6}
        errorMessage={error ?? ""}
        emptyMessage="No inventory items match your filters."
        tableClassName="table-fixed"
        scrollAreaClassName="inventory-stock-table-scroll-area"
        scrollbarOrientation="both"
      />

      <DataTablePagination
        totalItems={filteredItems.length}
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

export default InventoryStockTable;
