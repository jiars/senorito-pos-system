import React from 'react';
import './batchesModal.css';

const BatchesModal = ({ isOpen, onClose, item }) => {
  if (!isOpen || !item) return null;

  const getStatusChipClass = (status) => {
    switch (status) {
      case 'Good': return 'batches-status-chip--good';
      case 'Expiring Soon': return 'batches-status-chip--warning';
      case 'Expired': return 'batches-status-chip--danger';
      case 'Non-Perishable': return 'batches-status-chip--good';
      default: return '';
    }
  };

  const getStatusIconClass = (status) => {
    switch (status) {
      case 'Good': return 'bi-calendar-check';
      case 'Expiring Soon': return 'bi-clock-history';
      case 'Expired': return 'bi-exclamation-triangle';
      case 'Non-Perishable': return 'bi-calendar-check';
      default: return 'bi-info-circle';
    }
  };

  const getDaysLeftClass = (status) => {
    if (status === 'Expired') return 'batches-days-left--danger';
    if (status === 'Expiring Soon') return 'batches-days-left--warning';
    return 'batches-days-left--good';
  };

  const getBatchExpiryData = (batch, trackExpiry) => {
    if (!trackExpiry) return { status: 'Non-Perishable', daysLeft: '-', expirationStr: '-' };
    if (!batch.expiration_date) return { status: 'Good', daysLeft: '-', expirationStr: '-' };

    const expiryDate = new Date(batch.expiration_date);
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const expiryDateOnly = new Date(batch.expiration_date);
    expiryDateOnly.setHours(0, 0, 0, 0);

    const diffTime = expiryDateOnly - today;
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    
    const dateStr = expiryDate.toLocaleString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });

    let status = 'Good';
    let daysLeftStr = `${diffDays}d`;
    if (diffDays < 0) {
        status = 'Expired';
    } else if (diffDays <= 30) {
        status = 'Expiring Soon';
    }

    return { status, daysLeft: daysLeftStr, expirationStr: dateStr };
  };

  // Filter active batches and sort by latest created_at
  const activeBatches = (item.inventory_batches || [])
    .filter(b => b.quantity > 0)
    .sort((a, b) => new Date(b.created_at) - new Date(a.created_at));

  return (
    <div className="batches-modal-overlay">
      <div className="batches-modal-content">
        <div className="batches-modal-header">
          <h3>Active Batches</h3>
          <span className="batches-modal-subtitle">{item.item_name}</span>
          <button className="batches-modal-close" onClick={onClose} aria-label="Close">
            <i className="bi bi-x"></i>
          </button>
        </div>

        <div className="batches-modal-body">
          <table className="batches-table">
            <thead>
              <tr>
                <th>Batch #</th>
                <th>Qty</th>
                <th>Expiration</th>
                <th>Days Left</th>
                <th>Status</th>
                <th>Supplier</th>
                <th>Received</th>
              </tr>
            </thead>
            <tbody>
              {activeBatches.length === 0 ? (
                <tr>
                  <td colSpan="7" style={{ textAlign: 'center', padding: '2rem', color: '#666' }}>
                    No active batches found.
                  </td>
                </tr>
              ) : (
                activeBatches.map((batch) => {
                  const expiryData = getBatchExpiryData(batch, item.track_expiry);
                  const receivedDate = batch.created_at 
                    ? new Date(batch.created_at).toLocaleString('en-US', { month: 'short', day: 'numeric' })
                    : '-';

                  return (
                    <tr key={batch.id}>
                      <td>{batch.batch_number || '-'}</td>
                      <td style={{ fontWeight: '500' }}>{batch.quantity}</td>
                      <td>{expiryData.expirationStr}</td>
                      <td className={`batches-days-left ${getDaysLeftClass(expiryData.status)}`}>
                        {expiryData.daysLeft}
                      </td>
                      <td>
                        <span className={`batches-status-chip ${getStatusChipClass(expiryData.status)}`}>
                          <i className={`bi ${getStatusIconClass(expiryData.status)}`}></i> {expiryData.status}
                        </span>
                      </td>
                      <td>{batch.source || 'Initial Stock'}</td>
                      <td>{receivedDate}</td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default BatchesModal;
