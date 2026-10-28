import { useRef, useState } from "react";
import { useQueryClient } from "@tanstack/react-query";
import ActionAlertDialog from "@/components/modals/ActionAlertDialog";
import BlockingFeedback from "@/components/feedback/blocking/BlockingFeedback";
import InlineFeedback from "@/components/feedback/inline/InlineFeedback";
import { Textarea } from "@/components/ui/textarea";
import { toast } from "@/components/ui/toast";
import { useFeedback } from "@/hooks/feedback/useFeedback";
import { useBrowserOnline } from "@/hooks/sync/useBrowserOnline";
import { useOrderVoidStockRefresh } from "@/hooks/useOrderVoidStockRefresh";
import VoidStockHandlingField from "./VoidStockHandlingField";
import VoidRequestHistory from "./VoidRequestHistory";
import "./reviewOrderVoidModal.css";
import { reviewOrderVoid } from "@/services/orders/orderVoidRequestsService";
import { formatCurrency } from "@/utils/shared/formatters/currencyFormatters";
import { canReviewOrderVoid, canReturnOrderStock } from "@/utils/orders/orderVoidUtils";
import { validateVoidReviewReason, validateVoidStockHandling, getVoidReviewFieldErrors, VOID_REASON_MAX_LENGTH } from "@/utils/orders/validation/orderVoidRequestValidation";
import { getVoidRequestErrorCode, getVoidReviewInlineFeedback, getVoidReviewToastFeedback, getVoidReviewLoadingFeedback } from "@/utils/orders/feedback/orderVoidRequestFeedback";

const ReviewOrderVoidModal = ({ order, role, refetchOrderManagement, onClose }) => {
  const [reviewReason, setReviewReason] = useState("");
  const [reasonError, setReasonError] = useState("");
  const [stockHandling, setStockHandling] = useState("");
  const [stockError, setStockError] = useState("");
  const [activeAction, setActiveAction] = useState("");
  const [confirmedDecision, setConfirmedDecision] = useState("");
  const [actionsBlocked, setActionsBlocked] = useState(false);
  const operationInFlight = useRef(false);
  const alreadyReviewed = useRef(false);
  const savedStockHandling = useRef("");
  const { prepareStockReturn, refreshStockAfterReview } = useOrderVoidStockRefresh();
  const queryClient = useQueryClient();
  const isOnline = useBrowserOnline();
  const { feedback, showFeedback, clearFeedback } = useFeedback(getVoidReviewInlineFeedback);
  const pending = order.pending_void_request;
  const canReview = canReviewOrderVoid(order, role);
  const canReturnStock = canReturnOrderStock(order);
  let requests = order.void_requests || [];
  if (requests.length === 0 && pending) requests = [pending];
  let previousRequests = [];
  if (canReview) previousRequests = requests.filter((request) => request.id !== pending.id);

  const handleClose = () => {
    if (!operationInFlight.current && !confirmedDecision) onClose(actionsBlocked);
  };

  const refreshDecision = async (decision) => {
    try {
      await refreshStockAfterReview(savedStockHandling.current);
      // Drop inactive report data so revisiting cannot flash pre-void totals.
      queryClient.removeQueries({ queryKey: ["sales-report"], type: "inactive" });
      await queryClient.invalidateQueries({ queryKey: ["sales-report"] });
      const result = await refetchOrderManagement();
      if (result && (result.isError || result.error)) return;
    } catch {
      return;
    }
    toast.add(getVoidReviewToastFeedback(order.order_number, decision, alreadyReviewed.current, savedStockHandling.current));
    onClose(false);
  };

  const handleDecision = async (decision) => {
    if (operationInFlight.current || confirmedDecision || actionsBlocked || !canReview || !isOnline) return;
    const error = validateVoidReviewReason(reviewReason, decision);
    const stockValidation = validateVoidStockHandling(stockHandling, decision, canReturnStock);
    setReasonError(error);
    setStockError(stockValidation);
    if (error || stockValidation) return;
    operationInFlight.current = true;
    setActiveAction(decision);
    clearFeedback();
    try {
      if (decision === "approved" && stockHandling === "return_stock") {
        try {
          await prepareStockReturn();
        } catch {
          showFeedback("STOCK_REFRESH_FAILED");
          return;
        }
      }
      try {
        const result = await reviewOrderVoid(pending.id, decision, reviewReason.trim(), stockHandling);
        alreadyReviewed.current = result.already_reviewed === true;
        savedStockHandling.current = result.void_request.stock_handling || "";
      } catch (saveError) {
        const fieldErrors = getVoidReviewFieldErrors(saveError);
        setReasonError(fieldErrors.reviewReason || "");
        setStockError(fieldErrors.stockHandling || "");
        const code = getVoidRequestErrorCode(saveError);
        showFeedback(code);
        if (["SAVE_UNCONFIRMED", "ORDER_CONFLICT", "ORDER_NOT_FOUND", "PERMISSION_DENIED", "SESSION_EXPIRED"].includes(code)) {
          setActionsBlocked(true);
          queryClient.removeQueries({ queryKey: ["sales-report"], type: "inactive" });
        }
        return;
      }
      setConfirmedDecision(decision);
      await refreshDecision(decision);
    } finally {
      operationInFlight.current = false;
      setActiveAction("");
    }
  };

  const handleRetryRefresh = async () => {
    if (operationInFlight.current || !confirmedDecision) return;
    operationInFlight.current = true;
    setActiveAction("refresh");
    try {
      await refreshDecision(confirmedDecision);
    } finally {
      operationInFlight.current = false;
      setActiveAction("");
    }
  };

  const isSubmitting = Boolean(activeAction);
  const isRefreshError = Boolean(confirmedDecision) && !isSubmitting;
  let loadingCode = "SAVING";
  if (confirmedDecision) loadingCode = "REFRESHING";
  if (isRefreshError) loadingCode = "REFRESH_FAILED";
  const loadingFeedback = getVoidReviewLoadingFeedback(loadingCode);
  const actions = [];
  if (canReview) {
    actions.push(
      { key: "reject", label: "Reject request", tone: "secondary", onClick: () => handleDecision("rejected"), disabled: actionsBlocked || !isOnline },
      { key: "approve", label: "Approve void", tone: "danger", onClick: () => handleDecision("approved"), disabled: actionsBlocked || !isOnline },
    );
  } else {
    actions.push({ key: "close", label: "Close", close: true });
  }
  let blockingAction;
  if (isRefreshError) blockingAction = { label: "Retry refresh", onClick: handleRetryRefresh };

  return (
    <>
      <ActionAlertDialog
        open={!isSubmitting && !confirmedDecision}
        onOpenChange={(open) => { if (!open) handleClose(); }}
        type="small"
        title={canReview ? "Review Void Request" : "Void Request History"}
        showCloseButton={canReview}
        contentClassName="order-void-review-dialog"
        description={canReview ? "Review the request and choose how to handle its stock." : "Recorded requests, Owner decisions, and stock handling."}
        actions={actions}
      >
        <div className="order-void-review-body flex min-w-0 flex-col gap-[var(--app-space-6)]">
          <dl className="flex min-w-0 flex-wrap items-start justify-between gap-[var(--app-space-4)]">
            <div className="min-w-0 flex-1">
              <dt className="text-[length:var(--app-font-size-caption)] text-[var(--app-color-text-muted)]">Order number</dt>
              <dd className="mt-[var(--app-space-1)] text-[length:var(--app-font-size-body-secondary)] font-semibold [overflow-wrap:anywhere]">{order.order_number}</dd>
            </div>
            <div className="shrink-0 text-right">
              <dt className="text-[length:var(--app-font-size-caption)] text-[var(--app-color-text-muted)]">Order total</dt>
              <dd className="mt-[var(--app-space-1)] text-[length:var(--app-font-size-h3)] font-semibold leading-[var(--app-line-height-h3)]">{formatCurrency(order.total)}</dd>
            </div>
          </dl>
          <VoidRequestHistory requests={canReview ? [pending] : requests} />
          {canReview && (
            <div className="flex flex-col gap-[var(--app-space-6)]">
              <VoidStockHandlingField
                value={stockHandling}
                onChange={(value) => { setStockHandling(value); setStockError(""); clearFeedback(); }}
                canReturnStock={canReturnStock}
                disabled={actionsBlocked}
                error={stockError}
              />
              <div className="flex flex-col gap-[var(--app-space-2)]">
                <div className="flex flex-wrap items-baseline justify-between gap-[var(--app-space-2)]">
                  <label htmlFor="void-review-reason" className="text-[length:var(--app-font-size-body-secondary)] font-semibold">Review note</label>
                  <span id="void-review-note-help" className="text-[length:var(--app-font-size-caption)] text-[var(--app-color-text-muted)]">Required for rejection; optional for approval</span>
                </div>
                <Textarea
                  id="void-review-reason"
                  rows={2}
                  placeholder="Add a note for the cashier..."
                  value={reviewReason}
                  maxLength={VOID_REASON_MAX_LENGTH}
                  onChange={(event) => { setReviewReason(event.target.value); setReasonError(""); clearFeedback(); }}
                  disabled={actionsBlocked}
                  aria-invalid={Boolean(reasonError)}
                  aria-describedby={reasonError ? "void-review-note-help void-review-error" : "void-review-note-help"}
                  className="min-h-20 resize-y rounded-[var(--app-radius-nested)] border-[var(--app-color-border-subtle)] p-[var(--app-space-4)] text-[length:var(--app-font-size-body-secondary)] leading-[var(--app-line-height-body-secondary)]"
                />
                {reasonError && <p id="void-review-error" role="alert" className="text-[length:var(--app-font-size-caption)] text-[var(--app-color-danger)]">{reasonError}</p>}
              </div>
              <p className="flex items-start gap-[var(--app-space-2)] rounded-[var(--app-radius-nested)] bg-[var(--app-color-control-hover)] p-[var(--app-space-4)] text-[length:var(--app-font-size-caption)] leading-[var(--app-line-height-caption)] text-[var(--app-color-text-muted)]">
                <i className="bi bi-info-circle shrink-0 text-[var(--app-color-brand)]" aria-hidden="true" />
                Approving removes this order from sales on its original sale date. Cash or GCash refunds are handled separately.
              </p>
              {!isOnline && <p role="status" className="text-[length:var(--app-font-size-caption)] text-[var(--app-color-text-muted)]">An internet connection is required to review.</p>}
            </div>
          )}
          {canReview && previousRequests.length > 0 && (
            <details className="group border-t border-[var(--app-color-border-subtle)] pt-[var(--app-space-4)]">
              <summary className="flex min-h-[var(--app-touch-target-min)] cursor-pointer list-none items-center justify-between gap-[var(--app-space-2)] rounded-[var(--app-radius-nested)] text-[length:var(--app-font-size-body-secondary)] font-medium focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[var(--app-color-brand)] [&::-webkit-details-marker]:hidden">
                Previous requests ({previousRequests.length})
                <i className="bi bi-chevron-down shrink-0 group-open:rotate-180" aria-hidden="true" />
              </summary>
              <div className="pt-[var(--app-space-4)]"><VoidRequestHistory requests={previousRequests} /></div>
            </details>
          )}
          <InlineFeedback feedback={feedback} id="void-review-feedback" />
        </div>
      </ActionAlertDialog>
      <BlockingFeedback open={isSubmitting || Boolean(confirmedDecision)} status={isRefreshError ? "error" : "loading"} title={loadingFeedback.title} message={loadingFeedback.message} action={blockingAction} />
    </>
  );
};

export default ReviewOrderVoidModal;
