import { useRef, useState } from "react";

import BlockingFeedback from "@/components/feedback/blocking/BlockingFeedback";
import InlineFeedback from "@/components/feedback/inline/InlineFeedback";
import ActionAlertDialog from "@/components/modals/ActionAlertDialog";
import { toast } from "@/components/ui/toast";
import { useFeedback } from "@/hooks/feedback/useFeedback";
import {
  approvePasswordResetRequest,
  cancelPasswordResetRequest,
  resendPasswordResetLink,
} from "@/services/employees/employeeAccountsService";
import {
  getPasswordRequestErrorCode,
  getPasswordRequestInlineFeedback,
  getPasswordRequestStatusFeedback,
  getPasswordRequestToastFeedback,
} from "@/utils/employees/feedback/passwordRequestFeedback";

const PasswordResetRequestModal = ({
  employee, request, refetchEmployeeManagement, onClose,
  cooldownEndsAt = 0, cooldownClock, onCooldownStart,
}) => {
  const [activeAction, setActiveAction] = useState("");
  const [confirmedResult, setConfirmedResult] = useState("");
  const [actionsBlocked, setActionsBlocked] = useState(false);
  const operationInFlight = useRef(false);
  const { feedback, showFeedback, clearFeedback } = useFeedback(getPasswordRequestInlineFeedback);
  const employeeName = `${employee.first_name || ""} ${employee.last_name || ""}`.trim()
    || employee.username || "Employee";
  const isPending = request.status === "pending";
  const isApproved = request.status === "approved";

  const handleClose = () => {
    if (!operationInFlight.current && !confirmedResult) onClose();
  };

  // Confirmed actions retry only the required read, never approval/cancel/resend.
  const refreshCompletedRequest = async (resultCode) => {
    try {
      const result = await refetchEmployeeManagement();
      if (result && (result.isError || result.error)) return;
    } catch {
      return;
    }

    clearFeedback();
    toast.add(getPasswordRequestToastFeedback(resultCode, { employeeName }));
    onClose();
  };

  const handleAction = async (action) => {
    if (operationInFlight.current || confirmedResult || actionsBlocked) return;
    if ((action === "resend" && !isApproved) || (action !== "resend" && !isPending)) return;
    if (action === "resend" && cooldownEndsAt > Date.now()) return;

    const expiration = action === "resend" ? request.approval_expires_at : request.request_expires_at;
    if (expiration && new Date(expiration).getTime() <= Date.now()) {
      showFeedback("REQUEST_CONFLICT");
      setActionsBlocked(true);
      return;
    }

    operationInFlight.current = true;
    setActiveAction(action);
    clearFeedback();
    try {
      let resultCode;
      try {
        if (action === "approve") {
          const response = await approvePasswordResetRequest(request.id);
          resultCode = "REQUEST_APPROVED";
          if (response.email_sent !== true) resultCode = "REQUEST_APPROVED_EMAIL_FAILED";
        } else if (action === "cancel") {
          await cancelPasswordResetRequest(request.id);
          resultCode = "REQUEST_CANCELLED";
        } else {
          const response = await resendPasswordResetLink(request.id);
          const retryAfter = Number(response.retry_after);
          let cooldownSeconds = 60;
          if (Number.isFinite(retryAfter) && retryAfter > 0) cooldownSeconds = retryAfter;
          onCooldownStart(request.id, cooldownSeconds);
          resultCode = "RESET_LINK_SENT";
        }
      } catch (error) {
        const code = getPasswordRequestErrorCode(error);
        if (action === "resend" && code === "RATE_LIMITED") {
          let cooldownSeconds = 60;
          if (error.response && error.response.data) {
            const retryAfter = Number(error.response.data.retry_after);
            if (Number.isFinite(retryAfter) && retryAfter > 0) cooldownSeconds = retryAfter;
          }
          onCooldownStart(request.id, cooldownSeconds);
        }
        showFeedback(code);
        if (code === "SAVE_UNCONFIRMED" || code === "REQUEST_CONFLICT") {
          setActionsBlocked(true);
        }
        return;
      }

      setConfirmedResult(resultCode);
      await refreshCompletedRequest(resultCode);
    } finally {
      operationInFlight.current = false;
      setActiveAction("");
    }
  };

  const handleRetryRefresh = async () => {
    if (operationInFlight.current || !confirmedResult) return;
    operationInFlight.current = true;
    setActiveAction("refresh");
    try {
      await refreshCompletedRequest(confirmedResult);
    } finally {
      operationInFlight.current = false;
      setActiveAction("");
    }
  };

  const isSubmitting = Boolean(activeAction);
  const isRefreshError = Boolean(confirmedResult) && !isSubmitting;
  let statusCode = "REQUEST_APPROVING";
  if (activeAction === "cancel") statusCode = "REQUEST_CANCELLING";
  if (activeAction === "resend") statusCode = "RESET_LINK_SENDING";
  if (confirmedResult) statusCode = "EMPLOYEES_REFRESHING";
  if (isRefreshError) statusCode = "EMPLOYEES_REFRESH_FAILED";
  const statusFeedback = getPasswordRequestStatusFeedback(statusCode);
  let blockingAction;
  if (isRefreshError) {
    blockingAction = { label: statusFeedback.buttonLabel, onClick: handleRetryRefresh };
  }

  const actions = [];
  const cooldown = Math.max(0, Math.ceil((cooldownEndsAt - cooldownClock) / 1000));
  let resendLabel = "Resend Link";
  if (cooldown > 0) resendLabel = `Send Again in ${cooldown}s`;
  if (isPending) {
    actions.push(
      { key: "cancel-request", label: "Cancel Request", tone: "secondary", onClick: () => handleAction("cancel"), disabled: actionsBlocked },
      { key: "approve", label: "Approve Request", tone: "success", onClick: () => handleAction("approve"), disabled: actionsBlocked },
    );
  } else if (isApproved) {
    actions.push({ key: "resend", label: resendLabel, tone: "success", onClick: () => handleAction("resend"), disabled: actionsBlocked || cooldown > 0 });
  }
  if (!isPending) actions.unshift({ key: "close", label: "Close", close: true });

  return (
    <>
      <ActionAlertDialog
        open={!isSubmitting && !confirmedResult}
        onOpenChange={(open) => { if (!open) handleClose(); }}
        type="small-media"
        title={isPending ? "Review Password Request" : "Password Reset Request"}
        description={
          <>
            {isPending ? (
              <>Approve <span className="font-semibold text-[var(--app-color-text)]">{employeeName}</span>'s reset request? Send link to </>
            ) : (
              <>Resend <span className="font-semibold text-[var(--app-color-text)]">{employeeName}</span>'s reset link to </>
            )}
            <span className="font-semibold text-[var(--app-color-text)] [overflow-wrap:anywhere]">{employee.email || "Not available"}</span>.
          </>
        }
        iconClassName="bi bi-key"
        showCloseButton={isPending}
        actions={actions}
      >
        <InlineFeedback feedback={feedback} id="employee-password-request-feedback" />
      </ActionAlertDialog>
      <BlockingFeedback
        open={isSubmitting || Boolean(confirmedResult)}
        status={isRefreshError ? "error" : "loading"}
        title={statusFeedback.title}
        message={statusFeedback.message}
        action={blockingAction}
      />
    </>
  );
};

export default PasswordResetRequestModal;
