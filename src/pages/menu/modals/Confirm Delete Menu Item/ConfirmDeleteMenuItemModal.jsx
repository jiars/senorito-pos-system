import React from 'react';
import './confirmDeleteMenuItemModal.css';

const ConfirmDeleteMenuItemModal = ({ isOpen, onClose, item }) => {
  if (!isOpen || !item) return null;

  const handleDelete = () => {
    console.log(`Deleting menu item: ${item.name} (ID: ${item.id})`);
    onClose();
  };

  return (
    <div className="cdm-modal-overlay">
      <div className="cdm-modal-content">
        {/* Header - Premium Redesign with Iconography */}
        <div className="cdm-modal-header">
          <div className="cdm-header-icon">
            <i className="bi bi-trash3-fill"></i>
          </div>
          <h3>Confirm Delete</h3>
          <span className="cdm-modal-subtitle">{item.name}</span>
          <button className="cdm-modal-close" onClick={onClose} aria-label="Close">
            <i className="bi bi-x"></i>
          </button>
        </div>

        {/* Body */}
        <div className="cdm-modal-body">
          
          {/* Premium Stat Cards */}
          <div className="cdm-stats-grid">
            <div className="cdm-stat-card">
              <div className="cdm-stat-icon">
                <i className="bi bi-tag-fill"></i>
              </div>
              <div className="cdm-stat-details">
                <span className="cdm-stat-label">Category</span>
                <span className="cdm-stat-value">{item.category || 'N/A'}</span>
              </div>
            </div>
            <div className="cdm-stat-card">
              <div className="cdm-stat-icon cdm-stat-icon--alt">
                <i className="bi bi-cash-stack"></i>
              </div>
              <div className="cdm-stat-details">
                <span className="cdm-stat-label">Price</span>
                <span className="cdm-stat-value">{item.price || 'N/A'}</span>
              </div>
            </div>
          </div>

          <hr className="cdm-divider" />

          {/* High-visibility Warning Box */}
          <div className="cdm-warning-box">
            <i className="bi bi-exclamation-triangle-fill cdm-warning-icon"></i>
            <p className="cdm-warning-text">
              <strong>Delete this menu item?</strong> This action cannot be undone. All variants, pricing, and recipe configurations associated with this item will be permanently removed.
            </p>
          </div>
        </div>

        {/* Footer */}
        <div className="cdm-modal-footer">
          <button className="cdm-btn-cancel" onClick={onClose}>
            Cancel
          </button>
          <button className="cdm-btn-confirm" onClick={handleDelete}>
            <i className="bi bi-trash"></i>
            Confirm
          </button>
        </div>
      </div>
    </div>
  );
};

export default ConfirmDeleteMenuItemModal;
