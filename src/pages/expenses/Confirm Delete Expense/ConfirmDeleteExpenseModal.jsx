import React, { useState } from "react";
import { archiveExpense } from "../../../services/expenses/expenseService";
import ArchiveExpenseFooter from "./components/ArchiveExpenseFooter";
import ArchiveExpenseHeader from "./components/ArchiveExpenseHeader";
import ArchiveExpenseSummary from "./components/ArchiveExpenseSummary";
import "./confirmDeleteExpenseModal.css";

const ConfirmDeleteExpenseModal = ({
  isOpen,
  onClose,
  expense,
  refetch,
}) => {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState("");

  if (!isOpen || !expense) return null;

  const handleArchive = async () => {
    if (isSubmitting) return;

    try {
      setIsSubmitting(true);
      setError("");
      await archiveExpense(expense.id);
      await refetch();
      onClose();
    } catch (requestError) {
      setError(requestError.message);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="cde-modal-overlay">
      <div className="cde-modal-content">
        <ArchiveExpenseHeader
          description={expense.description}
          onClose={onClose}
          isSubmitting={isSubmitting}
        />

        <div className="cde-modal-body">
          {error && <p className="expense-modal-error-msg">{error}</p>}
          <ArchiveExpenseSummary expense={expense} />
          <hr className="cde-divider" />
          <div className="cde-warning-box">
            <i className="bi bi-exclamation-triangle-fill cde-warning-icon" />
            <p className="cde-warning-text">
              <strong>Archive this expense record?</strong> It will be hidden
              from the active list but kept in your records.
            </p>
          </div>
        </div>

        <ArchiveExpenseFooter
          onClose={onClose}
          onArchive={handleArchive}
          isSubmitting={isSubmitting}
        />
      </div>
    </div>
  );
};

export default ConfirmDeleteExpenseModal;
