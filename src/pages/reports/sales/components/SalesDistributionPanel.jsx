import DataTable from "@/components/data-table/DataTable";
import DataTableSheet from "@/components/data-table/DataTableSheet";
import EmptyState from "@/components/feedback/EmptyState";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { formatCurrency } from "@/utils/currencyFormatters";

import { DonutChart, PieChart } from "./SalesCharts";

const sourceColumns = [
  {
    accessorKey: "label",
    header: "Order Source",
    meta: { width: "10rem" },
    cell: ({ row }) => (
      <span className="font-semibold">{row.original.label}</span>
    ),
  },
  {
    accessorKey: "value",
    header: "Revenue",
    meta: { width: "10rem" },
    cell: ({ row }) => formatCurrency(row.original.value),
  },
  {
    accessorKey: "pct",
    header: "% of Total",
    meta: { width: "9rem" },
    cell: ({ row }) => `${row.original.pct.toFixed(1)}%`,
  },
];

const categoryColumns = [
  {
    accessorKey: "cat",
    header: "Category",
    meta: { width: "14rem" },
    cell: ({ row }) => (
      <span className="font-semibold">{row.original.cat}</span>
    ),
  },
  { accessorKey: "units", header: "Units Sold", meta: { width: "9rem" } },
  {
    accessorKey: "rev",
    header: "Revenue",
    meta: { width: "10rem" },
    cell: ({ row }) => formatCurrency(row.original.rev),
  },
  {
    accessorKey: "pct",
    header: "% of Total",
    meta: { width: "9rem" },
    cell: ({ row }) => `${row.original.pct.toFixed(1)}%`,
  },
];

const DistributionDataSheet = ({
  trigger,
  title,
  description,
  columns,
  data,
  getRowId,
  tableLabel,
  widthClassName,
}) => {
  return (
    <DataTableSheet
      trigger={trigger}
      title={title}
      description={description}
      widthClassName={widthClassName}
    >
      <DataTable
        columns={columns}
        data={data}
        getRowId={getRowId}
        tableLabel={tableLabel}
        emptyMessage="No data is available for the selected period."
        className="!rounded-none !border-x-0 !border-b-0"
        scrollAreaClassName="w-full"
        scrollbarOrientation="both"
      />
    </DataTableSheet>
  );
};

const SalesDistributionCard = ({
  title,
  caption,
  sheetTitle,
  sheetDescription,
  sheetColumns,
  sheetData,
  getRowId,
  tableLabel,
  isLoading,
  sheetWidthClassName,
  children,
}) => {
  if (isLoading) {
    return (
      <section
        aria-busy="true"
        aria-label={`Loading ${title}`}
        className="flex min-h-0 flex-col rounded-[var(--app-radius-panel-standard)] bg-[var(--app-color-surface)] p-[var(--app-padding-panel)]"
      >
        <header className="mb-[var(--app-gap-section)]">
          <Skeleton className="h-5 w-52" />
          <Skeleton className="mt-[var(--app-space-1)] h-3 w-72" />
        </header>

        <Skeleton className="min-h-[16rem] flex-1 rounded-[var(--app-radius-nested)]" />
      </section>
    );
  }

  return (
    <section className="flex min-h-0 flex-col rounded-[var(--app-radius-panel-standard)] bg-[var(--app-color-surface)] p-[var(--app-padding-panel)] shadow-[var(--app-shadow-card)]">
      <header className="mb-[var(--app-gap-section)] flex flex-wrap items-start justify-between gap-[var(--app-gap-related)]">
        <div>
          <h3 className="m-0 text-[length:var(--app-font-size-h3)] font-bold leading-[var(--app-line-height-h3)] text-[var(--app-color-text)]">
            {title}
          </h3>

          <p className="mt-[var(--app-space-1)] text-[length:var(--app-font-size-caption)] leading-[var(--app-line-height-caption)] text-[var(--app-color-text-subtle)]">
            {caption}
          </p>
        </div>

        <DistributionDataSheet
          trigger={
            <Button
              type="button"
              variant="outline"
              className="h-[var(--app-touch-target-min)] rounded-[var(--app-radius-control)] border-[var(--app-color-border-subtle)] bg-[var(--app-color-surface)] px-[var(--app-space-4)] text-[length:var(--app-font-size-body-secondary)] text-[var(--app-color-text)] hover:bg-[var(--app-color-control-hover)]"
            >
              View More
            </Button>
          }
          title={sheetTitle}
          description={sheetDescription}
          widthClassName={sheetWidthClassName}
          columns={sheetColumns}
          data={sheetData}
          getRowId={getRowId}
          tableLabel={tableLabel}
        />
      </header>

      <div className="flex min-h-0 flex-1 items-center gap-[var(--app-gap-section)] max-sm:flex-col max-sm:items-stretch">
        {children}
      </div>
    </section>
  );
};

const SourceLegend = ({ sourceData }) => {
  return (
    <div className="flex min-w-[10rem] flex-1 flex-col gap-[var(--app-gap-related)]">
      {sourceData.map((source) => (
        <div
          key={source.label}
          className="flex items-start gap-[var(--app-space-2)]"
        >
          <span
            aria-hidden="true"
            className="mt-1 h-[var(--app-space-8)] w-[var(--app-space-2)] shrink-0 rounded-full"
            style={{ backgroundColor: source.color }}
          />

          <div className="min-w-0">
            <p className="text-[length:var(--app-font-size-body-secondary)] leading-[var(--app-line-height-body-secondary)] text-[var(--app-color-text-subtle)]">
              {source.label}
            </p>

            <p className="text-[length:var(--app-font-size-body)] font-semibold leading-[var(--app-line-height-body)] text-[var(--app-color-text)]">
              {formatCurrency(source.value)}
            </p>
          </div>
        </div>
      ))}
    </div>
  );
};

const CategoryLegend = ({ categorySales, categoryColors }) => {
  return (
    <div className="flex min-w-[10rem] flex-1 flex-col gap-[var(--app-space-2)]">
      {categorySales.map((category, index) => (
        <div
          key={category.cat}
          className="flex items-center gap-[var(--app-space-2)]"
        >
          <span
            aria-hidden="true"
            className="size-[var(--app-space-4)] shrink-0 rounded-[var(--app-radius-nested)]"
            style={{
              backgroundColor: categoryColors[index % categoryColors.length],
            }}
          />

          <p className="truncate text-[length:var(--app-font-size-body-secondary)] leading-[var(--app-line-height-body-secondary)] text-[var(--app-color-text-subtle)]">
            {category.cat}
          </p>
        </div>
      ))}
    </div>
  );
};

const SalesDistributionPanel = ({
  isLoading,
  sourceData,
  categorySales,
  categoryColors,
  summaryData,
}) => {
  const hasSourceData = sourceData.some((source) => source.value > 0);
  const hasCategoryData = categorySales.length > 0;

  return (
    <>
      <SalesDistributionCard
        isLoading={isLoading}
        title="Sales by Order Source"
        caption="Monitor sales trends and performance over the past 7 days."
        sheetTitle="Detailed Sales by Order Source"
        sheetDescription="Review revenue contribution for each order source."
        sheetColumns={sourceColumns}
        sheetData={sourceData}
        getRowId={(source) => source.label}
        tableLabel="Detailed sales by order source"
        sheetWidthClassName="!w-full sm:!w-[42vw] sm:!max-w-none"
      >
        {hasSourceData ? (
          <>
            <div className="flex min-w-0 flex-1 justify-center">
              <DonutChart data={sourceData} total={summaryData.netSales} />
            </div>

            <SourceLegend sourceData={sourceData} />
          </>
        ) : (
          <EmptyState
            className="min-h-[16rem] w-full"
            title="No sales by source yet"
            description="Order source totals will appear after completed sales are recorded."
          />
        )}
      </SalesDistributionCard>

      <SalesDistributionCard
        isLoading={isLoading}
        title="Sales by Menu Category"
        caption="Monitor sales trends and performance over the past 7 days."
        sheetTitle="Detailed Sales by Menu Category"
        sheetDescription="Review units sold and revenue contribution by menu category."
        sheetColumns={categoryColumns}
        sheetData={categorySales}
        getRowId={(category) => category.cat}
        tableLabel="Detailed sales by menu category"
        sheetWidthClassName="!w-full sm:!w-[42vw] sm:!max-w-none"
      >
        {hasCategoryData ? (
          <>
            <div className="flex min-w-0 flex-1 justify-center">
              <PieChart data={categorySales} colors={categoryColors} />
            </div>

            <CategoryLegend
              categorySales={categorySales}
              categoryColors={categoryColors}
            />
          </>
        ) : (
          <EmptyState
            className="min-h-[16rem] w-full"
            title="No sales by category yet"
            description="Category totals will appear after completed sales are recorded."
          />
        )}
      </SalesDistributionCard>
    </>
  );
};

export default SalesDistributionPanel;
