import { useState } from "react";

import EmptyState from "@/components/feedback/data-state/EmptyState";
import { formatCurrency } from "@/utils/shared/formatters/currencyFormatters";
import { getHeatmapMarginPosition } from "@/utils/reports/salesReportCalculations";

const SalesProfitabilityBubbleChart = ({
  detailedProfitability,
  maxQty,
  maxRev,
  minMargin,
  maxMargin,
  getQuadColorClass,
}) => {
  const [heatmapActive, setHeatmapActive] = useState(null);
  const activeProfitabilityItem =
    heatmapActive === null ? null : detailedProfitability[heatmapActive];

  if (detailedProfitability.length === 0) {
    return (
      <EmptyState
        title="No profitability data"
        description="Try another date range or category."
        className="min-h-[16rem]"
      />
    );
  }

  return (
    <article className="flex h-full min-h-0 min-w-0 flex-col gap-[var(--app-space-8)] px-[var(--app-space-6)]">
      <div
        className="scatter-plot-container before:hidden after:hidden"
        onClick={() => setHeatmapActive(null)}
      >
        {[minMargin, 0, 40, maxMargin].filter((margin, index, margins) => margins.indexOf(margin) === index).map((margin) => (
          <div
            key={margin}
            className="pointer-events-none absolute inset-x-0 border-t border-dashed border-[var(--app-color-border-subtle)]"
            style={{ bottom: `${getHeatmapMarginPosition(margin, minMargin, maxMargin)}%` }}
          >
            <span className="absolute right-0 -translate-y-full bg-[var(--app-color-surface)] text-[length:var(--app-font-size-caption)] text-[var(--app-color-text-subtle)]">
              {margin}%
            </span>
          </div>
        ))}
        <div
          className="pointer-events-none absolute inset-y-0 border-l border-dashed border-[var(--app-color-brand-border)]"
          style={{ left: `${10 + (5 / maxQty) * 80}%` }}
        >
          <span className="absolute bottom-0 whitespace-nowrap bg-[var(--app-color-surface)] text-[length:var(--app-font-size-caption)] text-[var(--app-color-text-subtle)]">
            5 sold
          </span>
        </div>
        {detailedProfitability.map((item, index) => {
          const bottomPosition = getHeatmapMarginPosition(item.margin, minMargin, maxMargin);
          const leftPosition = 10 + (item.qty / maxQty) * 80;
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
              bottom: `calc(${getHeatmapMarginPosition(activeProfitabilityItem.margin, minMargin, maxMargin)}% + 2rem)`,
              left: `${10 + (activeProfitabilityItem.qty / maxQty) * 80}%`,
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
  );
};

export default SalesProfitabilityBubbleChart;
