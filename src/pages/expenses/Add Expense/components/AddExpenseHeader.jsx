import React from "react";

const AddExpenseHeader = ({ onClose, isSubmitting }) => (
  <div className="expense-modal-header">
    <h3>Add Expense</h3>
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

export default AddExpenseHeader;
