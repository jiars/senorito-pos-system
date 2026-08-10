import React, { useState } from 'react';
import './confirmDeleteExpenseModal.css';
import { deleteExpense } from '../../../services/expenses/expenseService';
import { formatCurrency } from '../../../utils/currencyFormatters';

const ConfirmDeleteExpenseModal = ({ isOpen, onClose, expense, refetch }) => {
  const [isDeleting, setIsDeleting] = useState(false);
  const [error, setError] = useState(null);

  if (!isOpen || !expense) return null;

  const handleDelete = async () => {
    try {
      setIsDeleting(true);
      setError(null);
      await deleteExpense(expense.id);
      await refetch();
      onClose();
    } catch (err) {
      setError(err.message);
    } finally {
      setIsDeleting(false);
    }
  };

  return (
    <div className="cde-modal-overlay">
      <div className="cde-modal-content">
        {/* Header */}
        <div className="cde-modal-header">
          <div className="cde-header-icon">
            <i className="bi bi-trash3-fill"></i>
          </div>
          <h3>Confirm Delete</h3>
          <span className="cde-modal-subtitle">{expense.description || 'Expense Record'}</span>
          <button className="cde-modal-close" onClick={onClose} aria-label="Close" disabled={isDeleting}>
            <i className="bi bi-x"></i>
          </button>
        </div>

        {/* Body */}
        <div className="cde-modal-body">
          {error && <div style={{ color: 'red', marginBottom: '1rem', fontSize: '0.875rem' }}>{error}</div>}

          {/* Stat Cards */}
          <div className="cde-stats-grid">
            <div className="cde-stat-card">
              <div className="cde-stat-icon">
                <i className="bi bi-tag-fill"></i>
              </div>
              <div className="cde-stat-details">
                <span className="cde-stat-label">Category</span>
                <span className="cde-stat-value">{expense.expense_categories?.category_name || 'N/A'}</span>
              </div>
            </div>
            <div className="cde-stat-card">
              <div className="cde-stat-icon cde-stat-icon--alt">
                <i className="bi bi-cash-stack"></i>
              </div>
              <div className="cde-stat-details">
                <span className="cde-stat-label">Amount</span>
                <span className="cde-stat-value">{formatCurrency(expense.amount)}</span>
              </div>
            </div>
          </div>

          <hr className="cde-divider" />

          {/* Warning Box */}
          <div className="cde-warning-box">
            <i className="bi bi-exclamation-triangle-fill cde-warning-icon"></i>
            <p className="cde-warning-text">
              <strong>Delete this expense record?</strong> This action cannot be undone. This expense will be permanently removed from your records.
            </p>
          </div>
        </div>

        {/* Footer */}
        <div className="cde-modal-footer">
          <button className="cde-btn-cancel" onClick={onClose} disabled={isDeleting}>
            Cancel
          </button>
          <button className="cde-btn-confirm" onClick={handleDelete} disabled={isDeleting}>
            <i className="bi bi-trash"></i>
            {isDeleting ? 'Deleting...' : 'Confirm'}
          </button>
        </div>
      </div>
    </div>
  );
};

export default ConfirmDeleteExpenseModal;
