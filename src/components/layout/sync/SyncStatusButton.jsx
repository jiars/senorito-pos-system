import { useEffect, useState } from "react";
import { Button } from "../../ui/button";
import SyncOrderList from "./SyncOrderList";
import {
  Popover,
  PopoverContent,
  PopoverDescription,
  PopoverHeader,
  PopoverTitle,
  PopoverTrigger,
} from "../../ui/popover";

const statusIcons = {
  checking: "bi-hourglass-split",
  online: "bi-wifi",
  synced: "bi-check-circle",
  pending: "bi-clock",
  syncing: "bi-arrow-repeat",
  offline: "bi-wifi-off",
  connection_issue: "bi-exclamation-circle",
  needs_attention: "bi-exclamation-triangle",
  sign_in_required: "bi-lock",
};

// Presentation only; queue reads and uploads stay outside this component.
export default function SyncStatusButton({ cashierId, statusKey, label, state, queue }) {
  const [isOpen, setIsOpen] = useState(false);

  useEffect(() => {
    function openRequestedDetails(event) {
      // An older account's toast must not open this account's queue.
      if (!cashierId || !event.detail || event.detail.cashierId !== cashierId) return;
      setIsOpen(true);
    }

    window.addEventListener("senorito:open-sync-details", openRequestedDetails);
    return () => {
      window.removeEventListener("senorito:open-sync-details", openRequestedDetails);
    };
  }, [cashierId]);

  const icon = statusIcons[statusKey] || "bi-info-circle";
  let statusColors =
    "bg-[var(--app-color-canvas)] text-[var(--app-color-text)]";

  if (statusKey === "online" || statusKey === "synced") {
    statusColors =
      "bg-[var(--app-color-highlight)] text-[var(--app-color-synced)]";
  }

  const summary = queue.summary;
  const canShowCounts = Boolean(summary) && !queue.isChecking && !queue.queueReadFailed;
  let unavailableCount = "Checking…";
  if (queue.queueReadFailed) unavailableCount = "Unavailable";

  let description = "Connection and saved-order status for this browser.";
  if (statusKey === "online") {
    description = "Your browser reports a connection. This is not a live server health check.";
  } else if (statusKey === "synced") {
    description = "Saved orders synchronized and the required menu and stock refresh completed.";
  } else if (statusKey === "offline") {
    description = "Your browser reports no connection. Existing saved orders remain on this device.";
  } else if (statusKey === "syncing") {
    description = "Synchronizing saved orders and preparing menu and stock. Please wait.";
  } else if (statusKey === "pending") {
    description = "Saved orders are waiting to synchronize. Keep this browser's data intact.";
  } else if (statusKey === "checking") {
    description = "Reading saved orders and unfinished refresh information on this device.";
  }

  return (
    <Popover open={isOpen} onOpenChange={setIsOpen}>
      <PopoverTrigger
        aria-label={`Sync details: ${label}`}
        render={
          <Button
            type="button"
            variant="ghost"
            size="sm"
            className={`h-auto rounded-full min-h-[var(--app-touch-target-min)] min-w-[var(--app-touch-target-min)] gap-[var(--app-space-2)] px-[var(--app-space-4)] py-[var(--app-space-2)] text-[length:var(--app-font-size-body-secondary)] leading-[var(--app-line-height-body-secondary)] hover:bg-[var(--app-color-control-hover)] hover:text-[var(--app-color-text)] ${statusColors}`}
          >
            <i className={`bi ${icon}`} aria-hidden="true" />
            {label}
            <i className={`bi ${isOpen ? "bi-chevron-up" : "bi-chevron-down"}`} aria-hidden="true" />
          </Button>
        }
      />
      <span className="sr-only" role="status" aria-live="polite" aria-atomic="true">
        {label}
      </span>
      <PopoverContent
        align="end"
        sideOffset={8}
        className="w-80 max-w-[calc(100vw-2rem)] max-h-[min(36rem,80svh,var(--available-height))] overflow-y-auto rounded-[var(--app-radius-panel-standard)] bg-[var(--app-color-surface)] p-[var(--app-padding-panel)] gap-[var(--app-gap-related)] text-[length:var(--app-font-size-body-secondary)] leading-[var(--app-line-height-body-secondary)] text-[var(--app-color-text)]"
      >
        <PopoverHeader>
          <PopoverTitle className="text-[length:var(--app-font-size-body)] leading-[var(--app-line-height-body)] font-semibold">
            Sync details
          </PopoverTitle>
          <PopoverDescription className="text-[var(--app-color-text-muted)]">
            {description}
          </PopoverDescription>
        </PopoverHeader>

        <dl className="grid grid-cols-[minmax(0,1fr)_auto] gap-x-[var(--app-space-4)] gap-y-[var(--app-space-2)]">
          <dt>Browser connection</dt>
          <dd className="text-right font-medium">{state.isOnline ? "Online" : "Offline"}</dd>
          <dt>Current status</dt>
          <dd className="text-right font-medium">{label}</dd>
        </dl>

        <div>
        <hr className="m-0 w-full border-0 border-t border-[var(--app-color-border-subtle)]" />

        {(!canShowCounts || summary.awaitingAuthCount > 0) && (
        <dl className="grid grid-cols-[minmax(0,1fr)_auto] gap-x-[var(--app-space-4)] gap-y-[var(--app-space-2)]">
          {!canShowCounts && (
            <>
              <dt>Pending orders</dt>
              <dd className="text-right">{unavailableCount}</dd>
              <dt>Orders needing attention</dt>
              <dd className="text-right">{unavailableCount}</dd>
            </>
          )}
          {canShowCounts && summary.awaitingAuthCount > 0 && (
            <>
              <dt>Pending sign-in</dt>
              <dd className="text-right tabular-nums">{summary.awaitingAuthCount}</dd>
            </>
          )}
        </dl>
        )}

        {canShowCounts && (
          <div>
            <SyncOrderList title="Pending orders" orders={summary.pendingOrders} />
            <SyncOrderList title="Orders needing attention" orders={summary.attentionOrders} needsAttention />
          </div>
        )}

        <div className="space-y-[var(--app-space-2)] text-[var(--app-color-text-muted)] empty:hidden">
          {queue.queueReadFailed && <p>Saved orders could not be read. Counts are unknown, not zero. Do not clear browser data.</p>}
          {state.signInRequired && <p>Some pending orders require their cashier to sign in before synchronization can continue.</p>}
          {state.connectionIssue && <p>A synchronization request failed. Browser connectivity alone does not mean the server can be reached. Unsent orders remain saved.</p>}
          {state.syncFailed && <p>The last synchronization attempt did not finish successfully. This panel does not retry it.</p>}
          {(state.refreshRequired || state.refreshFailed) && (
            <p>Menu and stock still need a successful refresh. This does not mean an accepted sale must be submitted again.</p>
          )}
          {canShowCounts && summary.attentionCount > 0 && <p>Some saved orders need review and are not automatically retried. These are separate from pending orders.</p>}
          {canShowCounts && summary.awaitingAuthCount > 0 && <p>Pending sign-in orders are already included in the pending count.</p>}
          {canShowCounts && summary.otherCashierCount > 0 && <p>Other cashiers also have saved orders on this browser. They are not included in your counts and are not uploaded by your session.</p>}
          {canShowCounts && summary.unknownOwnerCount > 0 && <p>Some saved orders have no identified cashier and need review. They are not included in your counts.</p>}
        </div>
        </div>

      </PopoverContent>
    </Popover>
  );
}
