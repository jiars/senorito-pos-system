import React from 'react';

const ArchiveItemSummary = ({ item, totalAffected }) => (
  <div className="archive-stats-grid">
    <div className="archive-stat-card">
      <div className="archive-stat-icon">
        <i className="bi bi-box-seam" />
      </div>
      <div className="archive-stat-details">
        <span className="archive-stat-label">Current Stock</span>
        <span className="archive-stat-value">
          {item.current_stock || 0} {item.base_unit}
        </span>
      </div>
    </div>

    <div className="archive-stat-card">
      <div className="archive-stat-icon archive-stat-icon--alt">
        <i className="bi bi-diagram-3" />
      </div>
      <div className="archive-stat-details">
        <span className="archive-stat-label">Used In</span>
        <span className="archive-stat-value">{totalAffected} recipes</span>
      </div>
    </div>
  </div>
);

export default ArchiveItemSummary;
