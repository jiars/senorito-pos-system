import EmptyState from "@/components/feedback/EmptyState";
import { Badge } from "../../../components/ui/badge";
import { Skeleton } from "../../../components/ui/skeleton";
import { Card, CardContent, CardHeader } from "../../../components/ui/card";

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
const ExpiryBatchesPanel = ({ alerts, isLoading }) => {
  if (isLoading) {
    return (
      <Card
        aria-busy="true"
        aria-label="Loading expiry alerts"
        className="h-full min-h-0 gap-0 rounded-[var(--app-radius-panel-standard)] !py-0 !ring-0"
      >
        <CardHeader className="px-[var(--app-padding-panel)] py-[var(--app-space-4)]">
          <Skeleton className="h-5 w-36" />
        </CardHeader>

        <CardContent className="flex min-h-0 flex-1 px-[var(--app-padding-panel)] py-[var(--app-space-4)]">
          <Skeleton className="min-h-0 flex-1 rounded-[var(--app-radius-nested)]" />
        </CardContent>
      </Card>
    );
  }

  const expiredCount = alerts.expiryItems.filter(
    (i) => i.status === "expired",
  ).length;
  const expiringCount = alerts.expiryItems.filter(
    (i) => i.status === "expiring",
  ).length;

  return (
    <section className="flex h-full min-h-0 w-full min-w-0 max-w-full flex-col overflow-hidden rounded-[var(--app-radius-panel-standard)] bg-[var(--app-color-surface)] p-[var(--app-padding-panel)] shadow-[var(--app-shadow-card)]">
      <header className="flex items-center border-b-2 border-[var(--app-color-border-subtle)] pb-[var(--app-space-4)]">
        <h3 className="text-[length:var(--app-font-size-h3)] leading-[var(--app-line-height-h3)] font-bold text-[var(--app-color-text)]">
          Expiry Alerts
        </h3>

        <div className="ml-auto flex items-center gap-[var(--app-space-2)]">
          <Badge className="size-8 !rounded-[var(--app-radius-nested)] bg-[var(--app-color-danger)] p-0 text-sm font-semibold text-white shadow-sm max-sm:size-7 max-sm:text-[length:var(--app-font-size-body-secondary)]">
            {expiredCount}
          </Badge>

          <Badge className="size-8 !rounded-[var(--app-radius-nested)] bg-[var(--app-color-highlight-muted)] p-0 text-sm font-semibold text-[var(--app-color-brand)] shadow-sm max-sm:size-7 max-sm:text-[length:var(--app-font-size-body-secondary)]">
            {expiringCount}
          </Badge>
        </div>
      </header>
      <div className="mt-[var(--app-space-4)] flex min-h-0 flex-1 flex-col gap-[var(--app-gap-related)] overflow-x-hidden overflow-y-auto [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
        {alerts.expiryItems.length === 0 ? (
          <EmptyState
            title="No expiry alerts"
            description="No batches are expired or close to expiry."
          />
        ) : (
          alerts.expiryItems.map((item) => {
            const expiryStatus = getExpiryStatus(item);

            return (
              <article
                key={item.batch}
                className="mx-1 flex min-h-[68px] min-w-0 items-center justify-between gap-[var(--app-gap-related)] rounded-[var(--app-radius-nested)] border border-[var(--app-color-brand-border)] px-[var(--app-space-4)] py-[var(--app-padding-row-y)] max-sm:gap-[var(--app-space-2)]"
              >
                <div className="min-w-0 overflow-x-auto [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
                  <div className="w-max min-w-full">
                    <p className="whitespace-nowrap text-[length:var(--app-font-size-body-secondary)] leading-[var(--app-line-height-body-secondary)] font-bold text-[var(--app-color-text)]">
                      {item.name}
                    </p>
                    <p className="mt-[var(--app-space-1)] whitespace-nowrap text-[length:var(--app-font-size-caption)] leading-[var(--app-line-height-caption)] text-[var(--app-color-text-subtle)]">
                      Batch: {item.batch} | {item.size} | Exp: {item.exp}
                    </p>
                  </div>
                </div>

                <Badge
                  className={`h-7 shrink-0 rounded-full px-2.5 text-[length:var(--app-font-size-body-secondary)] font-medium max-sm:h-6 max-sm:px-2 max-sm:text-[length:var(--app-font-size-caption)] ${expiryStatus.className}`}
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
