import React from 'react';

const ArchiveItemHeader = ({ itemName, onClose, isSubmitting }) => (
  <div className="archive-modal-header">
    <div className="archive-header-icon">
      <i className="bi bi-archive-fill" />
    </div>
    <h3>Archive Item</h3>
    <span className="archive-modal-subtitle">{itemName}</span>
    <button
      type="button"
      className="archive-modal-close"
      onClick={onClose}
      aria-label="Close"
      disabled={isSubmitting}
    >
      <i className="bi bi-x" />
    </button>
  </div>
);

export default ArchiveItemHeader;
