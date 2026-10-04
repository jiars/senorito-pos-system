import { Button } from "../../ui/button";

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
export default function SyncStatusButton({ statusKey, label }) {
  const icon = statusIcons[statusKey] || "bi-info-circle";
  let statusColors =
    "bg-[var(--app-color-canvas)] text-[var(--app-color-text)]";

  if (statusKey === "online" || statusKey === "synced") {
    statusColors =
      "bg-[var(--app-color-highlight)] text-[var(--app-color-synced)]";
  }

  return (
    <span role="status" aria-live="polite" aria-atomic="true">
      <Button
        type="button"
        size="sm"
        disabled
        className={`h-auto rounded-full min-h-[var(--app-touch-target-min)] min-w-[var(--app-touch-target-min)] gap-[var(--app-space-2)] px-[var(--app-space-4)] py-[var(--app-space-2)] text-[length:var(--app-font-size-body-secondary)] leading-[var(--app-line-height-body-secondary)] disabled:opacity-100 ${statusColors}`}
      >
        <i className={`bi ${icon}`} aria-hidden="true"></i>
        {label}
      </Button>
    </span>
  );
}
