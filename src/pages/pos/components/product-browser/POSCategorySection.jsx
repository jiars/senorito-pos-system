import POSProductCard from './POSProductCard';
import { Skeleton } from "@/components/ui/skeleton";

export const POSProductCardSkeleton = () => (
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

export default POSCategorySection;
