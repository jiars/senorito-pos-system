import EmptyState from "@/components/feedback/data-state/EmptyState";
import { Skeleton } from "@/components/ui/skeleton";

import MenuItemCard from "./MenuItemCard";

const MenuItemCardSkeleton = () => {
  return (
    <div className="grid min-h-[10rem] min-w-0 grid-cols-[8rem_minmax(0,1fr)] gap-[var(--app-gap-related)] rounded-[var(--app-radius-panel-standard)] bg-[var(--app-color-surface)] p-[var(--app-space-4)] max-sm:min-h-[8.5rem] max-sm:grid-cols-[6.5rem_minmax(0,1fr)]">
      <Skeleton className="aspect-square size-[8rem] rounded-[var(--app-radius-nested)] max-sm:size-[6.5rem]" />

      <div className="flex min-w-0 flex-col gap-[var(--app-space-2)]">
        <Skeleton className="h-5 w-3/4" />
        <Skeleton className="h-4 w-1/2" />

        <div className="mt-auto grid gap-[var(--app-space-2)]">
          <Skeleton className="h-4 w-full" />
          <Skeleton className="h-4 w-4/5" />
        </div>
      </div>
    </div>
  );
};

const MenuItemsSection = ({
  items = [],
  isLoading,
  mode = "active",
  onEdit,
  onArchive,
  onRestore,
}) => {
  const isArchiveMode = mode === "archive";

  if (isLoading) {
    return (
      <section
        aria-label={
          isArchiveMode ? "Loading archived menu items" : "Loading menu items"
        }
        className="grid min-w-0 grid-cols-1 gap-[var(--app-gap-related)] p-[var(--app-space-4)] sm:grid-cols-2 lg:grid-cols-3 2xl:grid-cols-4"
      >
        {Array.from({ length: 6 }, (_, index) => (
          <MenuItemCardSkeleton key={index} />
        ))}
      </section>
    );
  }

  if (items.length === 0) {
    return (
      <section className="min-w-0 p-[var(--app-space-4)]">
        <EmptyState
          title={
            isArchiveMode
              ? "No archived menu items found."
              : "No menu items found."
          }
          description={
            isArchiveMode
              ? "Archived menu items will appear here."
              : "Try changing your search or selected filters."
          }
          className="rounded-[var(--app-radius-panel-standard)] bg-[var(--app-color-surface)]"
        />
      </section>
    );
  }

  return (
    <section
      aria-label="Menu items"
      className="grid min-w-0 grid-cols-1 gap-[var(--app-gap-related)] px-[var(--app-space-4)] sm:grid-cols-2 lg:grid-cols-3 2xl:grid-cols-4"
    >
      {items.map((item) => (
        <MenuItemCard
          key={item.id}
          item={item}
          mode={mode}
          onEdit={onEdit}
          onArchive={onArchive}
          onRestore={onRestore}
        />
      ))}
    </section>
  );
};

export default MenuItemsSection;
