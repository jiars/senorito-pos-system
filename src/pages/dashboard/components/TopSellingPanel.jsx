import React from 'react';
import { formatCurrency } from '../../../utils/currencyFormatters';

const TopSellingPanel = ({ topSellingItems, isLoadingBottom }) => {
  return (
    <div className="dashboard-panel dashboard-topselling-panel">
      <div className="dashboard-panel-header dashboard-panel-header--accent">
        <h3 className="dashboard-panel-title">
          <i className="bi bi-heart-fill"></i>
          Top Selling (Last 7 Days)
        </h3>
      </div>

      <div className="dashboard-topselling-list">
        {isLoadingBottom ? (
          <p style={{ textAlign: 'center', padding: '1rem', color: '#666' }}>Loading top items...</p>
        ) : topSellingItems.length === 0 ? (
          <p style={{ textAlign: 'center', padding: '1rem', color: '#666' }}>No sales recorded yet.</p>
        ) : (
          topSellingItems.map((item) => (
            <div key={item.rank} className="dashboard-topselling-item">
              <span
                className={`dashboard-topselling-rank dashboard-topselling-rank--${item.rank}`}
              >
                #{item.rank}
              </span>
              <div className="dashboard-topselling-item-info">
                <p className="dashboard-topselling-category">{item.category}</p>
                <p className="dashboard-topselling-name">{item.name}</p>
              </div>
              <div className="dashboard-topselling-item-stats">
                <p className="dashboard-topselling-price">
                  {formatCurrency(item.price)}
                </p>
                <p className="dashboard-topselling-sold">{item.sold} Sold</p>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
};

export default TopSellingPanel;
