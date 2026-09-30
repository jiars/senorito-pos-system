import { useState } from "react";
import { Bar, BarChart, CartesianGrid, XAxis, YAxis } from "recharts";

import EmptyState from "@/components/feedback/EmptyState";
import TopSellingItemCard from "@/components/product-card/TopSellingItemCard";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Skeleton } from "@/components/ui/skeleton";
import {
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent,
} from "@/components/ui/chart";
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from "@/components/ui/tooltip";

const chartConfig = {
  orders: {
    label: "Orders",
    color: "var(--app-color-chart-weekly-sales)",
  },
};

const axisTick = {
  fill: "var(--app-color-text-muted)",
  fontFamily: "var(--app-font-family)",
  fontSize: 12,
};

const SalesPerformancePanel = ({
  isLoading,
  hourlyData,
  yAxisLabels,
  maxOrders,
  peakHour,
  totalOrders,
  topSellingItems,
}) => {
  const [isTooltipOpen, setIsTooltipOpen] = useState(false);
  const hasOrders = hourlyData.some((item) => item.orders > 0);

  if (isLoading) {
    return (
      <>
        <article
          aria-busy="true"
          aria-label="Loading hourly sales pattern"
          className="sales-performance-panel flex min-h-0 flex-1 flex-col rounded-[var(--app-radius-panel-standard)] bg-[var(--app-color-surface)] p-[var(--app-padding-panel)]"
        >
          <header className="mb-[var(--app-gap-section)]">
            <Skeleton className="h-5 w-52" />
          </header>

          <Skeleton className="sales-hourly-chart min-h-0 flex-1 rounded-[var(--app-radius-nested)]" />
        </article>

        <article
          aria-busy="true"
          aria-label="Loading top selling items"
          className="sales-performance-panel sales-top-selling-panel flex min-h-0 flex-1 flex-col rounded-[var(--app-radius-panel-standard)] bg-[var(--app-color-surface)] p-[var(--app-padding-panel)]"
        >
          <header className="mb-[var(--app-gap-section)]">
            <Skeleton className="h-5 w-44" />
          </header>

          <div className="flex min-h-0 flex-1 flex-col gap-[var(--app-gap-related)]">
            {Array.from({ length: 3 }, (_, index) => (
              <div
                key={index}
                className="flex h-[7.25rem] items-center gap-[var(--app-gap-related)] rounded-[var(--app-radius-panel-standard)] bg-[var(--app-color-canvas)] p-[var(--app-space-4)]"
              >
                <Skeleton className="size-[6rem] shrink-0 rounded-[var(--app-radius-panel-standard)]" />
                <div className="flex min-w-0 flex-1 flex-col gap-[var(--app-space-6)]">
                  <div>
                    <Skeleton className="h-4 w-3/4" />
                    <Skeleton className="mt-[var(--app-space-2)] h-3 w-1/2" />
                  </div>
                  <Skeleton className="h-4 w-20" />
                </div>
              </div>
            ))}
          </div>
        </article>
      </>
    );
  }

  return (
    <>
      <article className="sales-performance-panel flex min-h-0 flex-1 flex-col rounded-[var(--app-radius-panel-standard)] bg-[var(--app-color-surface)] p-[var(--app-padding-panel)] ">
        <header className="mb-[var(--app-gap-section)] flex items-start justify-between gap-[var(--app-gap-related)]">
          <h3 className="text-[length:var(--app-font-size-h3)] font-bold leading-[var(--app-line-height-h3)] text-[var(--app-color-text)]">
            Hourly Sales Pattern
          </h3>

          <Tooltip open={isTooltipOpen} onOpenChange={setIsTooltipOpen}>
            <TooltipTrigger
              delay={0}
              closeOnClick={false}
              render={
                <button
                  type="button"
                  aria-label="Show hourly sales information"
                  onClick={() => setIsTooltipOpen(!isTooltipOpen)}
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
              className="max-w-[32rem] border border-[var(--app-color-border-subtle)] bg-[var(--app-color-surface)] text-[length:var(--app-font-size-caption)] leading-[var(--app-line-height-body-secondary)] text-[var(--app-color-text)] "
            >
              <p>Replace this tooltip content with your final explanation.</p>
            </TooltipContent>
          </Tooltip>
        </header>

        <div className="flex min-h-0 flex-1 flex-col gap-[var(--app-gap-section)]">
          {!hasOrders ? (
            <EmptyState
              className="min-h-[18rem]"
              title="No hourly sales yet"
              description="Hourly sales will appear after completed orders are recorded."
            />
          ) : (
            <ScrollArea
              aria-label="Hourly sales chart. Swipe horizontally on a phone to view every time period."
              className="sales-hourly-chart flex-1 touch-pan-x overscroll-x-contain outline-none focus:outline-none [&_.recharts-surface]:outline-none [&_.recharts-wrapper]:outline-none [&_[data-slot=scroll-area-viewport]]:focus-visible:outline-none [&_[data-slot=scroll-area-viewport]]:focus-visible:ring-0"
              role="region"
              scrollbarOrientation="horizontal"
              tabIndex="0"
            >
              <ChartContainer
                config={chartConfig}
                className="h-full min-h-0 w-full !aspect-auto max-sm:min-w-[30rem]"
              >
                <BarChart
                  accessibilityLayer
                  data={hourlyData}
                  margin={{ left: 0, right: 0 }}
                >
                  <CartesianGrid
                    stroke="var(--app-color-chart-grid)"
                    strokeDasharray="3 3"
                  />

                  <XAxis
                    dataKey="time"
                    tickLine={false}
                    axisLine={false}
                    tickMargin={8}
                    tick={axisTick}
                  />

                  <YAxis
                    domain={[0, Math.max(maxOrders, 1)]}
                    ticks={yAxisLabels}
                    tickLine={false}
                    axisLine={false}
                    tickMargin={8}
                    width={32}
                    tick={axisTick}
                  />

                  <ChartTooltip
                    cursor={{ fill: "rgb(123 64 48 / 8%)" }}
                    content={
                      <ChartTooltipContent
                        formatter={(value) => `${value} orders`}
                      />
                    }
                  />

                  <Bar
                    dataKey="orders"
                    fill="var(--color-orders)"
                    radius={[3, 3, 0, 0]}
                  />
                </BarChart>
              </ChartContainer>
            </ScrollArea>
          )}

          <div className="flex items-start gap-[var(--app-gap-related)]">
            <span className="flex size-[var(--app-touch-target-min)] shrink-0 items-center justify-center rounded-full bg-[var(--app-color-success)] text-white">
              <i
                aria-hidden="true"
                className="bi bi-lightbulb-fill text-[length:var(--app-font-size-h3)] leading-none"
              />
            </span>

            <p className="m-0 text-[length:var(--app-font-size-body-secondary)] leading-[var(--app-line-height-body-secondary)] text-[var(--app-color-text-subtle)]">
              {totalOrders === 0 ? (
                "No orders were recorded in the selected period."
              ) : (
                <>
                  <strong className="font-semibold text-[var(--app-color-text)]">
                    Peak hours are {peakHour.time}
                  </strong>{" "}
                  with {peakHour.orders} orders. A total of{" "}
                  <strong className="font-semibold text-[var(--app-color-text)]">
                    {totalOrders} orders
                  </strong>{" "}
                  were recorded across this period.{" "}
                  {peakHour.orders >= 5
                    ? `Consider adding extra staff around ${peakHour.time} to reduce wait times and increase throughput.`
                    : "Order volume is currently manageable with existing staff levels."}
                </>
              )}
            </p>
          </div>
        </div>

      </article>

      <article className="sales-performance-panel sales-top-selling-panel flex min-h-0 flex-1 flex-col rounded-[var(--app-radius-panel-standard)] bg-[var(--app-color-surface)] p-[var(--app-padding-panel)] ">
          <header className="mb-[var(--app-gap-section)]">
            <h3 className="m-0 text-[length:var(--app-font-size-h3)] font-bold leading-[var(--app-line-height-h3)] text-[var(--app-color-text)]">
              Top Selling Items
            </h3>
          </header>

          {topSellingItems.length === 0 ? (
            <EmptyState
              className="min-h-[18rem]"
              title="No top-selling items yet"
              description="Top items will appear after completed sales are recorded."
            />
          ) : (
            <ScrollArea
              className="-mx-[var(--app-space-2)] min-h-0 flex-1 px-[var(--app-space-2)]"
              scrollbarOrientation="vertical"
            >
              <div className="flex flex-col gap-[var(--app-gap-related)] py-[var(--app-space-2)] pr-[var(--app-space-2)]">
                {topSellingItems.slice(0, 5).map((item) => (
                  <TopSellingItemCard
                    key={item.id}
                    item={item}
                    className="w-full"
                  />
                ))}
              </div>
            </ScrollArea>
          )}
      </article>
    </>
  );
};

export default SalesPerformancePanel;
