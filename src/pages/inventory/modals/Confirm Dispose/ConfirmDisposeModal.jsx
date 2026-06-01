import React from 'react';
import './confirmDisposeModal.css';

const ConfirmDisposeModal = ({ isOpen, onClose, itemName, batchName }) => {
  if (!isOpen) return null;

  const handleConfirm = () => {
    console.log(`Disposing batch: ${batchName} from ${itemName}`);
    onClose();
  };

  return (
    <div className="dispose-modal-overlay">
      <div className="dispose-modal-content">
        <div className="dispose-modal-header">
          <div className="dispose-header-icon">
            <i className="bi bi-trash"></i>
          </div>
          <h3>Confirm Dispose</h3>
          <span className="dispose-modal-subtitle">{itemName} - {batchName}</span>
          <button className="dispose-modal-close" onClick={onClose} aria-label="Close">
            <i className="bi bi-x"></i>
          </button>
        </div>

        <div className="dispose-modal-body">
          <p className="dispose-message">
            Dispose this batch? This action cannot be undone.
          </p>

          <div className="dispose-warning-box">
            <i className="bi bi-info-circle-fill dispose-warning-icon"></i>
            <p className="dispose-warning-text">
              This will remove the selected batch from available inventory.
            </p>
          </div>
        </div>

        <div className="dispose-modal-footer">
          <button className="dispose-btn-cancel" onClick={onClose}>
            Cancel
          </button>
          <button className="dispose-btn-confirm" onClick={handleConfirm}>
            Confirm
          </button>
        </div>
      </div>
    </div>
  );
};

export default ConfirmDisposeModal;
