import { Bar, BarChart, CartesianGrid, ReferenceLine, XAxis, YAxis } from "recharts";

import EmptyState from "@/components/feedback/data-state/EmptyState";
import { ChartContainer, ChartTooltip, ChartTooltipContent } from "@/components/ui/chart";
import { formatCurrency } from "@/utils/shared/formatters/currencyFormatters";

const chartConfig = {
  profitPerItem: {
    label: "Estimated profit per item",
    color: "var(--app-color-brand)",
  },
};

const axisTick = {
  fill: "var(--app-color-text-muted)",
  fontSize: "var(--app-font-size-caption)",
};

const SalesProfitabilityBarChart = ({ items, sortBy }) => {
  if (items.length === 0) {
    return (
      <EmptyState
        title="No profitability data"
        description="Try another date range or category."
        className="min-h-[16rem]"
      />
    );
  }

  return (
    <div className="grid min-w-0 gap-[var(--app-space-2)]">
      <p className="text-[length:var(--app-font-size-caption)] leading-[var(--app-line-height-caption)] text-[var(--app-color-text-muted)]">
        Estimated profit per item. Current sort: {sortBy}. Negative values appear left of zero.
      </p>
      <div
        className="sales-profitability-bar-viewport min-w-0 overflow-auto overscroll-contain"
        role="region"
        aria-label="Estimated profit per item bar chart. Scroll to view every item."
        tabIndex={0}
      >
        <div
          className="min-h-[18rem] min-w-[40rem]"
          style={{ height: `calc(var(--app-space-8) + ${items.length} * var(--app-touch-target-min))` }}
        >
          <ChartContainer config={chartConfig} className="h-full w-full !aspect-auto">
            <BarChart
              accessibilityLayer
              layout="vertical"
              data={items}
              margin={{ top: 8, right: 24, left: 8, bottom: 8 }}
            >
              <CartesianGrid horizontal={false} stroke="var(--app-color-chart-grid)" strokeDasharray="3 3" />
              <XAxis
                type="number"
                // Keep zero visible without hiding genuine negative profits.
                domain={[(minimum) => Math.min(0, minimum), (maximum) => Math.max(1, maximum)]}
                tickFormatter={formatCurrency}
                tick={axisTick}
                tickLine={false}
                axisLine={false}
              />
              <YAxis
                type="category"
                dataKey="item"
                width={180}
                interval={0}
                tick={axisTick}
                tickLine={false}
                axisLine={false}
              />
              <ReferenceLine x={0} stroke="var(--app-color-border-strong)" />
              <ChartTooltip
                cursor={{ fill: "var(--app-color-control-hover)" }}
                content={<ChartTooltipContent formatter={formatCurrency} />}
              />
              <Bar dataKey="profitPerItem" fill="var(--color-profitPerItem)" radius={4} maxBarSize={24} />
            </BarChart>
          </ChartContainer>
        </div>
      </div>
    </div>
  );
};

export default SalesProfitabilityBarChart;
