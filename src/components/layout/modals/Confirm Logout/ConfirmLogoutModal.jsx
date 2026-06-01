import React from 'react';
import './confirmLogoutModal.css';

const ConfirmLogoutModal = ({ isOpen, onClose, onConfirm }) => {
  if (!isOpen) return null;

  return (
    <div className="clm-modal-overlay">
      <div className="clm-modal-content">
        {/* Header */}
        <div className="clm-modal-header">
          <div className="clm-header-icon">
            <i className="bi bi-box-arrow-left"></i>
          </div>
          <h3>Confirm Logout</h3>
          <span className="clm-modal-subtitle">Señorito Café POS</span>
          <button className="clm-modal-close" onClick={onClose} aria-label="Close">
            <i className="bi bi-x"></i>
          </button>
        </div>

        {/* Body */}
        <div className="clm-modal-body">
          {/* High-visibility Warning Box */}
          <div className="clm-warning-box">
            <i className="bi bi-exclamation-triangle-fill clm-warning-icon"></i>
            <p className="clm-warning-text">
              <strong>Are you sure you want to log out?</strong> You will be returned to the login screen and will need to enter your credentials to access the system again.
            </p>
          </div>
        </div>

        {/* Footer */}
        <div className="clm-modal-footer">
          <button className="clm-btn-cancel" onClick={onClose}>
            Cancel
          </button>
          <button className="clm-btn-confirm" onClick={onConfirm}>
            <i className="bi bi-box-arrow-left"></i>
            Logout
          </button>
        </div>
      </div>
    </div>
  );
};

export default ConfirmLogoutModal;
