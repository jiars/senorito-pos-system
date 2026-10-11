import { Badge } from "@/components/ui/badge";
import DataTable from "@/components/data-table/DataTable";
import { formatCurrency } from "@/utils/shared/formatters/currencyFormatters";
import { formatDateTime } from "@/utils/shared/formatters/dateFormatters";
import { BUSINESS_TIME_ZONE } from "@/utils/shared/formatters/businessDates";
import { getOrderUploaderName } from "@/utils/orders/orderFilters";

const getStatusClassName = (status) => {
  if (status === "Completed") {
    return "bg-[rgb(70_181_73_/_12%)] text-[var(--app-color-success)]";
  }

  if (status === "Cancelled") {
    return "bg-[var(--app-color-danger-surface)] text-[var(--app-color-danger-foreground)]";
  }

  return "bg-[var(--app-color-highlight-muted)] text-[var(--app-color-brand)]";
};

const getCashierName = (cashier) => {
  if (cashier) {
    return `${cashier.first_name} ${cashier.last_name}`;
  }

  return "Owner / System";
};

const getOrderHistoryColumns = (handleViewOrder) => {
  return [
    {
      accessorKey: "order_number",
      header: "Order No.",
      meta: { width: "10rem" },
      cell: ({ row }) => {
        return (
          <span className="font-semibold">{row.original.order_number}</span>
        );
      },
    },
    {
      id: "cashier",
      header: "Cashier",
      meta: { width: "10rem" },
      cell: ({ row }) => {
        const uploadedByName = getOrderUploaderName(row.original);

        // Internal upload details stay in Order History, outside the receipt.
        return (
          <div className="min-w-0 space-y-[var(--app-space-1)] whitespace-normal [overflow-wrap:anywhere]">
            <span>{getCashierName(row.original.cashier)}</span>
            {uploadedByName && (
              <p className="text-[length:var(--app-font-size-caption)] leading-[var(--app-line-height-caption)] text-[var(--app-color-text-muted)] print:hidden">
                Uploaded by: {uploadedByName}
              </p>
            )}
          </div>
        );
      },
    },
    {
      accessorKey: "total",
      header: "Total",
      meta: { width: "8rem" },
      cell: ({ row }) => {
        return (
          <span className="font-semibold">
            {formatCurrency(row.original.total)}
          </span>
        );
      },
    },
    {
      accessorKey: "payment_method",
      header: "Payment",
      meta: { width: "8rem" },
    },
    {
      accessorKey: "order_source",
      header: "Source",
      meta: { width: "8rem" },
    },
    {
      id: "status",
      header: "Status",
      meta: { width: "8rem" },
      cell: ({ row }) => {
        const status = row.original.status || "Completed";

        return (
          <Badge
            className={`h-6 rounded-full px-2 text-[length:var(--app-font-size-caption)] font-medium ${getStatusClassName(status)}`}
          >
            {status}
          </Badge>
        );
      },
    },
    {
      accessorKey: "order_datetime",
      header: "Date & Time",
      meta: { width: "13rem" },
      cell: ({ row }) => {
        return (
          <span className="text-[var(--app-color-text-subtle)]">
            {formatDateTime(row.original.order_datetime, BUSINESS_TIME_ZONE)}
          </span>
        );
      },
    },
    {
      id: "view",
      header: "View",
      meta: {
        width: "4.5rem",
        headerClassName: "text-center",
        cellClassName: "text-center",
      },
      cell: ({ row }) => {
        return (
          <button
            type="button"
            aria-label={`View ${row.original.order_number}`}
            title="View order"
            onClick={() => handleViewOrder(row.original)}
            className="inline-flex size-[var(--app-touch-target-min)] items-center justify-center rounded-[var(--app-radius-nested)] text-[var(--app-color-brand)] transition-colors hover:bg-[var(--app-color-control-hover)] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--app-color-brand-border)]"
          >
            <i aria-hidden="true" className="bi bi-eye text-base" />
          </button>
        );
      },
    },
  ];
};

const OrdersTable = ({
  isLoading,
  error,
  paginatedOrders,
  handleViewOrder,
}) => {
  const columns = getOrderHistoryColumns(handleViewOrder);
  const errorMessage = error || "";

  return (
    <div>
      <DataTable
        columns={columns}
        data={paginatedOrders}
        getRowId={(order) => String(order.id)}
        tableLabel="Order history"
        isLoading={isLoading}
        skeletonRowCount={6}
        errorMessage={errorMessage}
        emptyMessage="No orders found matching your criteria."
        scrollAreaClassName="orders-table-scroll-area"
        scrollbarOrientation="both"
      />
    </div>
  );
};

export default OrdersTable;
