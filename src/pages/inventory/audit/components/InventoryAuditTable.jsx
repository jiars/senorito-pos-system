import DataTable from "@/components/data-table/DataTable";
import { Badge } from "@/components/ui/badge";
import { formatAuditLog } from "../../../../utils/inventory/inventoryAuditLogUtils";

const getActionBadgeClassName = (action) => {
  if (action === "Wastage") {
    return "bg-[var(--app-color-danger-surface)] text-[var(--app-color-danger-foreground)]";
  }

  if (action === "Purchase") {
    return "bg-[var(--app-color-success-surface)] text-[var(--app-color-success)]";
  }

  return "bg-[var(--app-color-highlight-muted)] text-[var(--app-color-brand)]";
};

const getAuditColumns = () => {
  return [
    {
      id: "dateTime",
      header: "Date & Time",
      meta: { width: "15%", headerClassName: "whitespace-normal" },
      cell: ({ row }) => {
        const auditRow = formatAuditLog(row.original);

        return (
          <div>
            <p className="font-medium">{auditRow.date}</p>
            <p className="text-[length:var(--app-font-size-caption)] leading-[var(--app-line-height-caption)] text-[var(--app-color-text-subtle)]">
              {auditRow.time}
            </p>
          </div>
        );
      },
    },
    {
      id: "item",
      header: "Item / Batch",
      meta: { width: "20%", headerClassName: "whitespace-normal" },
      cell: ({ row }) => {
        const auditRow = formatAuditLog(row.original);
        return (
          <div className="flex min-w-0 flex-col gap-[var(--app-space-1)] [overflow-wrap:anywhere]">
            <span className="font-medium">{auditRow.itemName}</span>
            <span className="text-[length:var(--app-font-size-caption)] leading-[var(--app-line-height-caption)] text-[var(--app-color-text-subtle)]">
              Batch: {auditRow.batchNumber}
            </span>
          </div>
        );
      },
    },
    {
      id: "action",
      header: "Activity",
      meta: { width: "17%" },
      cell: ({ row }) => {
        const auditRow = formatAuditLog(row.original);

        return (
          <div className="flex min-w-0 flex-col items-start gap-[var(--app-space-1)]">
            <Badge
              className={`min-h-6 max-w-full whitespace-normal break-words rounded-full px-2 text-[length:var(--app-font-size-caption)] font-medium ${getActionBadgeClassName(auditRow.action)}`}
            >
              {auditRow.action}
            </Badge>
            <span className="text-[length:var(--app-font-size-caption)] leading-[var(--app-line-height-caption)] text-[var(--app-color-text-subtle)] [overflow-wrap:anywhere]">
              Source: {auditRow.source}
            </span>
          </div>
        );
      },
    },
    {
      id: "change",
      header: "Stock Change",
      meta: { width: "16%", headerClassName: "whitespace-normal" },
      cell: ({ row }) => {
        const auditRow = formatAuditLog(row.original);
        return (
          <div className="flex flex-col gap-[var(--app-space-1)]">
            <span className="font-semibold">{auditRow.change}</span>
            <span className="text-[length:var(--app-font-size-caption)] leading-[var(--app-line-height-caption)] text-[var(--app-color-text-subtle)]">
              Before: {auditRow.before ?? "—"} → After: {auditRow.after ?? "—"}
            </span>
          </div>
        );
      },
    },
    {
      id: "reason",
      header: "Reason / Reference",
      meta: { width: "18%", headerClassName: "whitespace-normal" },
      cell: ({ row }) => {
        const auditRow = formatAuditLog(row.original);
        return (
          <div className="flex min-w-0 flex-col gap-[var(--app-space-1)] [overflow-wrap:anywhere]">
            <span>{auditRow.reason}</span>
            <span className="text-[length:var(--app-font-size-caption)] leading-[var(--app-line-height-caption)] text-[var(--app-color-text-subtle)]">
              Ref: {auditRow.reference}
            </span>
          </div>
        );
      },
    },
    {
      id: "by",
      header: "Recorded By",
      meta: { width: "14%", headerClassName: "whitespace-normal", cellClassName: "[overflow-wrap:anywhere]" },
      cell: ({ row }) => formatAuditLog(row.original).performerName,
    },
  ];
};

const InventoryAuditTable = ({ logs, isLoading, error }) => {
  const errorMessage = error || "";

  return (
    <DataTable
      columns={getAuditColumns()}
      data={logs}
      getRowId={(log) => String(log.id)}
      tableLabel="Inventory audit log"
      isLoading={isLoading}
      skeletonRowCount={12}
      errorMessage={errorMessage}
      emptyMessage="No audit logs found."
      tableClassName="table-fixed"
      scrollAreaClassName="audit-table-scroll-area"
      scrollbarOrientation="both"
    />
  );
};

export default InventoryAuditTable;
