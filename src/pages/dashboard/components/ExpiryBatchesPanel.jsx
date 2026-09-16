import React from 'react';

const ExpiryBatchesPanel = ({ alerts, isLoadingTop }) => {
  const expiredCount = alerts.expiryItems.filter((i) => i.status === 'expired').length;
  const expiringCount = alerts.expiryItems.filter((i) => i.status === 'expiring').length;

  return (
    <div className="dashboard-panel dashboard-expiry-panel">
      <div className="dashboard-panel-header">
        <h3 className="dashboard-panel-title">
          <i className="bi bi-exclamation-diamond-fill"></i>
          Near Expiry / Expired Batches
        </h3>
      </div>

      <div className="dashboard-expiry-chips">
        <span className="dashboard-chip dashboard-chip--expired">
          {expiredCount} Expired
        </span>
        <span className="dashboard-chip dashboard-chip--expiring">
          {expiringCount} Expiring
        </span>
      </div>

      <div className="dashboard-expiry-list">
        {isLoadingTop ? (
          <p style={{ textAlign: 'center', padding: '1rem', color: '#666' }}>Loading...</p>
        ) : alerts.expiryItems.length === 0 ? (
          <p style={{ textAlign: 'center', padding: '1rem', color: '#666' }}>No expired or expiring batches.</p>
        ) : (
          alerts.expiryItems.map((item, idx) => {
            let timeLeftText = 'Expired';
            if (item.status === 'expiring') {
              const daysLeft = Math.ceil((new Date(item.exp) - new Date()) / (1000 * 60 * 60 * 24));
              timeLeftText = `${daysLeft}d left`;
            }

            return (
              <div key={idx} className="dashboard-expiry-item">
                <div className="dashboard-expiry-item-info">
                  <p className="dashboard-expiry-item-name">{item.name}</p>
                  <p className="dashboard-expiry-item-meta">
                    Batch: {item.batch} | {item.size} | Exp: {item.exp}
                  </p>
                </div>
                <span
                  className={`dashboard-chip dashboard-chip--${item.status}`}
                >
                  {timeLeftText}
                </span>
              </div>
            );
          })
        )}
      </div>
    </div>
  );
};

export default ExpiryBatchesPanel;
