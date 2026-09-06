import React, { useState, useEffect } from 'react';
import './archiveItemModal.css';
import { archiveInventoryItem, fetchAffectedMenuItems } from '../../../../services/inventory/inventoryItemsService';
import { useAuth } from '../../../../hooks/useAuth';

const ArchiveItemModal = ({ isOpen, onClose, item, refetchInventory }) => {
  const { user } = useAuth();
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

  const handleArchive = async () => {
    if (isSubmitting) return;

    setIsSubmitting(true);
    setApiError('');

    try {
      await archiveInventoryItem(item.id, user?.id);

      if (refetchInventory) {
        await refetchInventory();
      }

      onClose();
    } catch (error) {
      setApiError(error.message || 'Failed to archive item.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="archive-modal-overlay">
      <div className="archive-modal-content">
        {/* Header */}
        <div className="archive-modal-header">
          <div className="archive-header-icon">
            <i className="bi bi-archive-fill"></i>
          </div>
          <h3>Archive Item</h3>
          <span className="archive-modal-subtitle">{item.item_name}</span>
          <button className="archive-modal-close" onClick={onClose} aria-label="Close" disabled={isSubmitting}>
            <i className="bi bi-x"></i>
          </button>
        </div>

        {/* Body */}
        <div className="archive-modal-body">

          {/* Stat Cards */}
          <div className="archive-stats-grid">
            <div className="archive-stat-card">
              <div className="archive-stat-icon">
                <i className="bi bi-box-seam"></i>
              </div>
              <div className="archive-stat-details">
                <span className="archive-stat-label">Current Stock</span>
                <span className="archive-stat-value">{item.current_stock || 0} {item.base_unit}</span>
              </div>
            </div>
            <div className="archive-stat-card">
              <div className="archive-stat-icon archive-stat-icon--alt">
                <i className="bi bi-diagram-3"></i>
              </div>
              <div className="archive-stat-details">
                <span className="archive-stat-label">Used In</span>
                <span className="archive-stat-value">{affectedMenuItems.length} recipes</span>
              </div>
            </div>
          </div>

          <hr className="archive-divider" />

          {/* Affected Items List */}
          <div className="archive-affected-section">
            <h4>Affected Menu Items</h4>
            <div className="archive-affected-list">
              {isLoadingAffected ? (
                <div style={{ fontSize: '0.85rem', color: '#666' }}>Loading affected items...</div>
              ) : affectedMenuItems.length > 0 ? (
                affectedMenuItems.map((menuItem, idx) => (
                  <div key={idx} className="archive-affected-pill">
                    <span>{menuItem}</span>
                  </div>
                ))
              ) : (
                <div style={{ fontSize: '0.85rem', color: '#666' }}>No menu items currently use this ingredient.</div>
              )}
            </div>
          </div>

          {/* Warning Box */}
          {affectedMenuItems.length > 0 && (
            <div className="archive-warning-box">
              <i className="bi bi-exclamation-triangle-fill archive-warning-icon"></i>
              <p className="archive-warning-text">
                <strong>Warning:</strong> This item is actively used in {affectedMenuItems.length} recipe{affectedMenuItems.length > 1 ? 's' : ''}. Archiving it may immediately disable the related menu items in the POS until updated.
              </p>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="archive-modal-footer">
          {apiError && <p className="archive-error-msg" style={{ color: 'red', marginRight: 'auto', marginBottom: 0, fontSize: '0.85rem' }}>{apiError}</p>}
          <button className="archive-btn-cancel" onClick={onClose} disabled={isSubmitting}>
            Cancel
          </button>
          <button className="archive-btn-confirm" onClick={handleArchive} disabled={isSubmitting}>
            <i className="bi bi-archive"></i>
            {isSubmitting ? 'Archiving...' : 'Archive Anyway'}
          </button>
        </div>
      </div>
    </div>
  );
};

export default ArchiveItemModal;
