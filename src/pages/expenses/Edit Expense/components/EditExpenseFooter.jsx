const EditExpenseFooter = ({ onClose, onSave, isSubmitting }) => (
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
      {isSubmitting ? "Saving..." : "Save Changes"}
    </button>
  </div>
);

export default EditExpenseFooter;
