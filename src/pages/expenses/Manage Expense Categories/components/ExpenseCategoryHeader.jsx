const ExpenseCategoryHeader = ({ onClose, isSubmitting }) => (
  <div className="ec-modal-header">
    <h3>Manage Expense Categories</h3>
    <button
      className="ec-modal-close"
      onClick={onClose}
      title="Close"
      disabled={isSubmitting}
    >
      <i className="bi bi-x" />
    </button>
  </div>
);

export default ExpenseCategoryHeader;
