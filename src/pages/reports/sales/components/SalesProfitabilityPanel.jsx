import { useEffect, useState } from "react";

import { Button } from "@/components/ui/button";
import DataTablePagination from "@/components/data-table/DataTablePagination";
import ResponsiveMetricValue from "@/components/metrics/ResponsiveMetricValue";
import FilterOptionGroup from "@/components/filters/FilterOptionGroup";
import FilterPopover from "@/components/filters/FilterPopover";
import { Skeleton } from "@/components/ui/skeleton";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuRadioGroup,
  DropdownMenuRadioItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

import SalesProfitabilityBubbleChart from "./SalesProfitabilityBubbleChart";
import SalesProfitabilityBarChart from "./SalesProfitabilityBarChart";
import SalesProfitabilityMatrix from "./SalesProfitabilityMatrix";
import SalesProfitabilityTable, {
  sortProfitabilityRows,
} from "./SalesProfitabilityTable";

const profitabilityMetricItems = [
  {
    id: "top-performer",
    label: "Top Performer",
    caption: "Menu with high margin and high sales",
    icon: "bi-star-fill",
    countKey: "Top Performer",
  },
  {
    id: "promote-more",
    label: "Promote More",
    icon: "bi-megaphone-fill",
    caption: "Menu with high margin and low sales",
    countKey: "Promote More",
  },
  {
    id: "improve-pricing",
    label: "Improve Pricing",
    caption: "Menu with low margin and high sales",
    icon: "bi-tag-fill",
    countKey: "Improve Pricing",
  },
  {
    id: "review-remove",
    label: "Review or Remove",
    caption: "Menu with low margin and low sales",
    icon: "bi-x-circle-fill",
    countKey: "Review or Remove",
  },
];

const profitabilitySortOptions = [
  { label: "Highest Revenue", value: "Highest Revenue" },
  { label: "Highest Profit", value: "Highest Profit" },
  { label: "Highest Margin", value: "Highest Margin" },
  { label: "Highest Unit Sold", value: "Highest Unit Sold" },
];

const profitabilityViewOptions = [
  { label: "Heatmap", value: "bubble", icon: "bi-bounding-box-circles" },
  { label: "Matrix", value: "matrix", icon: "bi-grid" },
  { label: "Bar chart", value: "bar", icon: "bi-bar-chart" },
  { label: "Table", value: "table", icon: "bi-table" },
];

const SalesProfitabilityPanel = ({
  isLoading,
  detailedProfitability,
  quadCounts,
  maxQty,
  maxRev,
  minMargin,
  maxMargin,
  getQuadColorClass,
}) => {
  const [profitabilityView, setProfitabilityView] = useState("bubble");
  const [profitabilitySort, setProfitabilitySort] = useState("Highest Revenue");
  const [detailCurrentPage, setDetailCurrentPage] = useState(1);
  const [detailPageSize, setDetailPageSize] = useState(10);
  const isBubbleView = profitabilityView === "bubble";
  const isMatrixView = profitabilityView === "matrix";
  const isPagedView = profitabilityView === "bar" || profitabilityView === "table";
  const sortedProfitability = sortProfitabilityRows(detailedProfitability, profitabilitySort);
  // Keep the table on an existing page when filters reduce its rows.
  const totalPages = Math.max(1, Math.ceil(sortedProfitability.length / detailPageSize));
  const currentPage = Math.min(detailCurrentPage, totalPages);
  const startIndex = (currentPage - 1) * detailPageSize;
  const visibleProfitability = sortedProfitability.slice(startIndex, startIndex + detailPageSize);

  useEffect(() => {
    setDetailCurrentPage(1);
  }, [profitabilitySort, detailPageSize]);

  const profitabilitySortControl = (
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
  );
  const profitabilityPagination = (
    <DataTablePagination
      totalItems={sortedProfitability.length}
      pageSize={detailPageSize}
      pageSizeOptions={[10, 20, 30]}
      currentPage={currentPage}
      onPageChange={setDetailCurrentPage}
      onPageSizeChange={setDetailPageSize}
    />
  );

  let profitabilityContent = (
    <SalesProfitabilityBubbleChart
      detailedProfitability={detailedProfitability}
      maxQty={maxQty}
      maxRev={maxRev}
      minMargin={minMargin}
      maxMargin={maxMargin}
      getQuadColorClass={getQuadColorClass}
    />
  );
  if (profitabilityView === "bar") {
    profitabilityContent = (
      <SalesProfitabilityBarChart
        items={visibleProfitability}
        sortBy={profitabilitySort}
      />
    );
  }
  if (profitabilityView === "table") {
    profitabilityContent = <SalesProfitabilityTable items={visibleProfitability} />;
  }
  if (isMatrixView) {
    profitabilityContent = (
      <SalesProfitabilityMatrix
        items={detailedProfitability}
        groups={profitabilityMetricItems}
        quadCounts={quadCounts}
        getQuadColorClass={getQuadColorClass}
      />
    );
  }

  if (isLoading) {
    return (
      <section
        aria-busy="true"
        aria-label="Loading menu profitability"
        className="rounded-[var(--app-radius-panel-standard)] bg-[var(--app-color-surface)] p-[var(--app-padding-panel)]"
      >
        <div className="mb-[var(--app-gap-section)] flex flex-wrap justify-between gap-[var(--app-gap-related)]">
          <div className="min-w-0">
            <Skeleton className="h-5 w-64 max-w-full" />
            <Skeleton className="mt-[var(--app-space-1)] h-3 w-80 max-w-full" />
          </div>
          <Skeleton className="h-[var(--app-touch-target-min)] w-64 max-w-full rounded-[var(--app-radius-control)]" />
        </div>

        {isMatrixView ? (
          <div className="sales-profitability-matrix">
            {profitabilityMetricItems.map((metric) => (
              <Skeleton key={metric.id} className="min-h-[12rem] rounded-[var(--app-radius-nested)]" />
            ))}
          </div>
        ) : (
          <div className={`grid grid-cols-1 gap-[var(--app-gap-section)] ${isPagedView ? "" : "lg:grid-cols-[minmax(18rem,1fr)_minmax(0,1.1fr)]"}`}>
            <Skeleton className={`${isPagedView ? "min-h-[10rem]" : "min-h-[20rem]"} rounded-[var(--app-radius-nested)]`} />
            <Skeleton className="min-h-[20rem] rounded-[var(--app-radius-nested)]" />
          </div>
        )}
      </section>
    );
  }

  return (
    <section aria-label="Menu profitability" className="min-w-0 rounded-[var(--app-radius-panel-standard)] bg-[var(--app-color-surface)] p-[var(--app-padding-panel)]">
      <header className="mb-[var(--app-gap-section)] flex flex-wrap items-start justify-between gap-[var(--app-gap-related)]">
        <div className="flex-1 min-w-0 max-w-[16rem] lg:max-w-none">
          <h2 className="m-0 text-[length:var(--app-font-size-h3)] font-bold leading-[var(--app-line-height-h3)] text-[var(--app-color-text)]">
            Menu Profitability
          </h2>

          <p className="mt-[var(--app-space-1)] text-[length:var(--app-font-size-caption)] leading-[var(--app-line-height-caption)] text-[var(--app-color-text-subtle)]">
            Monitor sales volume and menu performance over the selected period.
          </p>
        </div>

        <div className="flex w-full flex-wrap items-center gap-[var(--app-space-2)] sm:w-auto">
          <DropdownMenu>
            <DropdownMenuTrigger
              render={
                <Button
                  type="button"
                  variant="outline"
                  aria-label="Profitability view"
                  className="h-[var(--app-touch-target-min)] gap-[var(--app-space-2)] rounded-[var(--app-radius-control)] border-[var(--app-color-border-subtle)] bg-[var(--app-color-surface)] px-[var(--app-space-4)] text-[length:var(--app-font-size-body-secondary)] leading-[var(--app-line-height-body-secondary)] text-[var(--app-color-text)] hover:bg-[var(--app-color-control-hover)]"
                >
                  <i className="bi bi-layout-three-columns" aria-hidden="true" />
                  View
                  <i className="bi bi-chevron-down" aria-hidden="true" />
                </Button>
              }
            />
            <DropdownMenuContent align="end" className="min-w-48 bg-[var(--app-color-surface)] text-[var(--app-color-text)]">
              <DropdownMenuRadioGroup value={profitabilityView} onValueChange={setProfitabilityView} aria-label="Profitability view">
                {profitabilityViewOptions.map((option) => (
                  <DropdownMenuRadioItem
                    key={option.value}
                    value={option.value}
                    closeOnClick
                    className="min-h-[var(--app-touch-target-min)] gap-[var(--app-space-2)] pl-[var(--app-space-4)] pr-[var(--app-space-8)] text-[length:var(--app-font-size-body-secondary)] leading-[var(--app-line-height-body-secondary)]"
                  >
                    <i className={`bi ${option.icon}`} aria-hidden="true" />
                    {option.label}
                  </DropdownMenuRadioItem>
                ))}
              </DropdownMenuRadioGroup>
            </DropdownMenuContent>
          </DropdownMenu>
          {isPagedView && profitabilitySortControl}
        </div>
      </header>

      <div className={`grid min-w-0 grid-cols-1 gap-[var(--app-gap-section)] ${isBubbleView ? "lg:grid-cols-[minmax(18rem,1fr)_minmax(0,1.1fr)]" : ""}`}>
        {!isMatrixView && (
          <article className={`grid grid-cols-2 gap-[var(--app-gap-related)] p-[var(--app-space-4)] ${isPagedView ? "lg:grid-cols-4" : ""}`}>
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
        )}

        {isPagedView ? (
          <div className="sales-profitability-inline-table grid min-w-0 gap-[var(--app-gap-related)] overflow-hidden">
            {profitabilityContent}
            {profitabilityPagination}
          </div>
        ) : (
          profitabilityContent
        )}
      </div>
    </section>
  );
};

export default SalesProfitabilityPanel;
