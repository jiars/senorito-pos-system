const getStockBarColorClass = (level) => {
  if (level === "critical") {
    return "bg-[var(--app-color-danger)]";
  }

  return "bg-[var(--app-color-highlight-muted)]";
};

const LowStockPanel = ({ alerts, isLoadingTop }) => {
  const stockPercent = (qty, min) => {
    if (min === 0) return 0;
    return Math.min((qty / min) * 100, 100);
  };

  return (
    <section className="flex h-full min-h-0 flex-col rounded-[var(--app-radius-panel-standard)] bg-[var(--app-color-surface)] p-[var(--app-padding-panel)] shadow-[var(--app-shadow-card)]">
      <header className="flex items-center border-b-2 border-[var(--app-color-border-subtle)] pb-[var(--app-space-4)]">
        <h3 className="text-[length:var(--app-font-size-h3)] leading-[var(--app-line-height-h3)] font-bold text-[var(--app-color-text)]">
          Low Stock Items
        </h3>
      </header>

      <div className="mt-[var(--app-space-4)] flex min-h-0 flex-1 flex-col gap-[var(--app-gap-related)] overflow-y-auto [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
        {isLoadingTop ? (
          <p className="grid flex-1 place-items-center text-sm text-[var(--app-color-text-subtle)]">
            Loading low stock items...
          </p>
        ) : alerts.lowStockItems.length === 0 ? (
          <p className="grid flex-1 place-items-center text-sm text-[var(--app-color-text-subtle)]">
            Stock levels are good.
          </p>
        ) : (
          alerts.lowStockItems.map((item) => (
            <article
              key={`${item.name}-${item.unit}`}
              className="mx-1 grid min-h-[58px] grid-cols-[64px_minmax(0,1fr)_minmax(140px,1.4fr)] items-center gap-[var(--app-gap-related)] rounded-[var(--app-radius-nested)] border border-[var(--app-color-brand-border)] px-[var(--app-space-4)] py-[var(--app-space-2)]"
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
                className="h-2 overflow-hidden rounded-full bg-[var(--app-color-border-subtle)]"
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
