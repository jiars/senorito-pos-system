import React from "react";

const ArchiveExpenseHeader = ({ description, onClose, isSubmitting }) => (
  <div className="cde-modal-header">
    <div className="cde-header-icon">
      <i className="bi bi-archive-fill" />
    </div>
    <h3>Confirm Archive</h3>
    <span className="cde-modal-subtitle">{description || "Expense Record"}</span>
    <button
      className="cde-modal-close"
      onClick={onClose}
      aria-label="Close"
      disabled={isSubmitting}
    >
      <i className="bi bi-x" />
    </button>
  </div>
);

export default ArchiveExpenseHeader;
