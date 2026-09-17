import { Bar, BarChart, CartesianGrid, XAxis, YAxis } from "recharts";

import { formatCurrency } from "../../../utils/currencyFormatters";
import {
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent,
} from "../../../components/ui/chart";

const WeeklySalesChart = ({ weeklySalesData, isLoadingBottom }) => {
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

  return (
    <section className="flex min-h-0 flex-1 flex-col rounded-[var(--app-radius-panel-standard)] bg-[var(--app-color-surface)] p-[var(--app-padding-panel)] shadow-[var(--app-shadow-card)]">
      <header className="mb-[var(--app-gap-section)] flex flex-wrap items-start justify-between gap-[var(--app-gap-related)]">
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

      {isLoadingBottom ? (
        <div className="grid min-h-[300px] flex-1 place-items-center text-[length:var(--app-font-size-body)] text-[var(--app-color-text-subtle)]">
          Loading weekly performance...
        </div>
      ) : chartData.length === 0 ? (
        <div className="grid min-h-[300px] flex-1 place-items-center text-[length:var(--app-font-size-body)] text-[var(--app-color-text-subtle)]">
          No sales data for the past week.
        </div>
      ) : (
        <ChartContainer
          config={chartConfig}
          className="min-h-[300px] flex-1 w-full !aspect-auto"
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
      )}
    </section>
  );
};

export default WeeklySalesChart;
