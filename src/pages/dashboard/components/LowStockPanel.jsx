import React from 'react';

const LowStockPanel = ({ alerts, isLoadingTop }) => {
  const stockPercent = (qty, min) => {
    if (min === 0) return 0;
    return Math.min((qty / min) * 100, 100);
  };

  return (
    <div className="dashboard-panel dashboard-lowstock-panel">
      <div className="dashboard-panel-header dashboard-panel-header--danger">
        <h3 className="dashboard-panel-title">
          <i className="bi bi-exclamation-triangle-fill"></i>
          Low Stock Alert
        </h3>
      </div>

      <div className="dashboard-lowstock-list">
        {isLoadingTop ? (
          <p style={{ textAlign: 'center', padding: '1rem', color: '#666' }}>Loading...</p>
        ) : alerts.lowStockItems.length === 0 ? (
          <p style={{ textAlign: 'center', padding: '1rem', color: '#666' }}>Stock levels are good.</p>
        ) : (
          alerts.lowStockItems.map((item, idx) => (
            <div key={idx} className="dashboard-lowstock-item">
              <div className="dashboard-lowstock-item-info">
                <p className="dashboard-lowstock-item-name">{item.name}</p>
                <p className="dashboard-lowstock-item-min">Min. {item.min}</p>
              </div>
              <div className="dashboard-lowstock-item-right">
                <span
                  className={`dashboard-lowstock-badge dashboard-lowstock-badge--${item.level}`}
                >
                  {item.qty} {item.unit}
                </span>
              </div>
              <div className="dashboard-lowstock-bar-track">
                <div
                  className={`dashboard-lowstock-bar-fill dashboard-lowstock-bar-fill--${item.level}`}
                  style={{ width: `${stockPercent(item.qty, item.min)}%` }}
                ></div>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
};

export default LowStockPanel;
