import React, { useState, useEffect } from 'react';
import './unarchiveItemModal.css';
import { unarchiveInventoryItem, fetchAffectedMenuItems } from '../../../../services/inventory/inventoryItemsService';

const UnarchiveItemModal = ({ isOpen, onClose, item, refetchInventory }) => {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [apiError, setApiError] = useState('');
  const [affectedMenuItems, setAffectedMenuItems] = useState([]);
  const [isLoadingAffected, setIsLoadingAffected] = useState(false);

  useEffect(() => {
    const loadAffectedItems = async () => {
      if (isOpen && item) {
        setIsLoadingAffected(true);
        try {
          const items = await fetchAffectedMenuItems(item.id);
          setAffectedMenuItems(items);
        } catch (error) {
          console.error("Failed to load affected menu items", error);
        } finally {
          setIsLoadingAffected(false);
        }
      }
    };
    
    loadAffectedItems();
  }, [isOpen, item]);

  if (!isOpen || !item) return null;

  const handleUnarchive = async () => {
    if (isSubmitting) return;

    setIsSubmitting(true);
    setApiError('');

    try {
      await unarchiveInventoryItem(item.id);
      
      if (refetchInventory) {
        await refetchInventory();
      }

      onClose();
    } catch (error) {
      setApiError(error.message || 'Failed to unarchive item.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="unarchive-modal-overlay">
      <div className="unarchive-modal-content">
        {/* Header - Premium Redesign with Iconography */}
        <div className="unarchive-modal-header">
          <div className="unarchive-header-icon">
            <i className="bi bi-box-arrow-up"></i>
          </div>
          <h3>Unarchive Item</h3>
          <span className="unarchive-modal-subtitle">{item.item_name}</span>
          <button className="unarchive-modal-close" onClick={onClose} aria-label="Close" disabled={isSubmitting}>
            <i className="bi bi-x"></i>
          </button>
        </div>

        {/* Body */}
        <div className="unarchive-modal-body">
          
          {/* Beautiful Stat Cards */}
          <div className="unarchive-stats-grid">
            <div className="unarchive-stat-card">
              <div className="unarchive-stat-icon">
                <i className="bi bi-box-seam"></i>
              </div>
              <div className="unarchive-stat-details">
                <span className="unarchive-stat-label">Last Stock</span>
                <span className="unarchive-stat-value">{item.current_stock || 0} {item.base_unit}</span>
              </div>
            </div>
            <div className="unarchive-stat-card">
              <div className="unarchive-stat-icon unarchive-stat-icon--alt">
                <i className="bi bi-check-circle"></i>
              </div>
              <div className="unarchive-stat-details">
                <span className="unarchive-stat-label">Last Status</span>
                <span className="unarchive-stat-value">In-stock</span>
              </div>
            </div>
            <div className="unarchive-stat-card">
              <div className="unarchive-stat-icon unarchive-stat-icon--alt">
                <i className="bi bi-clock-history"></i>
              </div>
              <div className="unarchive-stat-details">
                <span className="unarchive-stat-label">Last Expiry</span>
                <span className="unarchive-stat-value">Expired</span>
              </div>
            </div>
          </div>

          <hr className="unarchive-divider" />

          {/* Premium Affected Items List */}
          <div className="unarchive-affected-section">
            <h4>Affected menu items</h4>
            <div className="unarchive-affected-list">
              {isLoadingAffected ? (
                <div style={{ fontSize: '0.85rem', color: '#666' }}>Loading affected items...</div>
              ) : affectedMenuItems.length > 0 ? (
                affectedMenuItems.map((menuItem, idx) => (
                  <div key={idx} className="unarchive-affected-pill">
                    <span>{menuItem}</span>
                  </div>
                ))
              ) : (
                <div style={{ fontSize: '0.85rem', color: '#666' }}>No menu items currently use this ingredient.</div>
              )}
            </div>
          </div>

          {/* High-visibility Warning Box */}
          <div className="unarchive-warning-box">
            <i className="bi bi-info-circle-fill unarchive-warning-icon"></i>
            <p className="unarchive-warning-text">
              This item will be returned to the active inventory list. Please review its stock level and expiry details after restoring.
            </p>
          </div>
        </div>

        {/* Footer */}
        <div className="unarchive-modal-footer">
          {apiError && <p className="unarchive-error-msg" style={{color: 'red', marginRight: 'auto', marginBottom: 0, fontSize: '0.85rem'}}>{apiError}</p>}
          <button className="unarchive-btn-cancel" onClick={onClose} disabled={isSubmitting}>
            Cancel
          </button>
          <button className="unarchive-btn-confirm" onClick={handleUnarchive} disabled={isSubmitting}>
            <i className="bi bi-box-arrow-up"></i>
            {isSubmitting ? 'Unarchiving...' : 'Unarchive'}
          </button>
        </div>
      </div>
    </div>
  );
};

export default UnarchiveItemModal;
