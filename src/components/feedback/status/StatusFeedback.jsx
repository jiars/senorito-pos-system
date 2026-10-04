import { cn } from "@/lib/utils";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";

const bannerTones = {
  loading: {
    icon: "bi-arrow-clockwise",
    surface: "border-[var(--app-color-brand-border)] bg-[var(--app-color-surface-soft)]",
    iconColor: "text-[var(--app-color-brand)]",
  },
  info: {
    icon: "bi-info-circle",
    surface: "border-[var(--app-color-border-subtle)] bg-[var(--app-color-canvas)]",
    iconColor: "text-[var(--app-color-info)]",
  },
  success: {
    icon: "bi-check-circle",
    surface: "border-[var(--app-color-success)] bg-[var(--app-color-success-surface)]",
    iconColor: "text-[var(--app-color-synced)]",
  },
  warning: {
    icon: "bi-exclamation-triangle",
    surface: "border-[var(--app-color-warning)] bg-[var(--app-color-warning-surface)]",
    iconColor: "text-[var(--app-color-text)]",
  },
  error: {
    icon: "bi-exclamation-circle",
    surface: "border-[var(--app-color-danger-border)] bg-[var(--app-color-danger-surface)]",
    iconColor: "text-[var(--app-color-danger)]",
  },
};

const StatusFeedback = ({ feedback, id, className, containerClassName }) => {
  const isVisible = feedback && feedback.display === "status";
  const isLoading = isVisible && feedback.type === "loading";
  let tone = bannerTones.info;
  if (isLoading) {
    tone = bannerTones.loading;
  } else if (isVisible && bannerTones[feedback.tone]) {
    tone = bannerTones[feedback.tone];
  }

  // Keep the live region mounted so a newly started action is announced.
  return (
    <div
      id={id}
      role={isVisible ? feedback.role || "status" : "status"}
      aria-atomic="true"
      className={cn("min-w-0 shrink-0", isVisible && containerClassName)}
    >
      {isVisible && (
        <Alert
          role="presentation"
          className={cn(
            "grid-cols-[auto_minmax(0,1fr)] items-start gap-x-[var(--app-space-2)] gap-y-[var(--app-space-1)] rounded-[var(--app-radius-nested)] p-[var(--app-space-4)] text-[var(--app-color-text)]",
            tone.surface,
            className,
          )}
        >
          <i
            className={cn(
              "bi col-start-1 row-span-2 row-start-1 text-[length:var(--app-font-size-body)] leading-[var(--app-line-height-body-secondary)]",
              tone.icon,
              tone.iconColor,
              isLoading && "animate-spin motion-reduce:animate-none",
            )}
            aria-hidden="true"
          />
          <AlertTitle className="col-start-2 min-w-0 break-words text-[length:var(--app-font-size-body-secondary)] font-semibold leading-[var(--app-line-height-body-secondary)]">
            {feedback.title}
          </AlertTitle>
          {feedback.message && (
            <AlertDescription className="col-start-2 min-w-0 break-words text-[length:var(--app-font-size-caption)] leading-[var(--app-line-height-caption)] text-[var(--app-color-text-muted)]">
              {feedback.message}
            </AlertDescription>
          )}
        </Alert>
      )}
    </div>
  );
};

export default StatusFeedback;
