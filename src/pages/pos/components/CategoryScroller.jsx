import React, { useRef } from 'react';
import { Skeleton } from "@/components/ui/skeleton";

const CategoryScroller = ({ categories = ['All'], activeCategory, onSelectCategory, isLoading }) => {
  const scrollRef = useRef(null);

  // Optional: Add drag-to-scroll functionality if desired, but native shift+scroll or touch works well.
  
  return (
    <nav
      ref={scrollRef}
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

export default CategoryScroller;
