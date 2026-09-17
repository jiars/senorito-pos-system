import { Badge } from "../../../components/ui/badge";

const getExpiryStatus = (item) => {
  if (item.status === "expired") {
    return {
      label: "Expired",
      className: "bg-[var(--app-color-danger)] text-white",
    };
  }

  const expiryDate = new Date(item.exp);
  const daysLeft = Math.ceil((expiryDate - new Date()) / (1000 * 60 * 60 * 24));

  return {
    label: `${daysLeft}d left`,
    className:
      "bg-[var(--app-color-highlight-muted)] text-[var(--app-color-brand)]",
  };
};
const ExpiryBatchesPanel = ({ alerts, isLoadingTop }) => {
  const expiredCount = alerts.expiryItems.filter(
    (i) => i.status === "expired",
  ).length;
  const expiringCount = alerts.expiryItems.filter(
    (i) => i.status === "expiring",
  ).length;

  return (
    <section className="flex h-full min-h-0 flex-col rounded-[var(--app-radius-panel-standard)] bg-[var(--app-color-surface)] p-[var(--app-padding-panel)] shadow-[var(--app-shadow-card)]">
      <header className="flex items-center border-b-2 border-[var(--app-color-border-subtle)] pb-[var(--app-space-4)]">
        <h3 className="text-[length:var(--app-font-size-h3)] leading-[var(--app-line-height-h3)] font-bold text-[var(--app-color-text)]">
          Expiry Alerts
        </h3>

        <div className="ml-auto flex items-center gap-[var(--app-space-2)]">
          <Badge className="size-8 !rounded-[var(--app-radius-nested)] bg-[var(--app-color-danger)] p-0 text-sm font-semibold text-white shadow-sm">
            {expiredCount}
          </Badge>

          <Badge className="size-8 !rounded-[var(--app-radius-nested)] bg-[var(--app-color-highlight-muted)] p-0 text-sm font-semibold text-[var(--app-color-brand)] shadow-sm">
            {expiringCount}
          </Badge>
        </div>
      </header>
      <div className="mt-[var(--app-space-4)] flex min-h-0 flex-1 flex-col gap-[var(--app-gap-related)] overflow-y-auto [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
        {isLoadingTop ? (
          <p style={{ textAlign: "center", padding: "1rem", color: "#666" }}>
            Loading...
          </p>
        ) : alerts.expiryItems.length === 0 ? (
          <p style={{ textAlign: "center", padding: "1rem", color: "#666" }}>
            No expired or expiring batches.
          </p>
        ) : (
          alerts.expiryItems.map((item) => {
            const expiryStatus = getExpiryStatus(item);

            return (
              <article
                key={item.batch}
                className="mx-1 flex min-h-[68px] items-center justify-between gap-[var(--app-gap-related)] rounded-[var(--app-radius-nested)] border border-[var(--app-color-brand-border)] px-[var(--app-space-4)] py-[var(--app-padding-row-y)]"
              >
                <div className="min-w-0">
                  <p className="truncate text-[length:var(--app-font-size-body-secondary)] leading-[var(--app-line-height-body-secondary)] font-bold text-[var(--app-color-text)]">
                    {item.name}
                  </p>
                  <p className="mt-[var(--app-space-1)] truncate text-[length:var(--app-font-size-caption)] leading-[var(--app-line-height-caption)] text-[var(--app-color-text-subtle)]">
                    Batch: {item.batch} | {item.size} | Exp: {item.exp}
                  </p>
                </div>

                <Badge
                  className={`h-7 shrink-0 rounded-full px-2.5 text-[length:var(--app-font-size-body-secondary)] font-medium ${expiryStatus.className}`}
                >
                  {expiryStatus.label}
                </Badge>
              </article>
            );
          })
        )}
      </div>
    </section>
  );
};

export default ExpiryBatchesPanel;
