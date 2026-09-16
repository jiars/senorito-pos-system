import React from "react";

const AddExpenseFooter = ({ onClose, onSave, isSubmitting }) => (
  <div className="expense-modal-footer">
    <button
      className="expense-modal-btn-cancel"
      onClick={onClose}
      disabled={isSubmitting}
    >
      Cancel
    </button>
    <button
      className="expense-modal-btn-save"
      onClick={onSave}
      disabled={isSubmitting}
    >
      {isSubmitting ? "Saving..." : "Save Expense"}
    </button>
  </div>
);

export default AddExpenseFooter;
