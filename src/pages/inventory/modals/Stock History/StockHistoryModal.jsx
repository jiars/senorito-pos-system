import { useMemo, useState } from "react";
import { useQuery } from "@tanstack/react-query";
import DataTable from "@/components/data-table/DataTable";
import DataTablePagination from "@/components/data-table/DataTablePagination";
import Modal from "@/components/modals/Modal";
import ModalBody from "@/components/modals/ModalBody";
import ModalContent from "@/components/modals/ModalContent";
import ModalFooter from "@/components/modals/ModalFooter";
import ModalHeader from "@/components/modals/ModalHeader";
import { Button } from "@/components/ui/button";
import { fetchItemAuditLogs } from "@/services/inventory/inventoryStockService";
import { formatCurrency } from "@/utils/currencyFormatters";
import { formatDateTime } from "@/utils/dateFormatters";
import { getAuditBatch, getAuditPerformer } from "@/utils/inventory/inventoryAuditLogUtils";

const StockHistoryModalContent = ({ onClose, item }) => {
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);
  // Keep the existing audit service; React Query owns loading/error/retry.
  const query = useQuery({
    queryKey: ["inventory-item-audit-logs", item.id],
    queryFn: () => fetchItemAuditLogs(item.id),
    staleTime: 0,
    refetchOnMount: "always",
  });
  const logs = query.data || [];
  const totalPages = Math.max(1, Math.ceil(logs.length / pageSize));
  const safeCurrentPage = Math.min(currentPage, totalPages);
  const currentRows = logs.slice((safeCurrentPage - 1) * pageSize, safeCurrentPage * pageSize);
  const columns = useMemo(() => [
    {
      accessorKey: "created_at", header: "Date",
      meta: { width: "11rem" },
      cell: ({ row }) => formatDateTime(row.original.created_at),
    },
    {
      accessorKey: "action", header: "Action", meta: { width: "10rem" },
      cell: ({ row }) => {
        const action = row.original.action;
        let tone = "bg-[var(--app-color-filter-bg)] text-[var(--app-color-text-muted)]";
        if (action === "Purchase") tone = "bg-[var(--app-color-success-surface)] text-[var(--app-color-confirm-success)]";
        if (action === "Sale" || action === "Wastage") tone = "bg-[var(--app-color-danger-surface)] text-[var(--app-color-danger)]";
        return <span className={`inline-flex rounded-full px-[var(--app-space-2)] py-[var(--app-space-1)] text-[length:var(--app-font-size-caption)] font-medium ${tone}`}>{action}</span>;
      },
    },
    {
      id: "change", header: "Change", meta: { width: "6rem" },
      cell: ({ row }) => {
        // Preserve the original history calculation rather than changing to quantity_change.
        const change = Number(row.original.stock_after) - Number(row.original.stock_before);
        let tone = "text-[var(--app-color-text-muted)]";
        if (change > 0) tone = "text-[var(--app-color-confirm-success)]";
        if (change < 0) tone = "text-[var(--app-color-danger)]";
        return <span className={`font-semibold ${tone}`}>{change > 0 ? "+" : ""}{change}</span>;
      },
    },
    { accessorKey: "stock_before", header: "Before", meta: { width: "6rem" } },
    { accessorKey: "stock_after", header: "After", meta: { width: "6rem" } },
    {
      id: "batch", header: "Batch", meta: { width: "10rem" },
      cell: ({ row }) => {
        const batch = getAuditBatch(row.original);
        return batch && batch.batch_number ? batch.batch_number : "—";
      },
    },
    {
      id: "cost", header: "Cost Per Unit", meta: { width: "8rem" },
      cell: ({ row }) => {
        const batch = getAuditBatch(row.original);
        if (!batch || !batch.inventory_purchase_history || batch.inventory_purchase_history.length === 0) return "—";
        const cost = batch.inventory_purchase_history[0].cost_per_unit;
        if (cost === null || cost === undefined) return "—";
        return formatCurrency(cost);
      },
    },
    {
      accessorKey: "reason_reference", header: "Reason", meta: { width: "15rem" },
      cell: ({ row }) => row.original.reason_reference || "—",
    },
    {
      id: "performer", header: "Changed By", meta: { width: "10rem" },
      cell: ({ row }) => {
        const performer = getAuditPerformer(row.original);
        if (!performer) return "Unknown";
        return `${performer.first_name || ""} ${performer.last_name || ""}`.trim() || "Unknown";
      },
    },
  ], []);

  return (
    <Modal isOpen={true} onClose={onClose} maxWidth="72rem" maxHeight="min(90svh, 48rem)">
      <ModalHeader title="Stock History" description={item.item_name} iconClassName="bi bi-clock-history" />
      <ModalBody viewportClassName="!max-h-[calc(var(--app-modal-max-height)-10rem)]">
        <ModalContent>
          <section aria-label={`Stock history for ${item.item_name}`} className="min-w-0">
            <DataTable
              columns={columns} data={currentRows} getRowId={(log) => String(log.id)}
              tableLabel="Item stock history" isLoading={query.isPending || query.isFetching}
              skeletonRowCount={5} errorMessage={query.isError ? "Couldn’t load stock history. Please retry." : ""}
              emptyMessage="No history found for this item." tableClassName="table-fixed"
              scrollbarOrientation="both" scrollAreaClassName="max-h-[min(48svh,26rem)] w-full"
            />
            {query.isError && !query.isFetching && (
              <Button type="button" variant="outline" onClick={() => query.refetch()}
                className="mt-[var(--app-space-4)] min-h-[var(--app-touch-target-min)] text-[length:var(--app-font-size-body-secondary)]">
                Retry history
              </Button>
            )}
          </section>
        </ModalContent>
      </ModalBody>
      <ModalFooter className="!block">
        {!query.isError && (
          <DataTablePagination totalItems={logs.length} pageSize={pageSize} currentPage={safeCurrentPage}
            onPageChange={setCurrentPage} onPageSizeChange={setPageSize}
            isLoading={query.isPending || query.isFetching}
            pageSizeSelectContentProps={{ positionerClassName: "!z-[1100]", className: "!z-[1100]" }}
          />
        )}
      </ModalFooter>
    </Modal>
  );
};

const StockHistoryModal = ({ isOpen, item, ...modalProps }) => {
  if (!isOpen || !item) return null;
  return <StockHistoryModalContent key={item.id} item={item} {...modalProps} />;
};
export default StockHistoryModal;
