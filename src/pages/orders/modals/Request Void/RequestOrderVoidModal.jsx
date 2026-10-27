import { useRef, useState } from "react";
import ActionAlertDialog from "@/components/modals/ActionAlertDialog";
import BlockingFeedback from "@/components/feedback/blocking/BlockingFeedback";
import InlineFeedback from "@/components/feedback/inline/InlineFeedback";
import { Textarea } from "@/components/ui/textarea";
import { toast } from "@/components/ui/toast";
import { useFeedback } from "@/hooks/feedback/useFeedback";
import { useBrowserOnline } from "@/hooks/sync/useBrowserOnline";
import { requestOrderVoid } from "@/services/orders/orderVoidRequestsService";
import { formatCurrency } from "@/utils/shared/formatters/currencyFormatters";
import { canRequestOrderVoid, getOrderVoidDisabledReason } from "@/utils/orders/orderVoidUtils";
import { validateOrderVoidReason, VOID_REASON_MAX_LENGTH } from "@/utils/orders/validation/orderVoidRequestValidation";
import {
  getVoidRequestErrorCode, getVoidRequestInlineFeedback,
  getVoidRequestLoadingFeedback, getVoidRequestToastFeedback,
} from "@/utils/orders/feedback/orderVoidRequestFeedback";

const RequestOrderVoidModal = ({ order, userId, role, refetchOrderManagement, onClose }) => {
  const [reason, setReason] = useState("");
  const [reasonError, setReasonError] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [hasSaved, setHasSaved] = useState(false);
  const [actionsBlocked, setActionsBlocked] = useState(false);
  const operationInFlight = useRef(false);
  const alreadyRequested = useRef(false);
  const isOnline = useBrowserOnline();
  const { feedback, showFeedback, clearFeedback } = useFeedback(getVoidRequestInlineFeedback);

  const handleClose = () => {
    if (!operationInFlight.current && !hasSaved) onClose(actionsBlocked);
  };

  // Once saved, retries refresh the list only; they never repeat the POST.
  const refreshSavedRequest = async () => {
    try {
      const result = await refetchOrderManagement();
      if (result && (result.isError || result.error)) return;
    } catch {
      return;
    }
    toast.add(getVoidRequestToastFeedback(order.order_number, alreadyRequested.current));
    onClose(false);
  };

  const handleSubmit = async () => {
    if (operationInFlight.current || hasSaved || actionsBlocked || !isOnline) return;
    const validationError = validateOrderVoidReason(reason);
    setReasonError(validationError);
    if (validationError) return;
    if (!canRequestOrderVoid(order, userId, role)) {
      showFeedback("PERMISSION_DENIED");
      setActionsBlocked(true);
      return;
    }
    if (getOrderVoidDisabledReason(order)) {
      showFeedback("ORDER_CONFLICT");
      setActionsBlocked(true);
      return;
    }

    operationInFlight.current = true;
    setIsSubmitting(true);
    clearFeedback();
    try {
      try {
        const response = await requestOrderVoid(order.id, reason.trim());
        alreadyRequested.current = response.already_requested === true;
      } catch (error) {
        const code = getVoidRequestErrorCode(error);
        showFeedback(code);
        if (["SAVE_UNCONFIRMED", "ORDER_CONFLICT", "ORDER_NOT_FOUND", "PERMISSION_DENIED", "SESSION_EXPIRED"].includes(code)) {
          setActionsBlocked(true);
        }
        return;
      }
      setHasSaved(true);
      await refreshSavedRequest();
    } finally {
      operationInFlight.current = false;
      setIsSubmitting(false);
    }
  };

  const handleRetryRefresh = async () => {
    if (operationInFlight.current || !hasSaved) return;
    operationInFlight.current = true;
    setIsSubmitting(true);
    try {
      await refreshSavedRequest();
    } finally {
      operationInFlight.current = false;
      setIsSubmitting(false);
    }
  };

  const isRefreshError = hasSaved && !isSubmitting;
  let loadingCode = "SUBMITTING";
  if (hasSaved) loadingCode = "REFRESHING";
  if (isRefreshError) loadingCode = "REFRESH_FAILED";
  const loadingFeedback = getVoidRequestLoadingFeedback(loadingCode);
  let blockingAction;
  if (isRefreshError) blockingAction = { label: "Retry refresh", onClick: handleRetryRefresh };

  return (
    <>
      <ActionAlertDialog
        open={!isSubmitting && !hasSaved}
        onOpenChange={(open) => { if (!open) handleClose(); }}
        type="small-media"
        title="Request Order Void"
        iconClassName="bi bi-receipt"
        description={
          <>Request a void for <span className="font-semibold text-[var(--app-color-text)] [overflow-wrap:anywhere]">{order.order_number}</span> ({formatCurrency(order.total)})? Owner approval is required.</>
        }
        actions={[
          { key: "cancel", label: "Cancel", close: true, tone: "secondary" },
          { key: "submit", label: "Submit request", onClick: handleSubmit, disabled: actionsBlocked || !isOnline },
        ]}
      >
        <div className="flex min-w-0 flex-col gap-[var(--app-space-2)]">
          <label htmlFor="void-request-reason" className="text-[length:var(--app-font-size-body-secondary)] font-semibold text-[var(--app-color-text)]">
            Reason<span className="text-[var(--app-color-danger)]" aria-hidden="true">*</span>
          </label>
          <Textarea
            id="void-request-reason"
            value={reason}
            onChange={(event) => { setReason(event.target.value); setReasonError(""); clearFeedback(); }}
            required
            maxLength={VOID_REASON_MAX_LENGTH}
            aria-invalid={Boolean(reasonError)}
            aria-describedby={reasonError ? "void-request-guidance void-request-error" : "void-request-guidance"}
            disabled={actionsBlocked}
            className="min-h-28 resize-y rounded-[var(--app-radius-nested)] border-[var(--app-color-border-subtle)] bg-[var(--app-color-surface)] p-[var(--app-space-4)] text-[length:var(--app-font-size-body-secondary)] leading-[var(--app-line-height-body-secondary)]"
          />
          {reasonError && <p id="void-request-error" role="alert" className="text-[length:var(--app-font-size-caption)] text-[var(--app-color-danger)]">{reasonError}</p>}
          <p id="void-request-guidance" className="text-[length:var(--app-font-size-caption)] leading-[var(--app-line-height-caption)] text-[var(--app-color-text-muted)]">
            Up to 500 characters. This request does not change sales, issue a refund, or return stock.
          </p>
          {!isOnline && <p role="status" className="text-[length:var(--app-font-size-caption)] text-[var(--app-color-text-muted)]">An internet connection is required to submit.</p>}
          <InlineFeedback feedback={feedback} id="void-request-feedback" />
        </div>
      </ActionAlertDialog>
      <BlockingFeedback
        open={isSubmitting || hasSaved}
        status={isRefreshError ? "error" : "loading"}
        title={loadingFeedback.title}
        message={loadingFeedback.message}
        action={blockingAction}
      />
    </>
  );
};

export default RequestOrderVoidModal;
