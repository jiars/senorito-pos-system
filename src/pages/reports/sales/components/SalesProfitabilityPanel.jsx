import { useEffect, useMemo, useState } from "react";

import { Button } from "@/components/ui/button";
import DataTablePagination from "@/components/data-table/DataTablePagination";
import ResponsiveMetricValue from "@/components/metrics/ResponsiveMetricValue";
import DataTableSheet from "@/components/data-table/DataTableSheet";
import FilterOptionGroup from "@/components/filters/FilterOptionGroup";
import FilterPopover from "@/components/filters/FilterPopover";
import { Skeleton } from "@/components/ui/skeleton";

import { formatCurrency } from "@/utils/currencyFormatters";

import SalesProfitabilityTable, {
  sortProfitabilityRows,
} from "./SalesProfitabilityTable";

const profitabilityMetricItems = [
  {
    id: "top-performer",
    label: "Top Performer",
    caption: "Menu with high profit and high sales ",
    icon: "bi-star-fill",
    color: "text-[var(--app-color-success)]",
    countKey: "Top Performer",
  },
  {
    id: "promote-more",
    label: "Promote More",
    icon: "bi-megaphone-fill",
    caption: "Menu with high profit and high sales ",
    color: "text-[var(--app-color-info)]",
    countKey: "Promote More",
  },
  {
    id: "improve-pricing",
    label: "Improve Pricing",
    caption: "Menu with high profit with low sales ",
    icon: "bi-tag-fill",
    color: "text-[var(--app-color-accent)]",
    countKey: "Improve Pricing",
  },
  {
    id: "review-remove",
    label: "Review or Remove",
    caption: "Menu with low profit with low sales ",
    icon: "bi-x-circle-fill",
    color: "text-[var(--app-color-danger)]",
    countKey: "Review or Remove",
  },
];

const profitabilitySortOptions = [
  { label: "Highest Revenue", value: "Highest Revenue" },
  { label: "Highest Profit", value: "Highest Profit" },
  { label: "Highest Margin", value: "Highest Margin" },
  { label: "Highest Unit Sold", value: "Highest Unit Sold" },
];

const SalesProfitabilityPanel = ({
  isLoading,
  detailedProfitability,
  profitabilitySort,
  setProfitabilitySort,
  quadCounts,
  heatmapActive,
  setHeatmapActive,
  maxQty,
  maxRev,
  getQuadColorClass,
}) => {
  const [detailCurrentPage, setDetailCurrentPage] = useState(1);
  const [detailPageSize, setDetailPageSize] = useState(10);
  const activeProfitabilityItem =
    heatmapActive === null ? null : detailedProfitability[heatmapActive];
  const sortedProfitability = useMemo(
    () => sortProfitabilityRows(detailedProfitability, profitabilitySort),
    [detailedProfitability, profitabilitySort],
  );
  const visibleProfitability = useMemo(() => {
    const startIndex = (detailCurrentPage - 1) * detailPageSize;

    return sortedProfitability.slice(startIndex, startIndex + detailPageSize);
  }, [detailCurrentPage, detailPageSize, sortedProfitability]);

  useEffect(() => {
    setDetailCurrentPage(1);
  }, [profitabilitySort, detailPageSize]);

  if (isLoading) {
    return (
      <section
        aria-busy="true"
        aria-label="Loading menu profitability heatmap"
        className="rounded-[var(--app-radius-panel-standard)] bg-[var(--app-color-surface)] p-[var(--app-padding-panel)]"
      >
        <div className="mb-[var(--app-gap-section)]">
          <Skeleton className="h-5 w-64" />
          <Skeleton className="mt-[var(--app-space-1)] h-3 w-80" />
        </div>

        <div className="grid grid-cols-1 gap-[var(--app-gap-section)] lg:grid-cols-[minmax(18rem,1fr)_minmax(0,1.1fr)]">
          <Skeleton className="min-h-[20rem] rounded-[var(--app-radius-nested)]" />
          <Skeleton className="min-h-[20rem] rounded-[var(--app-radius-nested)]" />
        </div>
      </section>
    );
  }

  return (
    <section className="rounded-[var(--app-radius-panel-standard)] bg-[var(--app-color-surface)] p-[var(--app-padding-panel)] ">
      <header className="mb-[var(--app-gap-section)] flex flex-wrap items-start justify-between gap-[var(--app-gap-related)]">
        <div className="flex-1 min-w-0 max-w-[16rem] lg:max-w-none">
          <h2 className="m-0 text-[length:var(--app-font-size-h3)] font-bold leading-[var(--app-line-height-h3)] text-[var(--app-color-text)]">
            Menu Profitability Heatmap
          </h2>

          <p className="mt-[var(--app-space-1)] text-[length:var(--app-font-size-caption)] leading-[var(--app-line-height-caption)] text-[var(--app-color-text-subtle)]">
            Monitor sales volume and menu performance over the selected period.
          </p>
        </div>

        <DataTableSheet
          trigger={
            <Button
              type="button"
              variant="outline"
              className="h-[var(--app-touch-target-min)] rounded-[var(--app-radius-control)] border-[var(--app-color-border-subtle)] bg-[var(--app-color-surface)] px-[var(--app-space-4)] text-[length:var(--app-font-size-body-secondary)] text-[var(--app-color-text)] hover:bg-[var(--app-color-control-hover)]"
            >
              View More
            </Button>
          }
          title="Detailed Menu Profitability"
          description="Review revenue, margin, sales quantity, and profitability grouping."
          pagination={
            <DataTablePagination
              totalItems={sortedProfitability.length}
              pageSize={detailPageSize}
              pageSizeOptions={[10, 20, 30]}
              currentPage={detailCurrentPage}
              onPageChange={setDetailCurrentPage}
              onPageSizeChange={setDetailPageSize}
            />
          }
          rightActions={
            <FilterPopover
              label="Sort"
              triggerIcon="bi-arrow-down-up"
              showFooter={false}
              maxWidth="14rem"
            >
              <FilterOptionGroup
                id="sales-profitability-sort"
                label="Sort profitability"
                options={profitabilitySortOptions}
                selectedValues={[profitabilitySort]}
                onSelectedValuesChange={(values) => {
                  const selectedSort = values[0];

                  if (selectedSort) setProfitabilitySort(selectedSort);
                }}
                selectionMode="single"
                collapsible={false}
                showLabel={false}
              />
            </FilterPopover>
          }
        >
          <SalesProfitabilityTable items={visibleProfitability} />
        </DataTableSheet>
      </header>

      <div className="grid min-w-0 grid-cols-1 gap-[var(--app-gap-section)] lg:grid-cols-[minmax(18rem,1fr)_minmax(0,1.1fr)]">
        <article className="grid grid-cols-2 gap-[var(--app-gap-related)] p-[var(--app-space-4)]">
          {profitabilityMetricItems.map((metric) => (
            <article
              key={metric.id}
              className="flex min-h-[10rem] flex-col gap-[var(--app-space-2)]"
            >
              <div className="flex flex-col gap-[var(--app-space-2)]">
                <p className="text-[length:var(--app-font-size-body-secondary)] font-bold text-[var(--app-color-text)]">
                  {metric.label}
                </p>

                <p className="text-[length:var(--app-font-size-caption)] leading-[var(--app-line-height-caption)] text-[var(--app-color-text-subtle)]">
                  {metric.caption}
                </p>
              </div>

              <div className="flex min-h-0 flex-1 items-center justify-start gap-[var(--app-space-2)]">
                <i
                  aria-hidden="true"
                  className={`bi ${metric.icon} profitability-metric-icon ${getQuadColorClass(
                    metric.countKey,
                  )} shrink-0 text-[48px] leading-none`}
                />

                <div className="min-w-0 flex-1">
                  <ResponsiveMetricValue
                    value={quadCounts[metric.countKey] ?? 0}
                    maxFontSize={32}
                    minFontSize={20}
                  />
                </div>
              </div>
            </article>
          ))}
        </article>

        <article className="flex h-full min-h-0 min-w-0 flex-col gap-[var(--app-space-8)] px-[var(--app-space-6)]">
          <div
            className="scatter-plot-container"
            onClick={() => setHeatmapActive(null)}
          >
            {detailedProfitability.map((item, index) => {
              const bottomPosition = Math.min(Math.max(item.margin, 5), 95);
              const leftPosition = (item.qty / maxQty) * 90;
              const size = 12 + (item.revenue / maxRev) * 24;
              const isActive = heatmapActive === index;

              return (
                <button
                  key={`${item.item}-${index}`}
                  type="button"
                  aria-label={`View ${item.item} profitability details`}
                  className={`scatter-bubble border-0 ${getQuadColorClass(
                    item.quad,
                  )} ${isActive ? "ring-2 ring-[var(--app-color-brand-deep)]" : ""}`}
                  style={{
                    bottom: `${bottomPosition}%`,
                    left: `${leftPosition}%`,
                    width: `${size}px`,
                    height: `${size}px`,
                    zIndex: isActive ? 5 : 1,
                  }}
                  onClick={(event) => {
                    event.stopPropagation();
                    setHeatmapActive(isActive ? null : index);
                  }}
                />
              );
            })}

            {activeProfitabilityItem && (
              <div
                className="absolute z-10 -translate-x-1/2 rounded-[var(--app-radius-nested)] border border-[var(--app-color-border-subtle)] bg-[var(--app-color-surface)] px-[var(--app-space-4)] py-[var(--app-space-2)] text-center "
                style={{
                  bottom: `calc(${Math.min(
                    Math.max(activeProfitabilityItem.margin, 5),
                    95,
                  )}% + 2rem)`,
                  left: `${(activeProfitabilityItem.qty / maxQty) * 90}%`,
                }}
              >
                <p className="text-[length:var(--app-font-size-body-secondary)] font-semibold text-[var(--app-color-text)]">
                  {activeProfitabilityItem.item}
                </p>

                <p className="text-[length:var(--app-font-size-caption)] text-[var(--app-color-text-subtle)]">
                  {formatCurrency(activeProfitabilityItem.revenue)}
                </p>

                <p className="text-[length:var(--app-font-size-caption)] text-[var(--app-color-text-subtle)]">
                  {activeProfitabilityItem.margin.toFixed(1)}% margin
                </p>
              </div>
            )}

            <span className="scatter-axis-label bottom-[-1.5rem] left-1/2 -translate-x-1/2 text-[length:var(--app-font-size-body-secondary)] leading-[var(--app-line-height-body-secondary)]">
              Sales Volume (Qty)
            </span>

            <span className="scatter-axis-label left-[-2rem] top-1/2 -translate-y-1/2 -rotate-90 text-[length:var(--app-font-size-body-secondary)] leading-[var(--app-line-height-body-secondary)]">
              Margin %
            </span>
          </div>

          <div className="flex flex-wrap justify-center gap-[var(--app-gap-related)] text-[length:var(--app-font-size-caption)] leading-[var(--app-line-height-caption)] text-[var(--app-color-text-subtle)]">
            <span className="flex items-center gap-[var(--app-space-1)]">
              <span className="size-2 rounded-full b-green" />
              Top Performer
            </span>

            <span className="flex items-center gap-[var(--app-space-1)]">
              <span className="size-2 rounded-full b-blue" />
              Promote More
            </span>

            <span className="flex items-center gap-[var(--app-space-1)]">
              <span className="size-2 rounded-full b-yellow" />
              Improve Pricing
            </span>

            <span className="flex items-center gap-[var(--app-space-1)]">
              <span className="size-2 rounded-full b-red" />
              Review or Remove
            </span>
          </div>
        </article>
      </div>
    </section>
  );
};

export default SalesProfitabilityPanel;
