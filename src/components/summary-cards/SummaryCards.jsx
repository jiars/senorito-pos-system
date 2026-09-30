import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import ResponsiveMetricValue from "@/components/metrics/ResponsiveMetricValue";

const SummaryCards = ({
  cards = [],
  isLoading = false,
  gridClassName = "grid grid-cols-1 gap-[var(--app-gap-related)] sm:grid-cols-3",
}) => {
  const skeletonCount = cards.length || 3;

  if (isLoading) {
    return (
      <div className={gridClassName}>
        {Array.from({ length: skeletonCount }, (_, index) => (
          <Card
            key={`summary-skeleton-${index}`}
            aria-hidden="true"
            className="min-h-[132px] gap-0 rounded-[var(--app-radius-panel-standard)] !py-0 !ring-0"
          >
            <CardHeader className="px-[var(--app-space-4)] pt-[var(--app-space-4)]">
              <Skeleton className="h-4 w-24" />
            </CardHeader>

            <CardContent className="flex flex-1 flex-col justify-center px-[var(--app-space-4)] pb-[var(--app-space-4)] pt-[var(--app-space-2)]">
              <Skeleton className="ml-[var(--app-space-2)] h-8 w-28" />
              <Skeleton className="mt-[var(--app-space-2)] h-3 w-36" />
            </CardContent>
          </Card>
        ))}
      </div>
    );
  }

  return (
    <div className={gridClassName}>
      {cards.map((card) => {
        const cardClassName = `flex min-h-[132px] w-full flex-col rounded-[var(--app-radius-panel-standard)] border bg-[var(--app-color-surface)] p-[var(--app-space-4)] text-left transition-all hover:shadow-brand ${
          card.isActive
            ? "border-[var(--app-color-brand)] shadow-brand"
            : "border-transparent shadow-[var(--app-shadow-card)]"
        } ${
          card.onClick
            ? "cursor-pointer hover:border-[var(--app-color-brand-border)] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--app-color-brand-border)]"
            : ""
        }`;

        const cardBody = (
          <>
            <p
              className={`text-[length:var(--app-font-size-body-secondary)] font-semibold leading-[var(--app-line-height-body-secondary)] text-[var(--app-color-text-muted)] ${card.titleClassName ?? ""}`}
            >
              {card.title}
            </p>

            <div className="flex flex-1 items-center pt-[var(--app-space-2)] [transform:translateY(4px)]">
              <ResponsiveMetricValue
                value={card.value}
                className="ml-[var(--app-space-2)]"
              />
            </div>

            <p className="mt-[var(--app-space-1)] text-[length:var(--app-font-size-caption)] leading-[var(--app-line-height-caption)] text-[var(--app-color-text-subtle)]">
              {card.descriptionAccent && (
                <span
                  className={`font-semibold ${card.descriptionAccentClassName ?? ""}`}
                >
                  {card.descriptionAccent}
                </span>
              )}
              {card.description}
            </p>
          </>
        );

        return card.onClick ? (
          <button
            key={card.id}
            type="button"
            aria-pressed={card.isActive}
            onClick={card.onClick}
            className={cardClassName}
          >
            {cardBody}
          </button>
        ) : (
          <article key={card.id} className={cardClassName}>
            {cardBody}
          </article>
        );
      })}
    </div>
  );
};

export default SummaryCards;
