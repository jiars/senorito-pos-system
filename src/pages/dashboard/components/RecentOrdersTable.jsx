import { Badge } from "../../../components/ui/badge";
import DataTable from "../../../components/data-table/DataTable";
import { Card, CardContent, CardHeader } from "../../../components/ui/card";
import { formatCurrency } from "../../../utils/currencyFormatters";
import { formatDateTime } from "../../../utils/dateFormatters";
import { Skeleton } from "../../../components/ui/skeleton";

const getStatusClassName = (status) => {
  if (status === "Completed")
    return "bg-[rgb(70_181_73_/_12%)] text-[var(--app-color-success)]";

  if (status === "Cancelled")
    return "bg-[var(--app-color-danger-surface)] text-[var(--app-color-danger-foreground)]";

  return "bg-[var(--app-color-highlight-muted)] text-[var(--app-color-brand)]";
};

const recentOrderColumns = [
  {
    accessorKey: "orderNo",
    header: "Order No.",
    meta: { width: "10rem" },
    cell: ({ row }) => {
      return <span className="font-semibold">{row.original.orderNo}</span>;
    },
  },
  {
    accessorKey: "cashier",
    header: "Cashier",
    meta: { width: "10rem" },
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
    accessorKey: "payment",
    header: "Payment",
    meta: { width: "7rem" },
  },
  {
    accessorKey: "status",
    header: "Status",
    meta: { width: "8rem" },
    cell: ({ row }) => {
      const status = row.original.status;

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
    accessorKey: "date",
    header: "Date & Time",
    meta: { width: "13rem" },
    cell: ({ row }) => {
      return (
        <span className="text-[var(--app-color-text-subtle)]">
          {formatDateTime(row.original.date)}
        </span>
      );
    },
  },
];

const RecentOrdersTable = ({ recentOrders, isLoading }) => {
  if (isLoading) {
    return (
      <Card
        aria-busy="true"
        aria-label="Loading recent orders"
        className="gap-0 rounded-[var(--app-radius-panel-standard)] !py-0 !ring-0"
      >
        <CardHeader className="px-[var(--app-padding-panel)] pt-[var(--app-padding-panel)]">
          <Skeleton className="h-5 w-40" />
          <Skeleton className="h-3 w-60" />
        </CardHeader>

        <CardContent className="px-[var(--app-padding-panel)] pb-[var(--app-padding-panel)] pt-[var(--app-gap-section)]">
          <DataTable
            columns={recentOrderColumns}
            data={recentOrders}
            getRowId={(order) => order.orderNo}
            tableLabel="Recent orders"
            isLoading
            skeletonRowCount={6}
          />
        </CardContent>
      </Card>
    );
  }

  return (
    <section className="rounded-[var(--app-radius-panel-standard)] bg-[var(--app-color-surface)] p-[var(--app-padding-panel)] shadow-[var(--app-shadow-card)]">
      <header className="mb-[var(--app-gap-section)]">
        <h3 className="m-0 text-[length:var(--app-font-size-h3)] leading-[var(--app-line-height-h3)] font-bold text-[var(--app-color-text)]">
          Recent Orders
        </h3>

        <p className="mt-[var(--app-space-1)] text-[length:var(--app-font-size-caption)] leading-[var(--app-line-height-caption)] text-[var(--app-color-text-subtle)]">
          Your six most recent completed orders.
        </p>
      </header>

      <DataTable
        columns={recentOrderColumns}
        data={recentOrders}
        getRowId={(order) => order.orderNo}
        tableLabel="Recent orders"
        isLoading={isLoading}
        emptyMessage="No recent orders found."
      />
    </section>
  );
};

export default RecentOrdersTable;
