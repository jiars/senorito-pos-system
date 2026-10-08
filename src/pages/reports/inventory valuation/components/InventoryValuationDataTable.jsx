import DataTable from "@/components/data-table/DataTable";
import { formatCurrency } from "@/utils/shared/formatters/currencyFormatters";

const valuationColumns = [
  {
    accessorKey: "item",
    header: "Item",
    meta: { width: "20rem" },
    cell: ({ row }) => <span className="font-semibold">{row.original.item}</span>,
  },
  {
    accessorKey: "category",
    header: "Category",
    meta: { width: "12rem" },
  },
  {
    accessorKey: "stock",
    header: "Stock",
    meta: { width: "6rem" },
    cell: ({ row }) => <span className="font-semibold">{row.original.stock}</span>,
  },
  {
    accessorKey: "unit",
    header: "Unit",
    meta: { width: "6rem" },
  },
  {
    accessorKey: "minimum",
    header: "Reorder",
    meta: { width: "6rem" },
  },
  {
    accessorKey: "cost",
    header: "Cost / Unit",
    meta: { width: "9rem" },
    cell: ({ row }) => formatCurrency(row.original.cost),
  },
  {
    accessorKey: "value",
    header: "Total Value",
    meta: { width: "13rem" },
    cell: ({ row }) => (
      <span className="font-semibold">{formatCurrency(row.original.value)}</span>
    ),
  },
  {
    accessorKey: "pct",
    header: "% of Total",
    meta: { width: "13rem" },
    cell: ({ row }) => `${row.original.pct}%`,
  },
];

const InventoryValuationDataTable = ({ items, isLoading, error }) => {
  return (
    <DataTable
      columns={valuationColumns}
      data={items}
      getRowId={(item) => String(item.id)}
      tableLabel="Inventory valuation items"
      isLoading={isLoading}
      skeletonRowCount={6}
      errorMessage={error || ""}
      emptyMessage="No inventory items found matching your filters."
      scrollAreaClassName="valuation-table-scroll-area"
      scrollbarOrientation="both"
    />
  );
};

export default InventoryValuationDataTable;
