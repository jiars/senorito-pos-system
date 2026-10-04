import { Bar, BarChart, CartesianGrid, XAxis, YAxis } from "recharts";
import { formatCurrency } from "../../../utils/currencyFormatters";
import {
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent,
} from "../../../components/ui/chart";
import {
  Card,
  CardContent,
  CardHeader,
} from "../../../components/ui/card";
import { Skeleton } from "../../../components/ui/skeleton";
import EmptyState from "@/components/feedback/data-state/EmptyState";
import { ScrollArea } from "@/components/ui/scroll-area";

const WeeklySalesChart = ({ weeklySalesData, isLoading }) => {
  const chartConfig = {
    sales: {
      label: "Sales",
      color: "var(--app-color-chart-weekly-sales)",
    },
  };

  const chartData = weeklySalesData.map((item) => {
    return {
      day: item.day,
      sales: item.value,
    };
  });

  const axisTick = {
    fill: "var(--app-color-text-muted)",
    fontFamily: "var(--app-font-family)",
    fontSize: 12,
  };

  const getWeekRangeString = () => {
    const today = new Date();
    const startOfWeek = new Date(today);
    const endOfWeek = new Date(today);

    startOfWeek.setDate(today.getDate() - today.getDay());
    endOfWeek.setDate(startOfWeek.getDate() + 6);

    const dateOptions = {
      month: "short",
      day: "numeric",
      year: "numeric",
    };

    const startDate = startOfWeek.toLocaleDateString("en-US", dateOptions);
    const endDate = endOfWeek.toLocaleDateString("en-US", dateOptions);

    return `${startDate} - ${endDate}`;
  };

  if (isLoading) {
    return (
      <Card
        aria-busy="true"
        aria-label="Loading weekly sales performance"
        className="min-h-0 flex-1 gap-0 rounded-[var(--app-radius-panel-standard)] !py-0 !ring-0"
      >
        <CardHeader className="grid grid-cols-[minmax(0,1fr)_10rem] items-center gap-[var(--app-gap-related)] px-[var(--app-padding-panel)] pt-[var(--app-padding-panel)]">
          <div>
            <Skeleton className="h-5 w-56" />
            <Skeleton className="mt-[var(--app-space-2)] h-3 w-72" />
          </div>

          <Skeleton className="h-4 w-36 justify-self-end" />
        </CardHeader>

        <CardContent className="flex min-h-[300px] flex-1 px-[var(--app-padding-panel)] pb-[var(--app-padding-panel)] pt-[var(--app-gap-related)]">
          <Skeleton className="min-h-[300px] flex-1 rounded-[var(--app-radius-nested)]" />
        </CardContent>
      </Card>
    );
  }

  return (
    <section className="flex min-h-0 flex-1 flex-col rounded-[var(--app-radius-panel-standard)] bg-[var(--app-color-surface)] p-[var(--app-padding-panel)] ">
      <header className="mb-[var(--app-gap-related)] flex flex-wrap items-start justify-between gap-[var(--app-gap-related)]">
        <div>
          <h3 className="m-0 text-[length:var(--app-font-size-h3)] leading-[var(--app-line-height-h3)] font-bold text-[var(--app-color-text)]">
            Weekly Sales Performance
          </h3>

          <p className="mt-[var(--app-space-1)] text-[length:var(--app-font-size-caption)] leading-[var(--app-line-height-caption)] text-[var(--app-color-text-subtle)]">
            Monitor sales trends and performance over the past 7 days.
          </p>
        </div>

        <time className="self-center text-[length:var(--app-font-size-body)] leading-[var(--app-line-height-body)] font-normal text-[var(--app-color-text-subtle)]">
          {getWeekRangeString()}
        </time>
      </header>

      {chartData.length === 0 ? (
        <EmptyState
          className="min-h-[300px]"
          title="No sales data this week"
          description="Weekly sales will appear here after completed orders are recorded."
        />
      ) : (
        <ScrollArea
          aria-label="Weekly sales chart. Swipe horizontally on a phone to view all days."
          className="min-h-[300px] flex-1 touch-pan-x overscroll-x-contain outline-none focus:outline-none [&_.recharts-surface]:outline-none [&_.recharts-wrapper]:outline-none [&_[data-slot=scroll-area-viewport]]:focus-visible:outline-none [&_[data-slot=scroll-area-viewport]]:focus-visible:ring-0"
          role="region"
          scrollbarOrientation="horizontal"
          tabIndex="0"
        >
          <ChartContainer
            config={chartConfig}
            className="min-h-[300px] h-full w-full !aspect-auto max-sm:min-w-[30rem]"
          >
            <BarChart accessibilityLayer data={chartData}>
              <CartesianGrid
                stroke="var(--app-color-chart-grid)"
                strokeDasharray="3 3"
              />

              <XAxis
                dataKey="day"
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
                dataKey="sales"
                fill="var(--color-sales)"
                radius={[3, 3, 0, 0]}
              />
            </BarChart>
          </ChartContainer>
        </ScrollArea>
      )}
    </section>
  );
};

export default WeeklySalesChart;
