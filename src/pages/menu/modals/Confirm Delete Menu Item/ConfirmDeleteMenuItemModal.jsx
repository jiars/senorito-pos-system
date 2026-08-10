import React, { useState } from 'react';

import { archiveMenuItem } from '../../../../services/menu/menuItemsService';

import { formatCurrency } from '../../../../utils/currencyFormatters';

import './confirmDeleteMenuItemModal.css';

const ConfirmDeleteMenuItemModal = ({ isOpen, onClose, item, refetchMenu }) => {
  const [isSubmitting, setIsSubmitting] = useState(false);

  if (!isOpen || !item) return null;

  const handleDelete = async () => {
    if (isSubmitting) return;
    setIsSubmitting(true);
    try {
      await archiveMenuItem(item.id);
      if (refetchMenu) {
        await refetchMenu();
      }
      onClose();
    } catch (error) {
      alert('Failed to archive item: ' + error.message);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="cdm-modal-overlay">
      <div className="cdm-modal-content">
        {/* Header */}
        <div className="cdm-modal-header">
          <div className="cdm-header-icon">
            <i className="bi bi-trash3-fill"></i>
          </div>
          <h3>Confirm Delete</h3>
          <span className="cdm-modal-subtitle">{item.item_name}</span>
          <button className="cdm-modal-close" onClick={onClose} aria-label="Close">
            <i className="bi bi-x"></i>
          </button>
        </div>

        {/* Body */}
        <div className="cdm-modal-body">
          <div className="cdm-stats-grid">
            <div className="cdm-stat-card">
              <div className="cdm-stat-icon">
                <i className="bi bi-tag-fill"></i>
              </div>
              <div className="cdm-stat-details">
                <span className="cdm-stat-label">Category</span>
                <span className="cdm-stat-value">{item.category?.category_name || 'N/A'}</span>
              </div>
            </div>
            <div className="cdm-stat-card">
              <div className="cdm-stat-icon cdm-stat-icon--alt">
                <i className="bi bi-cash-stack"></i>
              </div>
              <div className="cdm-stat-details">
                <span className="cdm-stat-label">Price</span>
                <span className="cdm-stat-value">
                  {item.prices && item.prices.length > 0
                    ? formatCurrency(item.prices[0].selling_price)
                    : 'N/A'}
                </span>
              </div>
            </div>
          </div>

          <hr className="cdm-divider" />

          {/* Warning Box */}
          <div className="cdm-warning-box">
            <i className="bi bi-exclamation-triangle-fill cdm-warning-icon"></i>
            <p className="cdm-warning-text">
              <strong>Archive this menu item?</strong> This item will be hidden from the menu table and POS screen immediately.
            </p>
          </div>
        </div>

        {/* Footer */}
        <div className="cdm-modal-footer">
          <button className="cdm-btn-cancel" onClick={onClose} disabled={isSubmitting}>
            Cancel
          </button>
          <button className="cdm-btn-confirm" onClick={handleDelete} disabled={isSubmitting}>
            <i className="bi bi-trash"></i>
            {isSubmitting ? 'Archiving...' : 'Confirm'}
          </button>
        </div>
      </div>
    </div>
  );
};

export default ConfirmDeleteMenuItemModal;
