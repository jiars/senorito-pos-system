import React from "react";

const EditExpenseHeader = ({ onClose, isSubmitting }) => (
  <div className="expense-modal-header">
    <h3>Edit Expense</h3>
    <button
      className="expense-modal-close"
      onClick={onClose}
      title="Close"
      disabled={isSubmitting}
    >
      <i className="bi bi-x" />
    </button>
  </div>
);

export default EditExpenseHeader;
