import { Badge } from "@/components/ui/badge";
import DataTable from "@/components/data-table/DataTable";
import { formatCurrency } from "@/utils/currencyFormatters";
import { formatDateTime } from "@/utils/dateFormatters";

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
        return getCashierName(row.original.cashier);
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
            {formatDateTime(row.original.order_datetime)}
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
  const errorMessage = error ? error.message || "Unable to load orders." : "";

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
