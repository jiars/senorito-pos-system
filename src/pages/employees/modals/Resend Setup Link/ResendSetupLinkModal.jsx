import { useRef, useState } from "react";

import BlockingFeedback from "@/components/feedback/blocking/BlockingFeedback";
import InlineFeedback from "@/components/feedback/inline/InlineFeedback";
import ActionAlertDialog from "@/components/modals/ActionAlertDialog";
import { toast } from "@/components/ui/toast";
import { useFeedback } from "@/hooks/feedback/useFeedback";
import { useRefreshEmployeeManagement } from "@/hooks/useEmployeeManagement";
import { resendEmployeeSetupLink } from "@/services/employees/employeeAccountsService";
import {
  getSetupLinkErrorCode,
  getSetupLinkInlineFeedback,
  getSetupLinkStatusFeedback,
  getSetupLinkToastFeedback,
} from "@/utils/employees/feedback/setupLinkFeedback";

const ResendSetupLinkModal = ({
  employee, employees, cooldown, cooldownEndsAt, onCooldownStart, onClose,
}) => {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [confirmedResult, setConfirmedResult] = useState("");
  const [sendBlocked, setSendBlocked] = useState(false);
  const operationInFlight = useRef(false);
  const refreshEmployeeManagement = useRefreshEmployeeManagement();
  const { feedback, showFeedback, clearFeedback } = useFeedback(getSetupLinkInlineFeedback);
  const employeeName = `${employee.first_name || ""} ${employee.last_name || ""}`.trim()
    || employee.username || "Employee";

  const handleClose = () => {
    if (!operationInFlight.current && !confirmedResult) onClose();
  };

  // A successful send or already-complete result retries only the list refresh.
  const refreshCompletedRequest = async (resultCode) => {
    try {
      const result = await refreshEmployeeManagement();
      if (result && (result.isError || result.error)) return;
    } catch {
      return;
    }

    clearFeedback();
    toast.add(getSetupLinkToastFeedback(resultCode, { employeeName }));
    onClose();
  };

  const handleSend = async () => {
    if (operationInFlight.current || confirmedResult || sendBlocked) return;
    if (cooldownEndsAt > Date.now()) return;

    const currentEmployee = employees.find((item) => String(item.id) === String(employee.id));
    const roleName = currentEmployee?.role?.role_name || currentEmployee?.role_name || "";
    if (!currentEmployee || roleName.toLowerCase() === "owner"
      || !currentEmployee.requires_password_setup
      || String(currentEmployee.status || "Active").toLowerCase() !== "active") {
      showFeedback("NOT_ELIGIBLE");
      setSendBlocked(true);
      return;
    }

    operationInFlight.current = true;
    setIsSubmitting(true);
    clearFeedback();
    try {
      let resultCode = "SETUP_LINK_SENT";
      try {
        const response = await resendEmployeeSetupLink(employee.id);
        const retryAfter = Number(response.retry_after);
        let cooldownSeconds = 60;
        if (Number.isFinite(retryAfter) && retryAfter > 0) cooldownSeconds = retryAfter;
        onCooldownStart(employee.id, cooldownSeconds);
      } catch (error) {
        const code = getSetupLinkErrorCode(error);
        const retryAfter = Number(error.response?.data?.retry_after);
        if (Number.isFinite(retryAfter) && retryAfter > 0) {
          onCooldownStart(employee.id, retryAfter);
        } else if (code === "RATE_LIMITED") {
          onCooldownStart(employee.id, 60);
        }

        if (code !== "SETUP_ALREADY_COMPLETE") {
          showFeedback(code);
          if (code === "SEND_UNCONFIRMED") setSendBlocked(true);
          return;
        }
        resultCode = code;
      }

      setConfirmedResult(resultCode);
      await refreshCompletedRequest(resultCode);
    } finally {
      operationInFlight.current = false;
      setIsSubmitting(false);
    }
  };

  const handleRetryRefresh = async () => {
    if (operationInFlight.current || !confirmedResult) return;
    operationInFlight.current = true;
    setIsSubmitting(true);
    try {
      await refreshCompletedRequest(confirmedResult);
    } finally {
      operationInFlight.current = false;
      setIsSubmitting(false);
    }
  };

  const isRefreshError = Boolean(confirmedResult) && !isSubmitting;
  let statusCode = "SETUP_LINK_SENDING";
  if (confirmedResult) statusCode = "EMPLOYEES_REFRESHING";
  if (isRefreshError) statusCode = "EMPLOYEES_REFRESH_FAILED";
  const statusFeedback = getSetupLinkStatusFeedback(statusCode);
  let blockingAction;
  if (isRefreshError) {
    blockingAction = { label: statusFeedback.buttonLabel, onClick: handleRetryRefresh };
  }
  let sendLabel = "Send Setup Link";
  if (cooldown > 0) sendLabel = `Send Again in ${cooldown}s`;

  return (
    <>
      <ActionAlertDialog
        open={!isSubmitting && !confirmedResult}
        onOpenChange={(open) => { if (!open) handleClose(); }}
        type="small-media"
        title="Resend Setup Link"
        description={<>Send a password setup link to <span className="font-semibold text-[var(--app-color-text)]">{employeeName}</span>?</>}
        iconClassName="bi bi-envelope-arrow-up"
        actions={[
          { key: "cancel", label: "Cancel", tone: "secondary", close: true },
          { key: "send", label: sendLabel, tone: "success", onClick: handleSend, disabled: sendBlocked || cooldown > 0 },
        ]}
      >
        <InlineFeedback feedback={feedback} id="employee-setup-link-feedback" />
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

export default ResendSetupLinkModal;
