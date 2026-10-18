import { useEffect, useRef, useState } from "react";
import StatusFeedback from "@/components/feedback/status/StatusFeedback";
import Modal from "@/components/modals/Modal";
import ModalBody from "@/components/modals/ModalBody";
import ModalContent from "@/components/modals/ModalContent";
import ModalFooter from "@/components/modals/ModalFooter";
import ModalHeader from "@/components/modals/ModalHeader";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { formatDate, formatDateTime } from "@/utils/shared/formatters/dateFormatters";
import {
  INVENTORY_CLEANUP_COPY,
  getInventoryCleanupErrorFeedback,
  getInventoryCleanupSummaryFeedback,
} from "@/utils/inventory/feedback/inventoryCleanupFeedback";

// Stacked rows fit the narrow modal without forcing a wide, scrolling table.
const CleanupBatchList = ({ batches }) => (
  <section aria-label="Expired batch stock removed" className="min-w-0">
    <h3 className="mb-[var(--app-space-2)] text-[length:var(--app-font-size-body-secondary)] font-semibold text-[var(--app-color-text)]">
      Expired batches
    </h3>
    <ul className="overflow-hidden rounded-[var(--app-radius-nested)] border border-[var(--app-color-border-subtle)]">
      {batches.map((batch) => (
        <li key={batch.audit_log_id} className="flex flex-wrap items-start justify-between gap-[var(--app-space-2)] border-b border-[var(--app-color-border-subtle)] p-[var(--app-space-4)] last:border-b-0">
          <div className="min-w-0 flex-1 basis-40">
            <div className="flex min-w-0 flex-wrap items-center gap-[var(--app-space-2)]">
              <p className="min-w-0 break-words text-[length:var(--app-font-size-body-secondary)] font-semibold text-[var(--app-color-text)]">
                {batch.item_name || "Unknown item"}
              </p>
              {batch.archived && (
                <span className="shrink-0 rounded-full bg-[var(--app-color-canvas)] px-[var(--app-space-2)] py-[var(--app-space-1)] text-[length:var(--app-font-size-caption)] text-[var(--app-color-text-muted)]">
                  Archived
                </span>
              )}
            </div>
            <p className="mt-[var(--app-space-1)] break-all text-[length:var(--app-font-size-caption)] text-[var(--app-color-text-muted)]">
              {batch.batch_number}
            </p>
            <p className="mt-[var(--app-space-1)] text-[length:var(--app-font-size-caption)] text-[var(--app-color-text-muted)]">
              Expired: {formatDate(batch.expiration_date)}
            </p>
          </div>
          <div className="max-w-full text-right">
            <p className="text-[length:var(--app-font-size-caption)] text-[var(--app-color-text-muted)]">Removed</p>
            <p className="break-words text-[length:var(--app-font-size-body)] font-bold text-[var(--app-color-danger-foreground)]">
              {batch.quantity_removed} {batch.base_unit}
            </p>
          </div>
        </li>
      ))}
    </ul>
  </section>
);

// Each failed attempt mounts this again, starting a fresh three-second cooldown.
const SummaryReadError = ({ error, feedback, onRetry }) => {
  const [canRetry, setCanRetry] = useState(false);
  const retryInProgress = useRef(false);

  useEffect(() => {
    const timer = window.setTimeout(() => setCanRetry(true), 3000);
    return () => window.clearTimeout(timer);
  }, []);

  const handleRetry = async () => {
    if (!canRetry || retryInProgress.current) return;
    retryInProgress.current = true;
    try {
      await onRetry();
    } finally {
      retryInProgress.current = false;
    }
  };

  return (
    <div className="grid gap-[var(--app-gap-related)]">
      <StatusFeedback feedback={feedback || getInventoryCleanupErrorFeedback(error)} />
      <Button type="button" variant="outline" disabled={!canRetry} onClick={handleRetry}
        className="min-h-[var(--app-touch-target-min)] justify-self-start">
        {canRetry ? INVENTORY_CLEANUP_COPY.RETRY : INVENTORY_CLEANUP_COPY.RETRY_WAIT}
      </Button>
    </div>
  );
};

// The parent owns the query. This modal only displays its result and forwards Retry.
const InventoryCleanupSummaryModal = ({
  isOpen,
  onClose,
  summary,
  isLoading,
  error,
  errorUpdatedAt,
  onRetry,
  requireCompleted = false,
}) => {
  if (!isOpen) return null;

  // Startup cannot be dismissed before confirmation; the manual viewer stays closable.
  const closeDisabled = Boolean(requireCompleted && (isLoading || error || !summary || !summary.completed));
  const handleClose = () => {
    if (!closeDisabled) onClose();
  };

  let content;
  if (isLoading) {
    content = (
      <div role="status" aria-busy="true" aria-label={INVENTORY_CLEANUP_COPY.LOADING_LABEL}
        className="grid min-w-0 gap-[var(--app-gap-related)]">
        <Skeleton className="h-24 w-full" />
        {Array.from({ length: 3 }, (_, index) => (
          <div key={index} className="flex justify-between gap-[var(--app-space-4)] py-[var(--app-space-2)]">
            <div className="grid flex-1 gap-[var(--app-space-2)]">
              <Skeleton className="h-5 w-3/4" />
              <Skeleton className="h-4 w-full" />
              <Skeleton className="h-4 w-1/2" />
            </div>
            <Skeleton className="h-8 w-20" />
          </div>
        ))}
      </div>
    );
  } else if (error || !summary) {
    content = <SummaryReadError key={errorUpdatedAt} error={error} onRetry={onRetry} />;
  } else if (requireCompleted && !summary.completed) {
    content = <SummaryReadError key={summary.business_date}
      feedback={getInventoryCleanupSummaryFeedback(summary)} onRetry={onRetry} />;
  } else {
    const summaryFeedback = getInventoryCleanupSummaryFeedback(summary);

    content = (
      <>
        {summaryFeedback && <StatusFeedback feedback={summaryFeedback} />}
        <dl className="grid grid-cols-2 items-start gap-[var(--app-space-4)] rounded-[var(--app-radius-nested)] border border-[var(--app-color-border-subtle)] bg-[var(--app-color-surface)] p-[var(--app-space-4)] text-[length:var(--app-font-size-body-secondary)]">
          <div>
            <dt className="text-[length:var(--app-font-size-caption)] text-[var(--app-color-text-muted)]">Business date</dt>
            <dd className="mt-[var(--app-space-1)] font-semibold text-[var(--app-color-text)]">{formatDate(summary.business_date)}</dd>
          </div>
          {summary.completed && (
            <>
              <div className="text-right">
                <dt className="text-[length:var(--app-font-size-caption)] text-[var(--app-color-text-muted)]">Batches cleaned</dt>
                <dd className="text-[length:var(--app-font-size-h3)] font-bold text-[var(--app-color-brand)]">{summary.cleaned_batch_count}</dd>
              </div>
              <div className="col-span-2 border-t border-[var(--app-color-border-subtle)] pt-[var(--app-space-2)]">
                <dt className="text-[length:var(--app-font-size-caption)] text-[var(--app-color-text-muted)]">Completed (Philippine time)</dt>
                <dd className="mt-[var(--app-space-1)] font-medium">{formatDateTime(summary.completed_at)}</dd>
              </div>
            </>
          )}
        </dl>
        {summary.completed && summary.details_available && summary.cleaned_batch_count === 0 && (
          <p role="status" className="text-[length:var(--app-font-size-body-secondary)] text-[var(--app-color-text-muted)]">
            {INVENTORY_CLEANUP_COPY.EMPTY}
          </p>
        )}
        {summary.completed && summary.details_available && summary.cleaned_batch_count > 0 && (
          <CleanupBatchList batches={summary.batches} />
        )}
      </>
    );
  }

  return (
    <Modal isOpen={isOpen} onClose={handleClose} maxWidth="36rem" maxHeight="min(90svh, 44rem)">
      <ModalHeader title={INVENTORY_CLEANUP_COPY.TITLE} description={INVENTORY_CLEANUP_COPY.DESCRIPTION}
        iconClassName="bi bi-calendar-check" closeDisabled={closeDisabled} />
      <ModalBody viewportClassName="!max-h-[calc(var(--app-modal-max-height)-12rem)]">
        <ModalContent className="min-w-0 !p-[var(--app-padding-panel)] max-sm:!p-[var(--app-space-4)]">{content}</ModalContent>
      </ModalBody>
      <ModalFooter>
        <Button type="button" variant="outline" onClick={handleClose} disabled={closeDisabled}
          className="min-h-[var(--app-touch-target-min)] rounded-[var(--app-radius-nested)] border-[var(--app-color-border-subtle)] bg-[var(--app-color-filter-bg)] px-[var(--app-space-4)] text-[length:var(--app-font-size-body-secondary)] font-medium text-[var(--app-color-text-muted)] hover:bg-[var(--app-color-border-subtle)]">
          {INVENTORY_CLEANUP_COPY.CLOSE}
        </Button>
      </ModalFooter>
    </Modal>
  );
};

export default InventoryCleanupSummaryModal;
