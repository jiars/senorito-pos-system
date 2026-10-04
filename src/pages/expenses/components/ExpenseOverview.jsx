import manageCategoriesIcon from "@/assets/quick-action/expense/manageCategories.svg";
import payEmployeeIcon from "@/assets/quick-action/expense/payEmployee.svg";
import purchaseInventoryIcon from "@/assets/quick-action/expense/purchaseInventory.svg";
import viewArchiveIcon from "@/assets/quick-action/expense/viewArchive.svg";

import EmptyState from "@/components/feedback/data-state/EmptyState";
import {
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent,
} from "@/components/ui/chart";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Skeleton } from "@/components/ui/skeleton";
import { formatCurrency } from "@/utils/currencyFormatters";
import { Bar, BarChart, CartesianGrid, XAxis, YAxis } from "recharts";

const chartConfig = {
  expenses: {
    label: "Expenses",
    color: "var(--app-color-chart-weekly-sales)",
  },
};

const axisTick = {
  fill: "var(--app-color-text-muted)",
  fontFamily: "var(--app-font-family)",
  fontSize: 12,
};

const formatChartDate = (value) =>
  new Date(`${value}T00:00:00`).toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
  });

const ExpenseOverview = ({
  isLoading,
  expenseDistributionData,
  onPayEmployee,
  onPurchaseInventory,
  onManageCategories,
  onViewArchive,
}) => {
  const hasExpenses = expenseDistributionData.some(
    (record) => record.amount > 0,
  );
  const firstChartDate = expenseDistributionData[0]?.date;
  const lastChartDate = expenseDistributionData.at(-1)?.date;
  const chartDateRange =
    firstChartDate && lastChartDate
      ? `${formatChartDate(firstChartDate)} - ${formatChartDate(lastChartDate)}`
      : "";

  const quickActions = [
    {
      id: "pay-employee",
      label: "Pay Employee",
      description: "Record an employee wage expense.",
      icon: payEmployeeIcon,
      onClick: onPayEmployee,
    },
    {
      id: "purchase-inventory",
      label: "Purchase Inventory",
      description: "Create and record an inventory purchase.",
      icon: purchaseInventoryIcon,
      onClick: onPurchaseInventory,
    },
    {
      id: "manage-categories",
      label: "Manage Expense Categories",
      description: "View and organize expense categories.",
      icon: manageCategoriesIcon,
      onClick: onManageCategories,
    },
    {
      id: "view-archive",
      label: "View Archive",
      description: "Review previously archived expenses.",
      icon: viewArchiveIcon,
      onClick: onViewArchive,
    },
  ];

  return (
    <div className="expense-overview-layout">
      {isLoading ? (
        <article
          aria-hidden="true"
          className="flex min-h-0 min-w-0 flex-col gap-[var(--app-gap-related)] rounded-[var(--app-radius-panel-standard)] bg-[var(--app-color-surface)] p-[var(--app-padding-panel)]"
        >
          <Skeleton className="h-6 w-44" />
          <Skeleton className="h-4 w-64 max-w-full" />
          <Skeleton className="min-h-64 flex-1 rounded-[var(--app-radius-nested)]" />
        </article>
      ) : (
        <article className="flex min-h-0 min-w-0 flex-col rounded-[var(--app-radius-panel-standard)] bg-[var(--app-color-surface)] p-[var(--app-padding-panel)] ">
          <header className="mb-[var(--app-gap-related)] flex flex-wrap items-start justify-between gap-[var(--app-gap-related)]">
            <div>
              <h2 className="m-0 text-[length:var(--app-font-size-h3)] font-bold leading-[var(--app-line-height-h3)] text-[var(--app-color-text)]">
                Expense Distribution
              </h2>

              <p className="mt-[var(--app-space-1)] text-[length:var(--app-font-size-caption)] leading-[var(--app-line-height-caption)] text-[var(--app-color-text-subtle)]">
                Monitor recorded expenses across the latest seven dates.
              </p>
            </div>

            {chartDateRange && (
              <time className="self-center text-[length:var(--app-font-size-body)] font-normal leading-[var(--app-line-height-body)] text-[var(--app-color-text-subtle)]">
                {chartDateRange}
              </time>
            )}
          </header>

          {!hasExpenses ? (
            <EmptyState
              className="min-h-[18rem]"
              title="No expense distribution yet"
              description="Expense totals will appear after expenses are recorded."
            />
          ) : (
            <ScrollArea
              aria-label="Expense distribution chart. Swipe horizontally on a phone to view every date."
              className="min-h-[18rem] flex-1 touch-pan-x overscroll-x-contain outline-none focus:outline-none [&_.recharts-surface]:outline-none [&_.recharts-wrapper]:outline-none [&_[data-slot=scroll-area-viewport]]:focus-visible:outline-none [&_[data-slot=scroll-area-viewport]]:focus-visible:ring-0"
              role="region"
              scrollbarOrientation="horizontal"
              tabIndex="0"
            >
              <ChartContainer
                config={chartConfig}
                className="h-full min-h-[18rem] w-full !aspect-auto max-sm:min-w-[30rem]"
              >
                <BarChart
                  accessibilityLayer
                  data={expenseDistributionData}
                  margin={{ left: 0, right: 0 }}
                >
                  <CartesianGrid
                    stroke="var(--app-color-chart-grid)"
                    strokeDasharray="3 3"
                  />

                  <XAxis
                    dataKey="label"
                    tickLine={false}
                    axisLine={false}
                    tickMargin={8}
                    tick={axisTick}
                  />

                  <YAxis
                    tickLine={false}
                    axisLine={false}
                    tickMargin={8}
                    width={82}
                    tickFormatter={(value) => formatCurrency(value)}
                    tick={axisTick}
                  />

                  <ChartTooltip
                    cursor={{ fill: "rgb(123 64 48 / 8%)" }}
                    content={
                      <ChartTooltipContent
                        formatter={(value) => formatCurrency(value)}
                      />
                    }
                  />

                  <Bar
                    dataKey="amount"
                    name="expenses"
                    fill="var(--color-expenses)"
                    radius={[3, 3, 0, 0]}
                  />
                </BarChart>
              </ChartContainer>
            </ScrollArea>
          )}
        </article>
      )}

      <aside
        className={`flex min-h-0 min-w-0 flex-col rounded-[var(--app-radius-panel-standard)] bg-[var(--app-color-surface)] p-[var(--app-padding-panel)] ${
          isLoading ? "" : ""
        }`}
      >
        {isLoading ? (
          <>
            <Skeleton className="mb-[var(--app-gap-related)] h-6 w-36" />

            <div className="flex flex-1 flex-col gap-[var(--app-space-2)]">
              {Array.from({ length: 4 }, (_, index) => (
                <Skeleton
                  key={`expense-action-skeleton-${index}`}
                  className="min-h-[var(--app-control-height-primary)] w-full rounded-[var(--app-radius-nested)]"
                />
              ))}
            </div>
          </>
        ) : (
          <>
            <h2 className="mb-[var(--app-gap-related)] text-[length:var(--app-font-size-h3)] font-bold leading-[var(--app-line-height-h3)] text-[var(--app-color-text)]">
              Quick Actions
            </h2>

            <div className="flex flex-1 flex-col gap-[var(--app-space-2)]">
              {quickActions.map((action) => {
                const isAvailable = typeof action.onClick === "function";

                return (
                  <button
                    key={action.id}
                    type="button"
                    onClick={action.onClick ?? undefined}
                    disabled={!isAvailable}
                    title={
                      isAvailable
                        ? undefined
                        : "This action will be connected after its workflow is ready."
                    }
                    className="flex min-h-[var(--app-control-height-primary)] w-full items-center gap-[var(--app-gap-related)] rounded-[var(--app-radius-nested)] bg-[linear-gradient(to_bottom,var(--app-color-canvas),var(--app-color-surface))] px-[var(--app-space-4)] py-[var(--app-space-2)] text-left  transition-colors hover:bg-[var(--app-color-control-hover)] disabled:cursor-not-allowed disabled:opacity-60"
                  >
                    <img
                      src={action.icon}
                      alt=""
                      aria-hidden="true"
                      className="size-[var(--app-touch-target-min)] shrink-0 rounded-[var(--app-radius-nested)] object-cover"
                    />

                    <span className="min-w-0">
                      <span className="block text-[length:var(--app-font-size-body-secondary)] font-semibold leading-[var(--app-line-height-body-secondary)] text-[var(--app-color-text)]">
                        {action.label}
                      </span>

                      <span className="block text-[length:var(--app-font-size-caption)] leading-[var(--app-line-height-caption)] text-[var(--app-color-text-subtle)]">
                        {action.description}
                      </span>
                    </span>
                  </button>
                );
              })}
            </div>
          </>
        )}
      </aside>
    </div>
  );
};

export default ExpenseOverview;
