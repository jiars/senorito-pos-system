import DataTable from "@/components/data-table/DataTable";
import { Badge } from "@/components/ui/badge";
import { formatCurrency } from "@/utils/currencyFormatters";

const quadrantStyles = {
  star: "bg-[#e8f5e9] text-[#2e7d32]",
  promote: "bg-[#e0f7fa] text-[#0277bd]",
  pricing: "bg-[#fff8e1] text-[#a56700]",
  remove: "bg-[#ffebee] text-[#c62828]",
};

const profitabilityColumns = [
  {
    accessorKey: "item",
    header: "Item",
    meta: { width: "14rem" },
    cell: ({ row }) => <span className="font-semibold">{row.original.item}</span>,
  },
  { accessorKey: "category", header: "Category", meta: { width: "10rem" } },
  {
    accessorKey: "price",
    header: "Price",
    meta: { width: "8rem" },
    cell: ({ row }) => formatCurrency(row.original.price),
  },
  {
    accessorKey: "cost",
    header: "Est. Cost",
    meta: { width: "8rem" },
    cell: ({ row }) => formatCurrency(row.original.cost),
  },
  {
    accessorKey: "profitPerItem",
    header: "Profit / Item",
    meta: { width: "10rem" },
    cell: ({ row }) => (
      <span className="font-semibold">
        {formatCurrency(row.original.profitPerItem)}
      </span>
    ),
  },
  {
    accessorKey: "margin",
    header: "Margin %",
    meta: { width: "8rem" },
    cell: ({ row }) => `${row.original.margin.toFixed(1)}%`,
  },
  { accessorKey: "qty", header: "Units Sold", meta: { width: "9rem" } },
  {
    accessorKey: "revenue",
    header: "Revenue",
    meta: { width: "10rem" },
    cell: ({ row }) => formatCurrency(row.original.revenue),
  },
  {
    accessorKey: "quad",
    header: "Quadrant",
    meta: { width: "12rem" },
    cell: ({ row }) => (
      <Badge
        className={`h-auto border-0 px-[var(--app-space-2)] py-[var(--app-space-1)] text-[length:var(--app-font-size-caption)] font-semibold ${quadrantStyles[row.original.badge] ?? quadrantStyles.remove}`}
      >
        {row.original.quad}
      </Badge>
    ),
  },
];

export const sortProfitabilityRows = (rows, sort) => {
  const sortedRows = [...rows];

  return sortedRows.sort((first, second) => {
    if (sort === "Highest Profit") {
      return second.profitPerItem - first.profitPerItem;
    }

    if (sort === "Highest Margin") {
      return second.margin - first.margin;
    }

    if (sort === "Highest Unit Sold") {
      return second.qty - first.qty;
    }

    return second.revenue - first.revenue;
  });
};

const SalesProfitabilityTable = ({ items }) => {
  return (
    <DataTable
      columns={profitabilityColumns}
      data={items}
      getRowId={(item) => String(item.id ?? `${item.item}-${item.category}`)}
      tableLabel="Detailed menu profitability"
      emptyMessage="No profitability data is available for the selected period."
      className="!rounded-none !border-x-0 !border-b-0"
      scrollAreaClassName="w-full"
      scrollbarOrientation="both"
    />
  );
};

export default SalesProfitabilityTable;
