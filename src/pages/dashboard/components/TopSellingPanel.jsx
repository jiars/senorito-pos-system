import {
  Card,
  CardContent,
  CardHeader,
} from "../../../components/ui/card";
import { Skeleton } from "../../../components/ui/skeleton";
import EmptyState from "@/components/feedback/EmptyState";
import TopSellingItemCard from "@/components/product-card/TopSellingItemCard";

const TopSellingPanel = ({ topSellingItems, isLoading }) => {
  if (isLoading) {
    return (
      <Card
        aria-busy="true"
        aria-label="Loading top selling items"
        className="gap-0 rounded-[var(--app-radius-panel-standard)] !py-0 !ring-0"
      >
        <CardHeader className="px-[var(--app-padding-panel)] pt-[var(--app-padding-panel)]">
          <Skeleton className="h-5 w-44" />
          <Skeleton className="h-3 w-72" />
        </CardHeader>

        <CardContent className="px-[var(--app-padding-panel)] pb-[var(--app-padding-panel)] pt-[var(--app-gap-section)]">
          <Skeleton className="h-[7.25rem] w-full rounded-[var(--app-radius-nested)]" />
        </CardContent>
      </Card>
    );
  }

  return (
    <section className="rounded-[var(--app-radius-panel-standard)] bg-[var(--app-color-surface)] p-[var(--app-padding-panel)] ">
      <header className="mb-[var(--app-gap-section)] flex flex-wrap items-start justify-between gap-[var(--app-gap-related)]">
        <div>
          <h3 className="m-0 text-[length:var(--app-font-size-h3)] leading-[var(--app-line-height-h3)] font-bold text-[var(--app-color-text)]">
            Top Selling Items
          </h3>

          <p className="mt-[var(--app-space-1)] text-[length:var(--app-font-size-caption)] leading-[var(--app-line-height-caption)] text-[var(--app-color-text-subtle)]">
            Your best-performing menu items based on sales this week.
          </p>
        </div>
      </header>

      {topSellingItems.length === 0 ? (
        <EmptyState
          title="No top-selling items yet"
          description="Top items will appear here after completed sales are recorded."
        />
      ) : (
        <div className="-mx-[var(--app-space-2)] flex gap-[var(--app-gap-related)] overflow-x-auto px-[var(--app-space-2)] py-[var(--app-space-2)] [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
          {topSellingItems.slice(0, 5).map((item) => (
            <TopSellingItemCard
              key={item.id}
              item={item}
              className="w-[18rem] shrink-0"
            />
          ))}
        </div>
      )}
    </section>
  );
};

export default TopSellingPanel;
