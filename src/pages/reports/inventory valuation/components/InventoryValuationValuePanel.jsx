import { useMemo, useState } from "react";

import { formatCurrency } from "@/utils/currencyFormatters";
import {
  createValuationChartSegments,
  getValuationCategoryColor,
} from "@/utils/inventory/inventoryValuationUtils";

import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import ResponsiveMetricValue from "@/components/metrics/ResponsiveMetricValue";
import { Skeleton } from "@/components/ui/skeleton";

const RADIUS = 70;
const STROKE_WIDTH = 36;
const CIRCUMFERENCE = 2 * Math.PI * RADIUS;

const InventoryValuationValuePanel = ({
  categorySummary,
  totalValuation,
  isLoading = false,
}) => {
  const [hoveredSegment, setHoveredSegment] = useState(null);
  const [isValueTooltipOpen, setIsValueTooltipOpen] = useState(false);

  const chartSegments = useMemo(
    () =>
      createValuationChartSegments(
        categorySummary,
        totalValuation,
        CIRCUMFERENCE,
      ),
    [categorySummary, totalValuation],
  );

  if (isLoading) {
    return (
      <section
        aria-busy="true"
        aria-label="Loading value per inventory"
        className="rounded-[var(--app-radius-panel-standard)] bg-[var(--app-color-surface)] p-[var(--app-padding-panel)]"
      >
        <Skeleton className="h-6 w-48 rounded-[var(--app-radius-nested)]" />
        <Skeleton className="mt-[var(--app-space-2)] h-3 w-72" />

        <div className="mt-[var(--app-gap-section)] grid gap-[var(--app-gap-section)] lg:grid-cols-[minmax(0,3fr)_minmax(0,2fr)]">
          <Skeleton className="min-h-[18rem] rounded-[var(--app-radius-nested)]" />
          <Skeleton className="min-h-[18rem] rounded-[var(--app-radius-nested)]" />
        </div>
      </section>
    );
  }

  return (
    <section className="flex min-h-0 flex-col rounded-[var(--app-radius-panel-standard)] bg-[var(--app-color-surface)] p-[var(--app-padding-panel)] shadow-[var(--app-shadow-card)]">
      <header className="mb-[var(--app-gap-section)] flex flex-wrap items-start justify-between gap-[var(--app-gap-related)]">
        <div>
          <h3 className="m-0 text-[length:var(--app-font-size-h3)] leading-[var(--app-line-height-h3)] font-bold text-[var(--app-color-text)]">
            Value per Inventory
          </h3>

          <p className="mt-[var(--app-space-1)] text-[length:var(--app-font-size-caption)] leading-[var(--app-line-height-caption)] text-[var(--app-color-text-subtle)]">
            Monitor your inventory value by category.
          </p>
        </div>

        <Tooltip open={isValueTooltipOpen} onOpenChange={setIsValueTooltipOpen}>
          <TooltipTrigger
            delay={0}
            closeOnClick={false}
            render={
              <button
                type="button"
                aria-label="Show value per inventory information"
                onClick={() => setIsValueTooltipOpen(!isValueTooltipOpen)}
                className="flex size-[var(--app-touch-target-min)] items-center justify-center rounded-full text-[var(--app-color-text-subtle)] transition-colors hover:bg-[var(--app-color-control-hover)] hover:text-[var(--app-color-brand)] data-open:bg-[var(--app-color-control-hover)] data-open:text-[var(--app-color-brand)] focus-visible:outline-none focus-visible:ring-0"
              >
                <i
                  aria-hidden="true"
                  className="bi bi-question-circle text-lg"
                />
              </button>
            }
          />

          <TooltipContent
            side="bottom"
            align="end"
            className="max-w-[32rem] border border-[var(--app-color-border-subtle)] bg-[var(--app-color-surface)] text-[length:var(--app-font-size-caption)] leading-[var(--app-line-height-body-secondary)] text-[var(--app-color-text)] shadow-[var(--app-shadow-card)]"
          >
            <p>Replace this tooltip content with your final explanation.</p>
          </TooltipContent>
        </Tooltip>
      </header>

      <div className="grid gap-[var(--app-gap-section)] lg:grid-cols-[minmax(0,3fr)_minmax(0,2fr)]">
        <div className="flex flex-col items-center gap-[var(--app-gap-related)]">
          {categorySummary.length === 0 ? (
            <p className="text-[length:var(--app-font-size-body-secondary)] text-[var(--app-color-text-subtle)]">
              No category data available.
            </p>
          ) : (
            <>
              <div className="relative size-52">
                <svg
                  viewBox="0 0 200 200"
                  className="size-full -rotate-90"
                  aria-label="Inventory value by category"
                  role="img"
                >
                  {chartSegments.map((segment, index) => (
                    <circle
                      key={segment.category}
                      cx="100"
                      cy="100"
                      r={RADIUS}
                      fill="none"
                      stroke={segment.color}
                      strokeWidth={STROKE_WIDTH}
                      strokeDasharray={`${segment.dashArray} ${segment.gap}`}
                      strokeDashoffset={segment.dashOffset}
                      className="transition-opacity"
                      style={{
                        opacity:
                          hoveredSegment !== null && hoveredSegment !== index
                            ? 0.4
                            : 1,
                      }}
                    />
                  ))}
                </svg>

                {hoveredSegment !== null && (
                  <div className="absolute inset-0 flex flex-col items-center justify-center text-center">
                    <span className="max-w-28 truncate text-[length:var(--app-font-size-caption)] text-[var(--app-color-text-subtle)]">
                      {categorySummary[hoveredSegment]?.category}
                    </span>
                    <span className="text-[length:var(--app-font-size-heading-3)] font-semibold text-[var(--app-color-text)]">
                      {categorySummary[hoveredSegment]?.pct}%
                    </span>
                  </div>
                )}
              </div>

              <div className="grid w-full auto-cols-fr grid-flow-col grid-rows-3 gap-[var(--app-gap-related)] max-xl:grid-rows-4 max-sm:grid-rows-6">
                {categorySummary.map((category, index) => (
                  <button
                    key={category.category}
                    type="button"
                    onMouseEnter={() => setHoveredSegment(index)}
                    onMouseLeave={() => setHoveredSegment(null)}
                    onFocus={() => setHoveredSegment(index)}
                    onBlur={() => setHoveredSegment(null)}
                    className="flex min-w-0 items-center gap-[var(--app-space-2)] text-left text-[length:var(--app-font-size-caption)] text-[var(--app-color-text-subtle)]"
                  >
                    <span
                      aria-hidden="true"
                      className="size-2 shrink-0 rounded-full"
                      style={{
                        backgroundColor: getValuationCategoryColor(
                          category.category,
                          index,
                        ),
                      }}
                    />
                    <span className="truncate">{category.category}</span>
                  </button>
                ))}
              </div>
            </>
          )}
        </div>
        <div className="flex h-full flex-col justify-between gap-[var(--app-gap-related)]">
          <div className="grid grid-cols-2 gap-[var(--app-gap-related)]">
            <div className="flex flex-col gap-[var(--app-space-2)]">
              <p className="text-[length:var(--app-font-size-body-secondary)] font-semibold text-[var(--app-color-text-subtle)]">
                Total Inventory Value
              </p>
              <ResponsiveMetricValue
                value={formatCurrency(totalValuation)}
                maxFontSize={24}
                minFontSize={16}
              />
            </div>

            <div className="flex flex-col gap-[var(--app-space-2)]">
              <p className="text-[length:var(--app-font-size-body-secondary)] font-semibold text-[var(--app-color-text-subtle)]">
                Top Expense
              </p>
              <ResponsiveMetricValue
                value="—"
                maxFontSize={24}
                minFontSize={16}
                className="text-[var(--app-color-text-subtle)]"
              />
            </div>

            <div className="flex flex-col gap-[var(--app-space-2)]">
              <p className="text-[length:var(--app-font-size-body-secondary)] font-semibold text-[var(--app-color-text-subtle)]">
                Waste / Shrinkage Value
              </p>
              <ResponsiveMetricValue
                value="—"
                maxFontSize={24}
                minFontSize={16}
                className="text-[var(--app-color-text-subtle)]"
              />
            </div>

            <div className="flex flex-col gap-[var(--app-space-2)]">
              <p className="text-[length:var(--app-font-size-body-secondary)] font-semibold text-[var(--app-color-text-subtle)]">
                Spillage & Prep Waste Value
              </p>
              <ResponsiveMetricValue
                value="—"
                maxFontSize={24}
                minFontSize={16}
                className="text-[var(--app-color-text-subtle)]"
              />
            </div>
          </div>

          <div className="flex flex-col gap-[var(--app-gap-related)]">
            <h4 className="text-[length:var(--app-font-size-body)] font-semibold text-[var(--app-color-brand-header)]">
              Highest Value
            </h4>

            <table className="w-full text-[length:var(--app-font-size-body-secondary)]">
              <thead className="text-left text-[var(--app-color-text-subtle)]">
                <tr>
                  <th className="pb-[var(--app-space-2)]">Category</th>
                  <th className="pb-[var(--app-space-2)] text-right">Value</th>
                  <th className="pb-[var(--app-space-2)] text-right">
                    % of Total
                  </th>
                </tr>
              </thead>

              <tbody className="text-[var(--app-color-text)]">
                {categorySummary.slice(0, 3).map((category) => (
                  <tr key={category.category}>
                    <td className="py-[var(--app-space-1)]">
                      {category.category}
                    </td>
                    <td className="py-[var(--app-space-1)] text-right">
                      <ResponsiveMetricValue
                        value={formatCurrency(category.value)}
                        maxFontSize={14}
                        minFontSize={11}
                        decimalFontSize={11}
                        className="ml-auto"
                      />
                    </td>
                    <td className="py-[var(--app-space-1)] text-right">
                      {category.pct}%
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </section>
  );
};

export default InventoryValuationValuePanel;
