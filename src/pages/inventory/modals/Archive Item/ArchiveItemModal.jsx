import React from 'react';
import './archiveItemModal.css';

const ArchiveItemModal = ({ isOpen, onClose, item }) => {
  if (!isOpen || !item) return null;

  // Placeholder data
  const affectedMenuItems = [
    'Iced Café Latte',
    'Hot Café Latte',
    'Matcha Latte',
    'Chocolate Frappe',
    'Hot White Mocha',
    'Iced Mocha Latte',
    'Spanish Latte',
    'Milky Choco'
  ];

  const handleArchive = () => {
    console.log(`Archiving item: ${item.name} (ID: ${item.id})`);
    onClose();
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
          <span className="archive-modal-subtitle">{item.name}</span>
          <button className="archive-modal-close" onClick={onClose} aria-label="Close">
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
                <span className="archive-stat-value">{item.qty} {item.unit}</span>
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
              {affectedMenuItems.map((menuItem, idx) => (
                <div key={idx} className="archive-affected-pill">
                  <span>{menuItem}</span>
                </div>
              ))}
            </div>
          </div>

          {/* Warning Box */}
          <div className="archive-warning-box">
            <i className="bi bi-exclamation-triangle-fill archive-warning-icon"></i>
            <p className="archive-warning-text">
              <strong>Warning:</strong> This item is actively used in recipes. Archiving it may immediately disable the related menu items in the POS until updated.
            </p>
          </div>
        </div>

        {/* Footer */}
        <div className="archive-modal-footer">
          <button className="archive-btn-cancel" onClick={onClose}>
            Cancel
          </button>
          <button className="archive-btn-confirm" onClick={handleArchive}>
            <i className="bi bi-archive"></i>
            Archive Anyway
          </button>
        </div>
      </div>
    </div>
  );
};

export default ArchiveItemModal;
