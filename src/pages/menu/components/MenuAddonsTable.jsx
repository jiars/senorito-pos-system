import { useMemo, useState } from "react";

import DataTable from "@/components/data-table/DataTable";
import DataTablePagination from "@/components/data-table/DataTablePagination";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { formatCurrency } from "@/utils/currencyFormatters";

const getStatusClassName = (status) => {
  if (status === "Available") {
    return "bg-[var(--app-color-success-surface)] text-[var(--app-color-success)]";
  }

  return "bg-[var(--app-color-danger-surface)] text-[var(--app-color-danger)]";
};

const MenuAddonsTable = ({
  addons = [],
  isLoading,
  mode = "active",
  onEdit,
  onArchive,
  onRestore,
  restoringAddonId = null,
}) => {
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);
  const isArchiveMode = mode === "archive";

  const totalPages = Math.max(1, Math.ceil(addons.length / pageSize));
  const safeCurrentPage = Math.min(currentPage, totalPages);

  const paginatedAddons = addons.slice(
    (safeCurrentPage - 1) * pageSize,
    safeCurrentPage * pageSize,
  );

  const columns = useMemo(
    () => [
      {
        accessorKey: "addon_name",
        header: "Name",
        meta: { width: "14rem" },
        cell: ({ row }) => (
          <span className="font-semibold text-[var(--app-color-text)]">
            {row.original.addon_name}
          </span>
        ),
      },
      {
        accessorKey: "selling_price",
        header: "Price",
        meta: { width: "7rem" },
        cell: ({ row }) => (
          <span className="font-semibold text-[var(--app-color-brand)]">
            {formatCurrency(row.original.selling_price)}
          </span>
        ),
      },
      {
        id: "applicableTo",
        header: "Applicable To",
        meta: { width: "13rem" },
        cell: ({ row }) => {
          const categoryNames = (row.original.addon_categories || [])
            .map((entry) => entry.menu_categories?.category_name)
            .filter(Boolean);

          return categoryNames.length > 0 ? categoryNames.join(", ") : "None";
        },
      },
      {
        accessorKey: "pos_status",
        header: "POS Status",
        meta: {
          width: "10rem",
          headerClassName: "text-center",
          cellClassName: "text-center",
        },
        cell: ({ row }) => (
          <Badge
            variant="secondary"
            className={getStatusClassName(row.original.pos_status)}
          >
            {row.original.pos_status}
          </Badge>
        ),
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
          const addon = row.original;

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

              <DropdownMenuContent align="end" className="z-[120] w-40">
                {isArchiveMode ? (
                  <DropdownMenuItem
                    disabled={restoringAddonId === addon.id}
                    onClick={() => onRestore?.(addon)}
                  >
                    <i
                      aria-hidden="true"
                      className="bi bi-arrow-counterclockwise"
                    />
                    {restoringAddonId === addon.id ? "Restoring..." : "Restore"}
                  </DropdownMenuItem>
                ) : (
                  <>
                    <DropdownMenuItem onClick={() => onEdit?.(addon)}>
                      <i aria-hidden="true" className="bi bi-pencil" />
                      Edit
                    </DropdownMenuItem>

                    <DropdownMenuItem
                      disabled={addon.archived === true}
                      onClick={() => onArchive?.(addon)}
                    >
                      <i aria-hidden="true" className="bi bi-archive" />
                      Archive
                    </DropdownMenuItem>
                  </>
                )}
              </DropdownMenuContent>
            </DropdownMenu>
          );
        },
      },
    ],
    [isArchiveMode, onArchive, onEdit, onRestore, restoringAddonId],
  );

  return (
    <section className="grid min-w-0 gap-[var(--app-gap-section)]">
      <DataTable
        columns={columns}
        data={paginatedAddons}
        getRowId={(addon) => String(addon.id)}
        tableLabel={isArchiveMode ? "Archived menu add-ons" : "Menu add-ons"}
        isLoading={isLoading}
        skeletonRowCount={6}
        emptyMessage={
          isArchiveMode
            ? "No archived add-ons match your search and filters."
            : "No add-ons match your search and filters."
        }
        tableClassName="table-fixed"
        scrollAreaClassName="menu-addons-table-scroll-area w-full"
        scrollbarOrientation="both"
      />

      <DataTablePagination
        totalItems={addons.length}
        pageSize={pageSize}
        pageSizeOptions={[10, 20, 30]}
        currentPage={safeCurrentPage}
        onPageChange={setCurrentPage}
        onPageSizeChange={setPageSize}
        isLoading={isLoading}
      />
    </section>
  );
};

export default MenuAddonsTable;
