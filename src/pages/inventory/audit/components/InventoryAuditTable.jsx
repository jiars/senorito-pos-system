import DataTable from "@/components/data-table/DataTable";
import { Badge } from "@/components/ui/badge";
import { formatAuditLog } from "../../../../utils/inventory/inventoryAuditLogUtils";

const getActionBadgeClassName = (action) => {
  if (action === "Wastage") {
    return "bg-[var(--app-color-danger-surface)] text-[var(--app-color-danger-foreground)]";
  }

  if (action === "Purchase") {
    return "bg-[rgb(70_181_73_/_12%)] text-[var(--app-color-success)]";
  }

  return "bg-[var(--app-color-highlight-muted)] text-[var(--app-color-brand)]";
};

const getSourceBadgeClassName = (source) => {
  if (source === "Stock Log Modal") {
    return "bg-[var(--app-color-highlight-muted)] text-[var(--app-color-brand)]";
  }

  if (source === "Purchase Order") {
    return "bg-[rgb(70_181_73_/_12%)] text-[var(--app-color-success)]";
  }

  return "bg-[var(--app-color-brand-border)] text-[var(--app-color-brand)]";
};

const getAuditColumns = () => {
  return [
    {
      id: "dateTime",
      header: "Date & Time",
      meta: { width: "9rem" },
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
      header: "Item",
      meta: { width: "10rem", cellClassName: "whitespace-normal" },
      cell: ({ row }) => (
        <span className="font-medium">
          {formatAuditLog(row.original).itemName}
        </span>
      ),
    },
    {
      id: "action",
      header: "Action",
      meta: { width: "9rem" },
      cell: ({ row }) => {
        const auditRow = formatAuditLog(row.original);

        return (
          <Badge
            className={`h-6 rounded-full px-2 text-[length:var(--app-font-size-caption)] font-medium ${getActionBadgeClassName(auditRow.action)}`}
          >
            {auditRow.action}
          </Badge>
        );
      },
    },
    {
      id: "source",
      header: "Source",
      meta: { width: "9rem" },
      cell: ({ row }) => {
        const auditRow = formatAuditLog(row.original);

        return (
          <Badge
            className={`h-6 rounded-full px-2 text-[length:var(--app-font-size-caption)] font-medium ${getSourceBadgeClassName(auditRow.source)}`}
          >
            {auditRow.source}
          </Badge>
        );
      },
    },
    {
      id: "change",
      header: "Change",
      meta: { width: "6rem" },
      cell: ({ row }) => (
        <span className="font-semibold">
          {formatAuditLog(row.original).change}
        </span>
      ),
    },
    {
      id: "before",
      header: "Before",
      meta: { width: "5rem" },
      cell: ({ row }) => formatAuditLog(row.original).before,
    },
    {
      id: "after",
      header: "After",
      meta: { width: "5rem" },
      cell: ({ row }) => formatAuditLog(row.original).after,
    },
    {
      id: "batch",
      header: "Batch",
      meta: { width: "8rem" },
      cell: ({ row }) => (
        <span className="font-semibold">
          {formatAuditLog(row.original).batchNumber}
        </span>
      ),
    },
    {
      id: "reason",
      header: "Reason",
      meta: { width: "10rem", cellClassName: "whitespace-normal" },
      cell: ({ row }) => formatAuditLog(row.original).reason,
    },
    {
      id: "reference",
      header: "Ref #",
      meta: { width: "8rem" },
      cell: ({ row }) => formatAuditLog(row.original).reference,
    },
    {
      id: "by",
      header: "By",
      meta: { width: "9rem" },
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
      scrollAreaClassName="audit-table-scroll-area"
      scrollbarOrientation="both"
    />
  );
};

export default InventoryAuditTable;
