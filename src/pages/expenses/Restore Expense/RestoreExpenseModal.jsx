import { useRef, useState } from "react";
import ActionAlertDialog from "@/components/modals/ActionAlertDialog";
import BlockingFeedback from "@/components/feedback/blocking/BlockingFeedback";
import InlineFeedback from "@/components/feedback/inline/InlineFeedback";
import { toast } from "@/components/ui/toast";
import { useFeedback } from "@/hooks/feedback/useFeedback";
import { unarchiveExpense } from "@/services/expenses/expenseService";
import { formatCurrency } from "@/utils/shared/formatters/currencyFormatters";
import {
  getRestoreExpenseErrorCode, getRestoreExpenseInlineFeedback,
  getRestoreExpenseStatusFeedback, getRestoreExpenseToastFeedback,
} from "@/utils/expenses/feedback/restoreExpenseFeedback";

const RestoreExpenseModalContent = ({ expense, onClose, refetch }) => {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [hasSaved, setHasSaved] = useState(false);
  const [saveBlocked, setSaveBlocked] = useState(false);
  const operationInFlight = useRef(false);
  const { feedback, showFeedback, clearFeedback } = useFeedback(getRestoreExpenseInlineFeedback);

  const handleClose = () => {
    if (!operationInFlight.current && !hasSaved) onClose();
  };
  const handleOpenChange = (open) => {
    if (!open) handleClose();
  };

  // Retry freshness only after the restore has already been confirmed.
  const refreshSavedExpense = async () => {
    try {
      const result = await refetch();
      if (result && (result.isError || result.error)) return;
    } catch {
      return;
    }
    toast.add(getRestoreExpenseToastFeedback(expense.description));
    onClose();
  };

  const handleRestore = async () => {
    if (operationInFlight.current || hasSaved || saveBlocked) return;
    operationInFlight.current = true;
    setIsSubmitting(true);
    clearFeedback();
    try {
      try {
        await unarchiveExpense(expense.id);
      } catch (error) {
        const code = getRestoreExpenseErrorCode(error);
        showFeedback(code);
        if (code === "RESTORE_UNCONFIRMED" || code === "RECORD_CONFLICT") setSaveBlocked(true);
        return;
      }
      setHasSaved(true);
      await refreshSavedExpense();
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
      await refreshSavedExpense();
    } finally {
      operationInFlight.current = false;
      setIsSubmitting(false);
    }
  };

  const isRefreshError = hasSaved && !isSubmitting;
  let statusCode = "EXPENSE_RESTORING";
  if (hasSaved) statusCode = "EXPENSES_REFRESHING";
  if (isRefreshError) statusCode = "EXPENSES_REFRESH_FAILED";
  const statusFeedback = getRestoreExpenseStatusFeedback(statusCode);
  let blockingAction;
  if (isRefreshError) blockingAction = { label: statusFeedback.buttonLabel, onClick: handleRetryRefresh };

  return (
    <>
      <ActionAlertDialog
        open={!isSubmitting && !hasSaved}
        onOpenChange={handleOpenChange}
        type="small-media"
        iconClassName="bi bi-box-arrow-up"
        title="Restore expense?"
        description={
          <>Restore <span className="font-semibold text-[var(--app-color-text)] [overflow-wrap:anywhere]">{expense.description}</span> worth <span className="font-semibold text-[var(--app-color-text)]">{formatCurrency(expense.amount)}</span>? It will return to the active expense list.</>
        }
        actions={[
          { key: "cancel", label: "Cancel", close: true },
          { key: "restore", label: "Restore", tone: "success", onClick: handleRestore, disabled: isSubmitting || saveBlocked },
        ]}
      >
        <InlineFeedback feedback={feedback} id="restore-expense-feedback" />
      </ActionAlertDialog>
      <BlockingFeedback
        open={isSubmitting || hasSaved}
        status={isRefreshError ? "error" : "loading"}
        title={statusFeedback.title}
        message={statusFeedback.message}
        action={blockingAction}
      />
    </>
  );
};

const RestoreExpenseModal = ({ isOpen, expense, onClose, refetch }) => {
  if (!isOpen || !expense) return null;
  return <RestoreExpenseModalContent key={expense.id} expense={expense} onClose={onClose} refetch={refetch} />;
};
export default RestoreExpenseModal;
