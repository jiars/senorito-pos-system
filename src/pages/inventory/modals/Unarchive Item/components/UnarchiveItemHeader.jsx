import React from 'react';

const UnarchiveItemHeader = ({ itemName, onClose, isSubmitting }) => (
  <div className="unarchive-modal-header">
    <div className="unarchive-header-icon">
      <i className="bi bi-box-arrow-up" />
    </div>
    <h3>Unarchive Item</h3>
    <span className="unarchive-modal-subtitle">{itemName}</span>
    <button
      type="button"
      className="unarchive-modal-close"
      onClick={onClose}
      aria-label="Close"
      disabled={isSubmitting}
    >
      <i className="bi bi-x" />
    </button>
  </div>
);

export default UnarchiveItemHeader;
