import EmptyState from "@/components/feedback/data-state/EmptyState";

// Read across from lower to higher sales, with higher-margin groups on top.
const quadrantOrder = [
  "Promote More",
  "Top Performer",
  "Review or Remove",
  "Improve Pricing",
];

const SalesProfitabilityMatrix = ({ items, groups, quadCounts, getQuadColorClass }) => {
  if (items.length === 0) {
    return (
      <EmptyState
        title="No profitability data"
        description="Try another date range or category."
        className="min-h-[16rem]"
      />
    );
  }

  const largestGroup = Math.max(1, ...Object.values(quadCounts));

  return (
    <div className="min-w-0">
      <p className="mb-[var(--app-space-4)] text-[length:var(--app-font-size-caption)] leading-[var(--app-line-height-caption)] text-[var(--app-color-text-muted)]">
        Groups compare estimated margin and units sold. Darker shading means more items in that group.
      </p>

      <div className="sales-profitability-matrix" aria-label="Profitability quadrants">
        {quadrantOrder.map((countKey) => {
          const group = groups.find((metric) => metric.countKey === countKey);
          const groupItems = items.filter((item) => item.quad === countKey);
          const count = quadCounts[countKey] ?? 0;
          const shadeOpacity = 0.08 + (count / largestGroup) * 0.18;

          return (
            <section
              key={countKey}
              aria-labelledby={`profitability-matrix-${group.id}`}
              className="relative min-w-0 overflow-hidden rounded-[var(--app-radius-nested)] border border-[var(--app-color-border-subtle)] p-[var(--app-space-4)]"
            >
              <span
                aria-hidden="true"
                className={`pointer-events-none absolute inset-0 ${getQuadColorClass(countKey)}`}
                style={{ opacity: shadeOpacity }}
              />

              <div className="relative flex h-full min-w-0 flex-col gap-[var(--app-space-4)]">
                <header className="flex items-start justify-between gap-[var(--app-space-4)]">
                  <div className="min-w-0">
                    <h3
                      id={`profitability-matrix-${group.id}`}
                      className="text-[length:var(--app-font-size-body)] font-semibold leading-[var(--app-line-height-body)] text-[var(--app-color-text)]"
                    >
                      {group.label}
                    </h3>
                    <p className="text-[length:var(--app-font-size-caption)] leading-[var(--app-line-height-caption)] text-[var(--app-color-text-muted)]">
                      {group.caption}
                    </p>
                  </div>
                  <span
                    aria-label={`${count} items`}
                    className="shrink-0 text-[length:var(--app-font-size-h3)] font-bold tabular-nums leading-[var(--app-line-height-h3)] text-[var(--app-color-text)]"
                  >
                    {count}
                  </span>
                </header>

                {groupItems.length > 0 ? (
                  <ul
                    aria-label={`${group.label} items`}
                    tabIndex={0}
                    className="sales-profitability-matrix-items flex flex-wrap content-start gap-[var(--app-space-2)] rounded-[var(--app-radius-nested)] focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[var(--app-color-brand)]"
                  >
                    {groupItems.map((item, index) => (
                      <li
                        key={`${item.item}-${item.category}-${index}`}
                        className="max-w-full break-words rounded-[var(--app-radius-nested)] border border-[var(--app-color-border-subtle)] bg-[var(--app-color-surface)] px-[var(--app-space-2)] py-[var(--app-space-1)] text-[length:var(--app-font-size-body-secondary)] leading-[var(--app-line-height-body-secondary)] text-[var(--app-color-text)] [overflow-wrap:anywhere]"
                      >
                        {item.item}
                      </li>
                    ))}
                  </ul>
                ) : (
                  <p className="text-[length:var(--app-font-size-body-secondary)] leading-[var(--app-line-height-body-secondary)] text-[var(--app-color-text-muted)]">
                    No items in this group.
                  </p>
                )}
              </div>
            </section>
          );
        })}
      </div>
    </div>
  );
};

export default SalesProfitabilityMatrix;
