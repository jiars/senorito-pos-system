import React from 'react';

const InventoryArchiveHeader = ({ navigate }) => {
  return (
    <div className="inventory-page-header">
      <div className="layout-page-heading">
        <h2>Inventory Archive</h2>
        <p>View archived inventory items and restore them when needed.</p>
      </div>

      <div className="inventory-header-actions">
        <button className="inventory-btn" onClick={() => navigate('/inventory')}>
          <i className="bi bi-arrow-left-square"></i>
          Back to Inventory
        </button>
      </div>
    </div>
  );
};

export default InventoryArchiveHeader;
