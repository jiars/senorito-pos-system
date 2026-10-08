import { useRef, useState } from "react";
import ActionAlertDialog from "@/components/modals/ActionAlertDialog";
import BlockingFeedback from "@/components/feedback/blocking/BlockingFeedback";
import InlineFeedback from "@/components/feedback/inline/InlineFeedback";
import { toast } from "@/components/ui/toast";
import { useFeedback } from "@/hooks/feedback/useFeedback";
import { archiveExpense } from "@/services/expenses/expenseService";
import { formatCurrency } from "@/utils/shared/formatters/currencyFormatters";
import {
  getArchiveExpenseErrorCode, getArchiveExpenseInlineFeedback,
  getArchiveExpenseStatusFeedback, getArchiveExpenseToastFeedback,
} from "@/utils/expenses/feedback/archiveExpenseFeedback";

const ArchiveExpenseModalContent = ({ expense, onClose, refetch }) => {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [hasSaved, setHasSaved] = useState(false);
  const [saveBlocked, setSaveBlocked] = useState(false);
  const operationInFlight = useRef(false);
  const { feedback, showFeedback, clearFeedback } = useFeedback(getArchiveExpenseInlineFeedback);

  const handleClose = () => {
    if (!operationInFlight.current && !hasSaved) onClose();
  };
  const handleOpenChange = (open) => {
    if (!open) handleClose();
  };

  // Retry freshness only after the archive has already been confirmed.
  const refreshSavedExpense = async () => {
    try {
      const result = await refetch();
      if (result && (result.isError || result.error)) return;
    } catch {
      return;
    }
    toast.add(getArchiveExpenseToastFeedback(expense.description));
    onClose();
  };

  const handleArchive = async () => {
    if (operationInFlight.current || hasSaved || saveBlocked) return;
    operationInFlight.current = true;
    setIsSubmitting(true);
    clearFeedback();
    try {
      try {
        await archiveExpense(expense.id);
      } catch (error) {
        const code = getArchiveExpenseErrorCode(error);
        showFeedback(code);
        if (code === "ARCHIVE_UNCONFIRMED" || code === "RECORD_CONFLICT") setSaveBlocked(true);
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
  let statusCode = "EXPENSE_ARCHIVING";
  if (hasSaved) statusCode = "EXPENSES_REFRESHING";
  if (isRefreshError) statusCode = "EXPENSES_REFRESH_FAILED";
  const statusFeedback = getArchiveExpenseStatusFeedback(statusCode);
  let blockingAction;
  if (isRefreshError) blockingAction = { label: statusFeedback.buttonLabel, onClick: handleRetryRefresh };

  return (
    <>
      <ActionAlertDialog
        open={!isSubmitting && !hasSaved}
        onOpenChange={handleOpenChange}
        type="destructive"
        iconClassName="bi bi-archive"
        title="Archive expense?"
        description={
          <>Archive <span className="font-semibold text-[var(--app-color-text)] [overflow-wrap:anywhere]">{expense.description}</span> worth <span className="font-semibold text-[var(--app-color-text)]">{formatCurrency(expense.amount)}</span>? It will leave the active list but remain in your records.</>
        }
        actions={[
          { key: "cancel", label: "Cancel", close: true },
          { key: "archive", label: "Archive", tone: "danger", onClick: handleArchive, disabled: isSubmitting || saveBlocked },
        ]}
      >
        <InlineFeedback feedback={feedback} id="archive-expense-feedback" />
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

const ArchiveExpenseModal = ({ isOpen, expense, onClose, refetch }) => {
  if (!isOpen || !expense) return null;
  return <ArchiveExpenseModalContent key={expense.id} expense={expense} onClose={onClose} refetch={refetch} />;
};
export default ArchiveExpenseModal;
