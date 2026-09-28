import { Card, CardContent, CardHeader } from "../../../components/ui/card";
import { Skeleton } from "../../../components/ui/skeleton";
import EmptyState from "@/components/feedback/EmptyState";

const getStockBarColorClass = (level) => {
  if (level === "critical") {
    return "bg-[var(--app-color-danger)]";
  }

  return "bg-[var(--app-color-highlight-muted)]";
};

const LowStockPanel = ({ alerts, isLoading }) => {
  if (isLoading) {
    return (
      <Card
        aria-busy="true"
        aria-label="Loading low stock items"
        className="h-full min-h-0 gap-0 rounded-[var(--app-radius-panel-standard)] !py-0 !ring-0"
      >
        <CardHeader className="px-[var(--app-padding-panel)] py-[var(--app-space-4)]">
          <Skeleton className="h-5 w-40" />
        </CardHeader>

        <CardContent className="flex min-h-0 flex-1 px-[var(--app-padding-panel)] py-[var(--app-space-4)]">
          <Skeleton className="min-h-0 flex-1 rounded-[var(--app-radius-nested)]" />
        </CardContent>
      </Card>
    );
  }

  const stockPercent = (qty, min) => {
    if (min === 0) return 0;
    return Math.min((qty / min) * 100, 100);
  };

  return (
    <section className="flex h-full min-h-0 w-full min-w-0 max-w-full flex-col overflow-hidden rounded-[var(--app-radius-panel-standard)] bg-[var(--app-color-surface)] p-[var(--app-padding-panel)] shadow-[var(--app-shadow-card)]">
      <header className="flex items-center border-b-2 border-[var(--app-color-border-subtle)] pb-[var(--app-space-4)]">
        <h3 className="text-[length:var(--app-font-size-h3)] leading-[var(--app-line-height-h3)] font-bold text-[var(--app-color-text)]">
          Low Stock Items
        </h3>
      </header>

      <div className="mt-[var(--app-space-4)] flex min-h-0 flex-1 flex-col gap-[var(--app-gap-related)] overflow-x-hidden overflow-y-auto [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
        {alerts.lowStockItems.length === 0 ? (
          <EmptyState
            title="Stock levels are good"
            description="No items are currently below their minimum stock level."
          />
        ) : (
          alerts.lowStockItems.map((item) => (
            <article
              key={`${item.name}-${item.unit}`}
              className="mx-1 grid min-h-[58px] min-w-0 grid-cols-[64px_minmax(0,1fr)_minmax(140px,1.4fr)] items-center gap-[var(--app-gap-related)] rounded-[var(--app-radius-nested)] border border-[var(--app-color-brand-border)] px-[var(--app-space-4)] py-[var(--app-space-2)] max-sm:min-h-[5.25rem] max-sm:grid-cols-[3.5rem_minmax(0,1fr)] max-sm:grid-rows-[auto_auto] max-sm:gap-[var(--app-space-2)]"
            >
              <p className="text-[length:var(--app-font-size-body)] leading-[var(--app-line-height-body)] font-bold text-[var(--app-color-text-subtle)]">
                {item.qty} {item.unit}
              </p>

              <div className="min-w-0">
                <p className="truncate text-[length:var(--app-font-size-body-secondary)] leading-[var(--app-line-height-body-secondary)] font-bold text-[var(--app-color-text)]">
                  {item.name}
                </p>

                <p className="mt-[var(--app-space-1)] text-[length:var(--app-font-size-caption)] leading-[var(--app-line-height-caption)] text-[var(--app-color-text-subtle)]">
                  Min. {item.min} {item.unit}
                </p>
              </div>

              <div
                aria-label={`${item.name} stock level`}
                aria-valuemax={item.min}
                aria-valuemin={0}
                aria-valuenow={Math.min(item.qty, item.min)}
                className="h-2 overflow-hidden rounded-full bg-[var(--app-color-border-subtle)] max-sm:col-span-2 max-sm:row-start-2 max-sm:self-end"
                role="progressbar"
              >
                <div
                  className={`h-full rounded-full ${getStockBarColorClass(item.level)}`}
                  style={{ width: `${stockPercent(item.qty, item.min)}%` }}
                ></div>
              </div>
            </article>
          ))
        )}
      </div>
    </section>
  );
};

export default LowStockPanel;
