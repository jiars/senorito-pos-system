import React, { useState } from 'react';
import './confirmDeleteAddonModal.css';

import { archiveAddon } from '../../../../../services/menu/addonsService';
import { formatCurrency } from '@/utils/shared/formatters/currencyFormatters';

const ConfirmDeleteAddonModal = ({ isOpen, onClose, addon, refetchAddons }) => {
  const [isSubmitting, setIsSubmitting] = useState(false);

  if (!isOpen || !addon) return null;

  const handleDelete = async () => {
    if (isSubmitting) return;
    setIsSubmitting(true);

    try {
      await archiveAddon(addon.id);
      if (refetchAddons) {
        await refetchAddons();
      }
      onClose();
    } catch (error) {
      alert(error.message);
    } finally {
      setIsSubmitting(false);
    }
  };

  const categoriesList = [];
  if (addon.addon_categories) {
    for (let i = 0; i < addon.addon_categories.length; i++) {
      if (addon.addon_categories[i].menu_categories) {
        categoriesList.push(addon.addon_categories[i].menu_categories.category_name);
      }
    }
  }

  return (
    <div className="cda-modal-overlay">
      <div className="cda-modal-content">
        {/* Header */}
        <div className="cda-modal-header">
          <div className="cda-header-icon">
            <i className="bi bi-trash3-fill"></i>
          </div>
          <h3>Confirm Delete</h3>
          <span className="cda-modal-subtitle">{addon.addon_name}</span>
          <button className="cda-modal-close" onClick={onClose} aria-label="Close">
            <i className="bi bi-x"></i>
          </button>
        </div>

        {/* Body */}
        <div className="cda-modal-body">

          {/* Stat Cards */}
          <div className="cda-stats-grid">
            <div className="cda-stat-card">
              <div className="cda-stat-icon">
                <i className="bi bi-shop"></i>
              </div>
              <div className="cda-stat-details">
                <span className="cda-stat-label">POS Status</span>
                <span className="cda-stat-value">{addon.pos_status || 'N/A'}</span>
              </div>
            </div>
            <div className="cda-stat-card">
              <div className="cda-stat-icon cda-stat-icon--alt">
                <i className="bi bi-cash-stack"></i>
              </div>
              <div className="cda-stat-details">
                <span className="cda-stat-label">Price</span>
                <span className="cda-stat-value">{formatCurrency(addon.selling_price)}</span>
              </div>
            </div>
          </div>

          <hr className="cda-divider" />

          {/* Affected Items List */}
          {categoriesList.length > 0 && (
            <div className="cda-affected-section">
              <h4>Applicable Categories</h4>
              <div className="cda-affected-list">
                {categoriesList.map((cat, idx) => (
                  <div key={idx} className="cda-affected-pill">
                    <span>{cat}</span>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Warning Box */}
          <div className="cda-warning-box">
            <i className="bi bi-exclamation-triangle-fill cda-warning-icon"></i>
            <p className="cda-warning-text">
              <strong>Delete this add-on?</strong> This action cannot be undone. All variants, pricing, and recipe configurations associated with this add-on will be permanently removed.
            </p>
          </div>
        </div>

        {/* Footer */}
        <div className="cda-modal-footer">
          <button className="cda-btn-cancel" onClick={onClose} disabled={isSubmitting}>
            Cancel
          </button>
          <button className="cda-btn-confirm" onClick={handleDelete} disabled={isSubmitting}>
            <i className="bi bi-trash"></i>
            {isSubmitting ? 'Deleting...' : 'Confirm'}
          </button>
        </div>
      </div>
    </div>
  );
};

export default ConfirmDeleteAddonModal;
