import { Skeleton } from "@/components/ui/skeleton";

const ReceiptSkeleton = () => (
  <div
    role="status"
    aria-busy="true"
    className="space-y-[var(--app-space-6)] rounded-[var(--app-radius-nested)] border border-[var(--app-color-border-subtle)] bg-[var(--app-color-surface)] p-[var(--app-space-4)] sm:p-[var(--app-space-6)] print:hidden motion-reduce:[&_[data-slot=skeleton]]:animate-none"
  >
    <span className="sr-only">Loading order details…</span>
    <div aria-hidden="true" className="space-y-[var(--app-space-6)]">
      <div className="flex flex-col items-center gap-[var(--app-space-2)]">
        <Skeleton className="h-6 w-36 max-w-full" />
        <Skeleton className="h-3 w-full" />
        <Skeleton className="h-3 w-28 max-w-full" />
      </div>
      <div className="space-y-[var(--app-space-2)] border-y border-dashed border-[var(--app-color-border-subtle)] py-[var(--app-space-4)]">
        {Array.from({ length: 5 }, (_, index) => (
          <div key={index} className="flex justify-between gap-[var(--app-space-4)]">
            <Skeleton className="h-4 w-1/3" />
            <Skeleton className="h-4 w-2/5" />
          </div>
        ))}
      </div>
      <div className="space-y-[var(--app-space-4)]">
        {Array.from({ length: 3 }, (_, index) => (
          <div key={index} className="grid grid-cols-[2fr_1fr_1fr_1fr] gap-[var(--app-space-2)]">
            {Array.from({ length: 4 }, (_, column) => (
              <Skeleton key={column} className="h-4 w-full" />
            ))}
          </div>
        ))}
      </div>
      <div className="flex justify-between gap-[var(--app-space-4)] border-t border-dashed border-[var(--app-color-border-subtle)] pt-[var(--app-space-4)]">
        <Skeleton className="h-6 w-1/3" />
        <Skeleton className="h-6 w-2/5" />
      </div>
    </div>
  </div>
);

export default ReceiptSkeleton;
