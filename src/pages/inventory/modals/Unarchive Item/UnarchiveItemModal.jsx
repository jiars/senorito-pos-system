import React from 'react';
import './unarchiveItemModal.css';

const UnarchiveItemModal = ({ isOpen, onClose, item }) => {
  if (!isOpen || !item) return null;

  // Placeholder data based on the design
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

  const handleUnarchive = () => {
    console.log(`Unarchiving item: ${item.name} (ID: ${item.id})`);
    onClose();
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
          <span className="unarchive-modal-subtitle">{item.name}</span>
          <button className="unarchive-modal-close" onClick={onClose} aria-label="Close">
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
                <span className="unarchive-stat-value">{item.qty} {item.unit}</span>
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
              {affectedMenuItems.map((menuItem, idx) => (
                <div key={idx} className="unarchive-affected-pill">
                  <span>{menuItem}</span>
                </div>
              ))}
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
          <button className="unarchive-btn-cancel" onClick={onClose}>
            Cancel
          </button>
          <button className="unarchive-btn-confirm" onClick={handleUnarchive}>
            <i className="bi bi-box-arrow-up"></i>
            Unarchive Item
          </button>
        </div>
      </div>
    </div>
  );
};

export default UnarchiveItemModal;
