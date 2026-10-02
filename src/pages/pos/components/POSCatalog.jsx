import ToolbarSearchInput from "@/components/filters/ToolbarSearchInput";
import { Skeleton } from "@/components/ui/skeleton";
import POSProductCard from "./product-browser/POSProductCard";

const CategoryScroller = ({ categories = ['All'], activeCategory, onSelectCategory, isLoading }) => {
  return (
    <nav
      aria-label="Menu categories"
      className="flex min-w-0 items-center gap-[var(--app-space-2)] overflow-x-auto overflow-y-hidden whitespace-nowrap py-[var(--app-space-1)] [scrollbar-width:none] [-ms-overflow-style:none] [&::-webkit-scrollbar]:hidden"
    >
      {isLoading ? (
        [1, 2, 3, 4, 5].map((i) => (
          <Skeleton key={i} className={`h-[var(--app-touch-target-min)] rounded-full shrink-0 ${i === 1 ? 'w-16' : 'w-24'}`} />
        ))
      ) : (
        categories.map(cat => (
        <button
          key={cat}
          type="button"
          aria-pressed={activeCategory === cat}
          className={`min-h-[var(--app-touch-target-min)] flex-none rounded-full border px-[var(--app-space-4)] text-[length:var(--app-font-size-body-secondary)] font-medium transition-colors ${
            activeCategory === cat
              ? "border-[var(--app-color-brand)] bg-[var(--app-color-brand)] text-white"
              : "border-[var(--app-color-border-subtle)] bg-[var(--app-color-surface)] text-[var(--app-color-filter-font-color)] hover:bg-[var(--app-color-control-hover)]"
          }`}
          onClick={() => onSelectCategory(cat)}
        >
          {cat}
        </button>
      )))}
    </nav>
  );
};

const POSProductCardSkeleton = () => (
  <div className="relative p-[var(--app-gap-related)] flex gap-[var(--app-gap-related)] h-full">
    <Skeleton className="w-20 h-20 shrink-0 rounded-[var(--app-radius-nested)]" />
    <div className="flex flex-col gap-2 flex-1 min-w-0 py-1">
      <Skeleton className="h-4 w-3/4" />
      <Skeleton className="h-4 w-1/2" />
      <Skeleton className="h-4 w-full" />
    </div>
  </div>
);

const POSCategorySection = ({ group, onAddToCart, allAddons, cartItems, isLoading }) => {
  if (isLoading) {
    return (
      <section className="pos-category-section">
        <header className="flex justify-between items-center mb-[var(--app-gap-related)] px-1">
          <Skeleton className="h-6 w-32" />
          <Skeleton className="h-4 w-20" />
        </header>
        <div className="pos-product-grid">
          {[1, 2, 3, 4, 5, 6].map((i) => (
            <POSProductCardSkeleton key={i} />
          ))}
        </div>
      </section>
    );
  }
  return (
    <section
      className="pos-category-section"
      aria-labelledby={`pos-category-${group.label.toLowerCase().replace(/[^a-z0-9]+/g, '-')}`}
    >
      <header className="pos-category-heading">
        <h2
          className="min-w-0 break-words text-[length:var(--app-font-size-body)] leading-[var(--app-line-height-body)] font-semibold text-[var(--app-color-text)] m-0"
          id={`pos-category-${group.label.toLowerCase().replace(/[^a-z0-9]+/g, '-')}`}
        >
          {group.label}
        </h2>
        <span className="shrink-0 italic text-[length:var(--app-font-size-caption)] leading-[var(--app-line-height-caption)] text-[var(--app-color-text-subtle)]">
          {group.products.length} Menu Items
        </span>
      </header>

      <div className="pos-product-grid">
        {group.products.map((product) => (
          <POSProductCard
            key={product.id}
            product={product}
            onAdd={onAddToCart}
            allAddons={allAddons}
            cartItems={cartItems}
          />
        ))}
      </div>
    </section>
  );
};

const POSCatalog = ({
  categories,
  activeCategory,
  onSelectCategory,
  searchTerm,
  onSearchChange,
  catalogGroups,
  onAddToCart,
  allAddons,
  cartItems,
  isLoading,
  hasLoadedMenu,
}) => {
  return (
    <section className="pos-product-area" aria-label="Menu catalog">
      <div className="w-full shrink-0">
        <ToolbarSearchInput
          placeholder="Search food, coffee, or item..."
          value={searchTerm}
          onValueChange={onSearchChange}
          isLoading={!hasLoadedMenu && isLoading}
        />
      </div>

      <div className="pos-product-browser">
        <CategoryScroller
          categories={categories}
          activeCategory={activeCategory}
          onSelectCategory={onSelectCategory}
          isLoading={!hasLoadedMenu && isLoading}
        />

        <div
          className="flex min-w-0 flex-col gap-[var(--app-gap-section)]"
          aria-live="polite"
        >
          {!hasLoadedMenu && isLoading ? (
            [1, 2].map((i) => (
              <POSCategorySection key={i} isLoading={true} />
            ))
          ) : catalogGroups.length === 0 ? (
            <div className="rounded-[var(--app-radius-panel-standard)] bg-[var(--app-color-surface)] p-[var(--app-space-6)] text-center text-[length:var(--app-font-size-body-secondary)] text-[var(--app-color-text-muted)]">
              {activeCategory === "Not Available"
                ? "No unavailable items found."
                : "No available items found."}
            </div>
          ) : (
            catalogGroups.map((group) => (
              <POSCategorySection
                key={group.label}
                group={group}
                onAddToCart={onAddToCart}
                allAddons={allAddons}
                cartItems={cartItems}
              />
            ))
          )}
        </div>

        {isLoading && hasLoadedMenu && (
          <div role="status" className="flex items-center justify-center gap-[var(--app-space-2)] py-[var(--app-space-4)] text-[length:var(--app-font-size-caption)] text-[var(--app-color-text-muted)]">
            <i className="bi bi-arrow-clockwise animate-spin motion-reduce:animate-none" aria-hidden="true" />
            <span>Refreshing menu...</span>
          </div>
        )}
      </div>
    </section>
  );
};

export default POSCatalog;
