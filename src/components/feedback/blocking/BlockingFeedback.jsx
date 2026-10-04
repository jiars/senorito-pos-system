import { useEffect, useRef } from "react";
import { Dialog, DialogContent, DialogDescription, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";

// Presentational only: the caller owns the operation, recovery, and open state.
// status: "loading" | "error"; action?: { label, onClick, disabled }
const BlockingFeedback = ({ open, status = "loading", title, message, action }) => {
  const titleRef = useRef(null);
  const isError = status === "error";
  const hasAction = Boolean(action);

  useEffect(() => {
    // Keep focus inside when a status change removes the focused action.
    if (open) titleRef.current?.focus();
  }, [open, status, hasAction]);

  const handleOpenChange = (nextOpen, details) => {
    // Only the caller may release the lock, including during error recovery.
    if (!nextOpen && open) details.cancel();
  };

  return (
    <Dialog open={open} modal disablePointerDismissal onOpenChange={handleOpenChange}>
      <DialogContent
        showCloseButton={false}
        initialFocus={titleRef}
        overlayClassName="!z-[20000] !bg-black/40 motion-reduce:animate-none"
        className="!z-[20001] flex max-h-[90svh] w-[calc(100%-2rem)] max-w-sm flex-col items-center gap-[var(--app-gap-related)] overflow-y-auto rounded-[var(--app-radius-panel-standard)] border border-[var(--app-color-border-subtle)] bg-[var(--app-color-surface)] p-[var(--app-space-6)] text-center text-[var(--app-color-text)] shadow-[var(--app-shadow-card)] ring-0 motion-reduce:animate-none"
      >
        <i className={`bi ${isError ? "bi-exclamation-circle text-[var(--app-color-danger)]" : "bi-arrow-clockwise animate-spin text-[var(--app-color-brand)] motion-reduce:animate-none"} text-[length:var(--app-font-size-h2)]`} aria-hidden="true" />
        <div role={isError ? "alert" : "status"} aria-live={isError ? "assertive" : "polite"} aria-atomic="true" className="flex min-w-0 flex-col gap-[var(--app-space-2)]">
          <DialogTitle ref={titleRef} tabIndex={-1} className="break-words text-[length:var(--app-font-size-body)] font-semibold leading-[var(--app-line-height-body)] outline-none">
            {title}
          </DialogTitle>
          {message && (
            <DialogDescription className="break-words text-[length:var(--app-font-size-body-secondary)] leading-[var(--app-line-height-body-secondary)] text-[var(--app-color-text-muted)]">
              {message}
            </DialogDescription>
          )}
        </div>
        {hasAction && (
          <Button
            type="button"
            onClick={action.onClick}
            disabled={action.disabled}
            className="min-h-[var(--app-touch-target-min)] w-full whitespace-normal rounded-[var(--app-radius-nested)] bg-[var(--app-color-brand)] px-[var(--app-space-4)] text-[length:var(--app-font-size-body-secondary)] leading-[var(--app-line-height-body-secondary)] text-white hover:bg-[var(--app-color-brand)] hover:opacity-90"
          >
            {action.label}
          </Button>
        )}
      </DialogContent>
    </Dialog>
  );
};

export default BlockingFeedback;
