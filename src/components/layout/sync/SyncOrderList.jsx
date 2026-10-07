import { useState } from "react";
import { Button } from "../../ui/button";
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from "../../ui/collapsible";

// Both queue sections share the same read-only, touch-friendly layout.
export default function SyncOrderList({
  title,
  orders,
  needsAttention = false,
}) {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <Collapsible open={isOpen} onOpenChange={setIsOpen}>
      <CollapsibleTrigger
        render={
          <Button
            type="button"
            variant="ghost"
            className="h-auto min-h-[var(--app-touch-target-min)] w-full justify-between gap-[var(--app-space-2)] rounded-[var(--app-radius-nested)] px-0 py-[var(--app-space-2)] text-left whitespace-normal text-[length:var(--app-font-size-body-secondary)] hover:bg-[var(--app-color-control-hover)]"
          >
            <span className="min-w-0 flex-1">{title}</span>
            <span className="shrink-0 tabular-nums">{orders.length}</span>
            <i
              className={`bi ${isOpen ? "bi-chevron-up" : "bi-chevron-down"} shrink-0`}
              aria-hidden="true"
            />
          </Button>
        }
      />
      <CollapsibleContent>
        {orders.length === 0 ? (
          <p className="py-[var(--app-space-2)] text-[var(--app-color-text-muted)]">
            {needsAttention
              ? "No orders need attention."
              : "No pending orders."}
          </p>
        ) : (
          <ul
            aria-label={title}
            className="space-y-[var(--app-space-2)] px-[var(--app-space-2)] py-[var(--app-space-2)]"
          >
            {orders.map((order) => {
              let message = "Waiting to synchronize.";

              if (order.status === "awaiting_auth") {
                message =
                  "Sign in with this order's cashier account to synchronize.";
              } else if (order.status === "failed") {
                message = "The last upload failed. This order remains saved.";
              } else if (order.status === "syncing") {
                message = "Synchronization is in progress.";
              }

              if (needsAttention) {
                message =
                  "This order needs review. Please ask an administrator for help.";
                // Show validation feedback, not raw unexpected server errors.
                if (
                  order.lastErrorStatus === 422 &&
                  typeof order.lastError === "string" &&
                  order.lastError.trim()
                ) {
                  message = order.lastError;
                }
              }

              return (
                <li
                  key={order.id}
                  className="min-w-0 space-y-[var(--app-space-1)] [overflow-wrap:anywhere]"
                >
                  <p className="font-medium">{order.orderNumber}</p>
                  <p className="text-[var(--app-color-text-muted)]">
                    {message}
                  </p>
                </li>
              );
            })}
          </ul>
        )}
      </CollapsibleContent>
    </Collapsible>
  );
}
