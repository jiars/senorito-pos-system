import React from "react";

const ArchiveExpenseFooter = ({ onClose, onArchive, isSubmitting }) => (
  <div className="cde-modal-footer">
    <button className="cde-btn-cancel" onClick={onClose} disabled={isSubmitting}>
      Cancel
    </button>
    <button
      className="cde-btn-confirm"
      onClick={onArchive}
      disabled={isSubmitting}
    >
      <i className="bi bi-archive" />
      {isSubmitting ? "Archiving..." : "Archive"}
    </button>
  </div>
);

export default ArchiveExpenseFooter;
