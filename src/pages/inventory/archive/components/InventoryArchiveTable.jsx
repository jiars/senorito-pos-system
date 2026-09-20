import { useMemo, useState } from "react";

import DataTable from "@/components/data-table/DataTable";
import DataTablePagination from "@/components/data-table/DataTablePagination";
import FilterOptionGroup from "@/components/filters/FilterOptionGroup";
import FilterPopover from "@/components/filters/FilterPopover";
import ToolbarSearchInput from "@/components/filters/ToolbarSearchInput";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { formatDateTime } from "@/utils/dateFormatters";
import { getExpiryInfo } from "@/utils/inventoryExpiryUtils";
import { getInventoryStockStatus } from "@/utils/inventory/inventoryStockOverviewUtils";

const stockStatusOptions = [
  { label: "In Stock", value: "In-stock" },
  { label: "Low Stock", value: "Low Stock" },
  { label: "No Stock", value: "Out of Stock" },
];

const expiryStatusOptions = [
  { label: "Good", value: "Good" },
  { label: "Expired", value: "Expired" },
  { label: "Expiring Soon", value: "Expiring Soon" },
];

const getStockStatusClassName = (status) => {
  if (status === "In-stock")
    return "bg-[var(--app-color-success-surface)] text-[var(--app-color-success)]";

  if (status === "Low Stock")
    return "bg-[var(--app-color-warning-surface)] text-[var(--app-color-warning)]";

  return "bg-[var(--app-color-danger-surface)] text-[var(--app-color-danger)]";
};

const getExpiryStatusClassName = (status) => {
  if (status === "Good" || status === "Non-Perishable")
    return "bg-[var(--app-color-success-surface)] text-[var(--app-color-success)]";

  if (status === "Expiring Soon")
    return "bg-[var(--app-color-warning-surface)] text-[var(--app-color-warning)]";

  return "bg-[var(--app-color-danger-surface)] text-[var(--app-color-danger)]";
};

const InventoryArchiveToolbar = ({
  searchQuery,
  categories,
  filters,
  isLoading,
  onSearchChange,
  onApplyFilters,
}) => {
  const [draftFilters, setDraftFilters] = useState(filters);
  const categoryOptions = categories.map((category) => ({
    label: category,
    value: category,
  }));

  const clearFilters = () => {
    const clearedFilters = {
      categories: [],
      stockStatuses: [],
      expiryStatuses: [],
    };

    setDraftFilters(clearedFilters);
    onApplyFilters(clearedFilters);
  };

  const sidebarSections = [
    {
      id: "archive-categories",
      label: "Categories",
      icon: "bi-grid",
      indicator: draftFilters.categories.length > 0,
      content: (
        <FilterOptionGroup
          id="inventory-archive-categories"
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
      id: "archive-status",
      label: "Status",
      icon: "bi-box-seam",
      indicator:
        draftFilters.stockStatuses.length > 0 ||
        draftFilters.expiryStatuses.length > 0,
      content: (
        <div className="flex flex-col gap-[var(--app-gap-related)]">
          <FilterOptionGroup
            id="inventory-archive-stock-status"
            label="Stock Status"
            options={stockStatusOptions}
            selectedValues={draftFilters.stockStatuses}
            onSelectedValuesChange={(stockStatuses) =>
              setDraftFilters((current) => ({ ...current, stockStatuses }))
            }
            defaultOpen
          />

          <FilterOptionGroup
            id="inventory-archive-expiry-status"
            label="Expiry Status"
            options={expiryStatusOptions}
            selectedValues={draftFilters.expiryStatuses}
            onSelectedValuesChange={(expiryStatuses) =>
              setDraftFilters((current) => ({ ...current, expiryStatuses }))
            }
            defaultOpen
          />
        </div>
      ),
    },
  ];

  if (isLoading) {
    return (
      <div className="flex w-full flex-wrap justify-end gap-[var(--app-space-2)]">
        <Skeleton className="h-[var(--app-touch-target-min)] w-full rounded-[var(--app-radius-control)] sm:w-[22rem]" />
        <Skeleton className="h-[var(--app-touch-target-min)] w-28 rounded-[var(--app-radius-control)]" />
      </div>
    );
  }

  return (
    <div className="flex w-full flex-wrap items-center justify-end gap-[var(--app-space-2)]">
      <div className="w-full sm:w-[22rem]">
        <ToolbarSearchInput
          placeholder="Search archived item..."
          value={searchQuery}
          onValueChange={onSearchChange}
        />
      </div>

      <FilterPopover
        sidebarSections={sidebarSections}
        onApply={() => onApplyFilters(draftFilters)}
        onClear={clearFilters}
      />
    </div>
  );
};

const InventoryArchiveTable = ({
  archivedItems,
  isLoading,
  error,
  onRestoreItem,
}) => {
  const [searchQuery, setSearchQuery] = useState("");
  const [categoryFilters, setCategoryFilters] = useState([]);
  const [stockStatusFilters, setStockStatusFilters] = useState([]);
  const [expiryStatusFilters, setExpiryStatusFilters] = useState([]);
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);

  const categories = useMemo(
    () =>
      [
        ...new Set(
          archivedItems
            .map((item) => item.inventory_categories?.category_name)
            .filter(Boolean),
        ),
      ].sort((first, second) => first.localeCompare(second)),
    [archivedItems],
  );

  const filters = useMemo(
    () => ({
      categories: categoryFilters,
      stockStatuses: stockStatusFilters,
      expiryStatuses: expiryStatusFilters,
    }),
    [categoryFilters, expiryStatusFilters, stockStatusFilters],
  );

  const filteredItems = useMemo(() => {
    const normalizedSearch = searchQuery.trim().toLocaleLowerCase();

    return archivedItems.filter((item) => {
      const categoryName =
        item.inventory_categories?.category_name ?? "Uncategorized";
      const stockStatus = getInventoryStockStatus(item);
      const expiryStatus = getExpiryInfo(item).status;
      const matchesSearch =
        !normalizedSearch ||
        item.item_name.toLocaleLowerCase().includes(normalizedSearch);
      const matchesCategory =
        categoryFilters.length === 0 || categoryFilters.includes(categoryName);
      const matchesStockStatus =
        stockStatusFilters.length === 0 ||
        stockStatusFilters.includes(stockStatus);
      const matchesExpiryStatus =
        expiryStatusFilters.length === 0 ||
        expiryStatusFilters.includes(expiryStatus);

      return (
        matchesSearch &&
        matchesCategory &&
        matchesStockStatus &&
        matchesExpiryStatus
      );
    });
  }, [
    archivedItems,
    categoryFilters,
    expiryStatusFilters,
    searchQuery,
    stockStatusFilters,
  ]);

  const totalPages = Math.max(1, Math.ceil(filteredItems.length / pageSize));
  const safeCurrentPage = Math.min(currentPage, totalPages);
  const paginatedItems = filteredItems.slice(
    (safeCurrentPage - 1) * pageSize,
    safeCurrentPage * pageSize,
  );

  const columns = useMemo(
    () => [
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
        header: "Last Qty",
        meta: { width: "7rem" },
        cell: ({ row }) => (
          <span className="font-semibold">
            {row.original.current_stock ?? 0}
          </span>
        ),
      },
      { accessorKey: "base_unit", header: "Unit", meta: { width: "6rem" } },
      {
        accessorKey: "minimum_level",
        header: "Min Level",
        meta: { width: "8rem" },
      },
      {
        id: "stock-status",
        header: "Last Status",
        meta: { width: "10rem" },
        cell: ({ row }) => {
          const status = getInventoryStockStatus(row.original);
          return (
            <Badge
              className={`h-6 rounded-full px-2 text-[length:var(--app-font-size-caption)] ${getStockStatusClassName(status)}`}
            >
              {status}
            </Badge>
          );
        },
      },
      {
        id: "expiry-status",
        header: "Last Expiry Status",
        meta: { width: "13rem" },
        cell: ({ row }) => {
          const expiry = getExpiryInfo(row.original);
          return (
            <div className="flex flex-col items-start gap-[var(--app-space-1)]">
              <Badge
                className={`h-6 rounded-full px-2 text-[length:var(--app-font-size-caption)] ${getExpiryStatusClassName(expiry.status)}`}
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
          const fullName = [profile?.first_name, profile?.last_name]
            .filter(Boolean)
            .join(" ");
          return fullName || "—";
        },
      },
      {
        id: "actions",
        header: "Actions",
        meta: { width: "6rem" },
        cell: ({ row }) => (
          <Button
            type="button"
            variant="ghost"
            size="icon"
            aria-label={`Restore ${row.original.item_name}`}
            title="Restore item"
            onClick={() => onRestoreItem(row.original)}
            className="size-8 rounded-[var(--app-radius-nested)] text-[var(--app-color-brand)] hover:bg-[var(--app-color-control-hover)]"
          >
            <i aria-hidden="true" className="bi bi-box-arrow-up" />
          </Button>
        ),
      },
    ],
    [onRestoreItem],
  );

  const handleApplyFilters = (nextFilters) => {
    setCategoryFilters(nextFilters.categories);
    setStockStatusFilters(nextFilters.stockStatuses);
    setExpiryStatusFilters(nextFilters.expiryStatuses);
    setCurrentPage(1);
  };

  return (
    <section className="inventory-archive-table-section grid min-w-0 gap-[var(--app-gap-related)]">
      <div className="inventory-archive-toolbar-region flex min-w-0 flex-wrap items-center justify-end gap-[var(--app-space-2)]">
        <InventoryArchiveToolbar
          key={`${categoryFilters.join("|")}-${stockStatusFilters.join("|")}-${expiryStatusFilters.join("|")}`}
          searchQuery={searchQuery}
          categories={categories}
          filters={filters}
          isLoading={isLoading}
          onSearchChange={(value) => {
            setSearchQuery(value);
            setCurrentPage(1);
          }}
          onApplyFilters={handleApplyFilters}
        />
      </div>

      <DataTable
        columns={columns}
        data={paginatedItems}
        getRowId={(item) => String(item.id)}
        tableLabel="Archived inventory items"
        isLoading={isLoading}
        skeletonRowCount={6}
        errorMessage={error ?? ""}
        emptyMessage="No archived inventory items match your filters."
        tableClassName="table-fixed"
        scrollAreaClassName="inventory-archive-table-scroll-area"
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

export default InventoryArchiveTable;
