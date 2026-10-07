import { useRef, useState } from "react";

import BlockingFeedback from "@/components/feedback/blocking/BlockingFeedback";
import InlineFeedback from "@/components/feedback/inline/InlineFeedback";
import ActionAlertDialog from "@/components/modals/ActionAlertDialog";
import { toast } from "@/components/ui/toast";
import { useFeedback } from "@/hooks/feedback/useFeedback";
import { deactivateEmployee, reactivateEmployee } from "@/services/employees/employeeAccountsService";
import {
  getEmployeeStatusInlineFeedback,
  getEmployeeStatusLoadingFeedback,
  getEmployeeStatusSaveErrorCode,
  getEmployeeStatusToastFeedback,
} from "@/utils/employees/feedback/employeeStatusFeedback";

const EmployeeStatusModal = ({ employee, nextStatus, refetchEmployeeManagement, onClose }) => {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [hasSaved, setHasSaved] = useState(false);
  const [hasUnconfirmedSave, setHasUnconfirmedSave] = useState(false);
  const operationInFlight = useRef(false);
  const { feedback, showFeedback, clearFeedback } = useFeedback(getEmployeeStatusInlineFeedback);
  const isDeactivating = nextStatus === "Deactivated";
  const employeeName = `${employee.first_name || ""} ${employee.last_name || ""}`.trim()
    || employee.username || "Employee";

  const handleClose = () => {
    if (!operationInFlight.current && !hasSaved) onClose();
  };

  // Once the write succeeds, recovery repeats only the employee-list read.
  const refreshSavedEmployees = async () => {
    try {
      const result = await refetchEmployeeManagement();
      if (result && (result.isError || result.error)) return;
    } catch {
      return;
    }

    clearFeedback();
    let code = "EMPLOYEE_REACTIVATED";
    if (isDeactivating) code = "EMPLOYEE_DEACTIVATED";
    toast.add(getEmployeeStatusToastFeedback(code, { employeeName }));
    onClose();
  };

  const handleConfirm = async () => {
    if (operationInFlight.current || hasSaved || hasUnconfirmedSave) return;
    operationInFlight.current = true;
    setIsSubmitting(true);
    clearFeedback();

    try {
      try {
        let updateStatus = reactivateEmployee;
        if (isDeactivating) updateStatus = deactivateEmployee;
        await updateStatus(employee.id);
      } catch (error) {
        const code = getEmployeeStatusSaveErrorCode(error);
        showFeedback(code);
        if (code === "SAVE_UNCONFIRMED" || code === "STATUS_CONFLICT") {
          setHasUnconfirmedSave(true);
        }
        return;
      }

      setHasSaved(true);
      await refreshSavedEmployees();
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
      await refreshSavedEmployees();
    } finally {
      operationInFlight.current = false;
      setIsSubmitting(false);
    }
  };

  const isRefreshError = hasSaved && !isSubmitting;
  let loadingCode = "REACTIVATING";
  if (isDeactivating) loadingCode = "DEACTIVATING";
  if (hasSaved) loadingCode = "EMPLOYEES_REFRESHING";
  if (isRefreshError) loadingCode = "EMPLOYEES_REFRESH_FAILED";
  const loadingFeedback = getEmployeeStatusLoadingFeedback(loadingCode);
  let blockingAction;
  if (isRefreshError) {
    blockingAction = { label: loadingFeedback.buttonLabel, onClick: handleRetryRefresh };
  }

  return (
    <>
      <ActionAlertDialog
        open={!isSubmitting && !hasSaved}
        onOpenChange={(open) => { if (!open) handleClose(); }}
        type={isDeactivating ? "destructive" : "small-media"}
        title={isDeactivating ? "Deactivate Account?" : "Reactivate Account?"}
        iconClassName={isDeactivating ? "bi bi-person-x" : "bi bi-person-check"}
        description={isDeactivating ? (
          <>Deactivate <span className="font-semibold text-[var(--app-color-text)]">{employeeName}</span>? This account can be reactivated later.</>
        ) : (
          <>Reactivate <span className="font-semibold text-[var(--app-color-text)]">{employeeName}</span> and restore account access?</>
        )}
        actions={[
          { key: "cancel", label: "Cancel", tone: "secondary", close: true },
          {
            key: "confirm", label: isDeactivating ? "Deactivate" : "Reactivate",
            tone: isDeactivating ? "danger" : "success",
            onClick: handleConfirm, disabled: hasUnconfirmedSave,
          },
        ]}
      >
        <InlineFeedback feedback={feedback} id="employee-status-feedback" />
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

export default EmployeeStatusModal;
