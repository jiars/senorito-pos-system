import { useRef, useState } from "react";
import { useQueryClient } from "@tanstack/react-query";
import ActionAlertDialog from "@/components/modals/ActionAlertDialog";
import BlockingFeedback from "@/components/feedback/blocking/BlockingFeedback";
import InlineFeedback from "@/components/feedback/inline/InlineFeedback";
import { Textarea } from "@/components/ui/textarea";
import { toast } from "@/components/ui/toast";
import { useFeedback } from "@/hooks/feedback/useFeedback";
import { useBrowserOnline } from "@/hooks/sync/useBrowserOnline";
import { reviewOrderVoid } from "@/services/orders/orderVoidRequestsService";
import { formatCurrency } from "@/utils/shared/formatters/currencyFormatters";
import { formatDateTime } from "@/utils/shared/formatters/dateFormatters";
import { BUSINESS_TIME_ZONE } from "@/utils/shared/formatters/businessDates";
import { canReviewOrderVoid, getVoidRequestStatusLabel, getVoidStaffName } from "@/utils/orders/orderVoidUtils";
import { validateVoidReviewReason, VOID_REASON_MAX_LENGTH } from "@/utils/orders/validation/orderVoidRequestValidation";
import { getVoidRequestErrorCode, getVoidReviewInlineFeedback, getVoidReviewToastFeedback, getVoidReviewLoadingFeedback } from "@/utils/orders/feedback/orderVoidRequestFeedback";

const ReviewOrderVoidModal = ({ order, role, refetchOrderManagement, onClose }) => {
  const [reviewReason, setReviewReason] = useState("");
  const [reasonError, setReasonError] = useState("");
  const [activeAction, setActiveAction] = useState("");
  const [confirmedDecision, setConfirmedDecision] = useState("");
  const [actionsBlocked, setActionsBlocked] = useState(false);
  const operationInFlight = useRef(false);
  const alreadyReviewed = useRef(false);
  const queryClient = useQueryClient();
  const isOnline = useBrowserOnline();
  const { feedback, showFeedback, clearFeedback } = useFeedback(getVoidReviewInlineFeedback);
  const pending = order.pending_void_request;
  const canReview = canReviewOrderVoid(order, role);
  let requests = order.void_requests || [];
  if (requests.length === 0 && pending) requests = [pending];

  const handleClose = () => {
    if (!operationInFlight.current && !confirmedDecision) onClose(actionsBlocked);
  };

  const refreshDecision = async (decision) => {
    try {
      // Drop inactive report data so revisiting cannot flash pre-void totals.
      queryClient.removeQueries({ queryKey: ["sales-report"], type: "inactive" });
      await queryClient.invalidateQueries({ queryKey: ["sales-report"] });
      const result = await refetchOrderManagement();
      if (result && (result.isError || result.error)) return;
    } catch {
      return;
    }
    toast.add(getVoidReviewToastFeedback(order.order_number, decision, alreadyReviewed.current));
    onClose(false);
  };

  const handleDecision = async (decision) => {
    if (operationInFlight.current || confirmedDecision || actionsBlocked || !canReview || !isOnline) return;
    const error = validateVoidReviewReason(reviewReason, decision);
    setReasonError(error);
    if (error) return;
    operationInFlight.current = true;
    setActiveAction(decision);
    clearFeedback();
    try {
      try {
        const result = await reviewOrderVoid(pending.id, decision, reviewReason.trim());
        alreadyReviewed.current = result.already_reviewed === true;
      } catch (saveError) {
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
  const actions = [{ key: "close", label: "Close", close: true }];
  if (canReview) {
    actions.push(
      { key: "reject", label: "Reject request", tone: "secondary", onClick: () => handleDecision("rejected"), disabled: actionsBlocked || !isOnline },
      { key: "approve", label: "Approve void", tone: "danger", onClick: () => handleDecision("approved"), disabled: actionsBlocked || !isOnline },
    );
  }
  let blockingAction;
  if (isRefreshError) blockingAction = { label: "Retry refresh", onClick: handleRetryRefresh };

  return (
    <>
      <ActionAlertDialog
        open={!isSubmitting && !confirmedDecision}
        onOpenChange={(open) => { if (!open) handleClose(); }}
        type="small-media"
        title={canReview ? "Review Void Request" : "Void Request History"}
        iconClassName="bi bi-receipt"
        description={<><span className="font-semibold text-[var(--app-color-text)] [overflow-wrap:anywhere]">{order.order_number}</span> · {formatCurrency(order.total)}</>}
        actions={actions}
      >
        <div className="flex min-w-0 flex-col gap-[var(--app-space-4)]">
          {requests.map((request) => (
            <section key={request.id} className="flex min-w-0 flex-col gap-[var(--app-space-2)] rounded-[var(--app-radius-nested)] border border-[var(--app-color-border-subtle)] p-[var(--app-space-4)] text-[length:var(--app-font-size-body-secondary)] leading-[var(--app-line-height-body-secondary)]">
              <p className="font-semibold">{getVoidRequestStatusLabel(request.status)}</p>
              <p className="whitespace-pre-wrap [overflow-wrap:anywhere]">{request.reason}</p>
              <p className="text-[length:var(--app-font-size-caption)] text-[var(--app-color-text-muted)]">
                Requested by {getVoidStaffName(request.requester)} · {formatDateTime(request.requested_at, BUSINESS_TIME_ZONE)}
              </p>
              {request.reviewed_at && (
                <>
                  <p className="text-[length:var(--app-font-size-caption)] text-[var(--app-color-text-muted)]">
                    Reviewed by {getVoidStaffName(request.reviewer)} · {formatDateTime(request.reviewed_at, BUSINESS_TIME_ZONE)}
                  </p>
                  {request.review_reason && <p className="whitespace-pre-wrap [overflow-wrap:anywhere]">{request.review_reason}</p>}
                </>
              )}
            </section>
          ))}
          {canReview && (
            <div className="flex flex-col gap-[var(--app-space-2)]">
              <p className="text-[length:var(--app-font-size-caption)] leading-[var(--app-line-height-caption)] text-[var(--app-color-text-muted)]">
                Approval excludes this order from sales on its original sale date. It does not issue a refund or return stock. Review the receipt before approving.
              </p>
              <label htmlFor="void-review-reason" className="text-[length:var(--app-font-size-body-secondary)] font-semibold">Review note (required when rejecting)</label>
              <Textarea
                id="void-review-reason"
                value={reviewReason}
                maxLength={VOID_REASON_MAX_LENGTH}
                onChange={(event) => { setReviewReason(event.target.value); setReasonError(""); clearFeedback(); }}
                disabled={actionsBlocked}
                aria-invalid={Boolean(reasonError)}
                aria-describedby={reasonError ? "void-review-error" : undefined}
                className="min-h-28 resize-y rounded-[var(--app-radius-nested)] border-[var(--app-color-border-subtle)] p-[var(--app-space-4)] text-[length:var(--app-font-size-body-secondary)] leading-[var(--app-line-height-body-secondary)]"
              />
              {reasonError && <p id="void-review-error" role="alert" className="text-[length:var(--app-font-size-caption)] text-[var(--app-color-danger)]">{reasonError}</p>}
              {!isOnline && <p role="status" className="text-[length:var(--app-font-size-caption)] text-[var(--app-color-text-muted)]">An internet connection is required to review.</p>}
            </div>
          )}
          <InlineFeedback feedback={feedback} id="void-review-feedback" />
        </div>
      </ActionAlertDialog>
      <BlockingFeedback open={isSubmitting || Boolean(confirmedDecision)} status={isRefreshError ? "error" : "loading"} title={loadingFeedback.title} message={loadingFeedback.message} action={blockingAction} />
    </>
  );
};

export default ReviewOrderVoidModal;
