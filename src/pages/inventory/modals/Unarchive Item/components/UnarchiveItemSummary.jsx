import React from 'react';

const UnarchiveItemSummary = ({ item, totalAffected }) => (
  <div className="unarchive-stats-grid">
    <div className="unarchive-stat-card">
      <div className="unarchive-stat-icon">
        <i className="bi bi-box-seam" />
      </div>
      <div className="unarchive-stat-details">
        <span className="unarchive-stat-label">Current Stock</span>
        <span className="unarchive-stat-value">
          {item.current_stock || 0} {item.base_unit}
        </span>
      </div>
    </div>

    <div className="unarchive-stat-card">
      <div className="unarchive-stat-icon unarchive-stat-icon--alt">
        <i className="bi bi-diagram-3" />
      </div>
      <div className="unarchive-stat-details">
        <span className="unarchive-stat-label">Used In</span>
        <span className="unarchive-stat-value">{totalAffected} recipes</span>
      </div>
    </div>
  </div>
);

export default UnarchiveItemSummary;
