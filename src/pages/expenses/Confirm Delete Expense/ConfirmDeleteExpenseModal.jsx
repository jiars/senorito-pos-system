import React from 'react';
import './confirmDeleteExpenseModal.css';

const ConfirmDeleteExpenseModal = ({ isOpen, onClose, expense }) => {
  if (!isOpen || !expense) return null;

  const handleDelete = () => {
    console.log(`Deleting expense: ${expense.description} (ID: ${expense.id})`);
    onClose();
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
          <button className="cde-modal-close" onClick={onClose} aria-label="Close">
            <i className="bi bi-x"></i>
          </button>
        </div>

        {/* Body */}
        <div className="cde-modal-body">

          {/* Stat Cards */}
          <div className="cde-stats-grid">
            <div className="cde-stat-card">
              <div className="cde-stat-icon">
                <i className="bi bi-tag-fill"></i>
              </div>
              <div className="cde-stat-details">
                <span className="cde-stat-label">Category</span>
                <span className="cde-stat-value">{expense.category || 'N/A'}</span>
              </div>
            </div>
            <div className="cde-stat-card">
              <div className="cde-stat-icon cde-stat-icon--alt">
                <i className="bi bi-cash-stack"></i>
              </div>
              <div className="cde-stat-details">
                <span className="cde-stat-label">Amount</span>
                <span className="cde-stat-value">{expense.amount || 'N/A'}</span>
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
          <button className="cde-btn-cancel" onClick={onClose}>
            Cancel
          </button>
          <button className="cde-btn-confirm" onClick={handleDelete}>
            <i className="bi bi-trash"></i>
            Confirm
          </button>
        </div>
      </div>
    </div>
  );
};

export default ConfirmDeleteExpenseModal;
