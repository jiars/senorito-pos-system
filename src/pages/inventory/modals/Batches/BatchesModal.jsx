import React, { useState } from 'react';
import ConfirmDisposeModal from '../Confirm Dispose/ConfirmDisposeModal';
import './batchesModal.css';

const placeholderBatches = [
  { id: 1, batchNo: '#1', qty: 11, expiration: 'Mar 18, 2026', daysLeft: '3d', status: 'Expiring Soon', source: 'Initial Stock', received: 'Feb 28' },
  { id: 2, batchNo: '#2', qty: 10, expiration: 'Mar 30, 2026', daysLeft: '15d', status: 'Good', source: 'Manual Restock', received: 'Mar 4' },
];

const BatchesModal = ({ isOpen, onClose, item }) => {
  const [isDisposeModalOpen, setIsDisposeModalOpen] = useState(false);
  const [selectedBatch, setSelectedBatch] = useState(null);

  if (!isOpen || !item) return null;

  const handleDisposeClick = (batch) => {
    setSelectedBatch(batch);
    setIsDisposeModalOpen(true);
  };

  const getStatusChipClass = (status) => {
    switch (status) {
      case 'Good': return 'batches-status-chip--good';
      case 'Expiring Soon': return 'batches-status-chip--warning';
      case 'Expired': return 'batches-status-chip--danger';
      default: return '';
    }
  };

  const getStatusIconClass = (status) => {
    switch (status) {
      case 'Good': return 'bi-calendar-check';
      case 'Expiring Soon': return 'bi-clock-history';
      case 'Expired': return 'bi-exclamation-triangle';
      default: return 'bi-info-circle';
    }
  };

  const getDaysLeftClass = (daysLeftStr) => {
    if (!daysLeftStr) return '';
    const days = parseInt(daysLeftStr.replace('d', ''), 10);
    if (days < 0) return 'batches-days-left--danger';
    if (days <= 5) return 'batches-days-left--warning';
    return 'batches-days-left--good';
  };

  return (
    <>
      <div className="batches-modal-overlay">
        <div className="batches-modal-content">
          <div className="batches-modal-header">
            <h3>Batches</h3>
            <span className="batches-modal-subtitle">{item.name}</span>
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
                  <th>Source</th>
                  <th>Received</th>
                  <th>Action</th>
                </tr>
              </thead>
              <tbody>
                {placeholderBatches.map((batch) => (
                  <tr key={batch.id}>
                    <td>{batch.batchNo}</td>
                    <td>{batch.qty}</td>
                    <td>{batch.expiration}</td>
                    <td className={`batches-days-left ${getDaysLeftClass(batch.daysLeft)}`}>{batch.daysLeft}</td>
                    <td>
                      <span className={`batches-status-chip ${getStatusChipClass(batch.status)}`}>
                        <i className={`bi ${getStatusIconClass(batch.status)}`}></i> {batch.status}
                      </span>
                    </td>
                    <td>{batch.source}</td>
                    <td>{batch.received}</td>
                    <td>
                      <button 
                        className="batches-btn-dispose" 
                        title="Dispose Batch"
                        onClick={() => handleDisposeClick(batch)}
                      >
                        <i className="bi bi-trash"></i>
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>

      <ConfirmDisposeModal 
        isOpen={isDisposeModalOpen}
        onClose={() => setIsDisposeModalOpen(false)}
        itemName={item.name}
        batchName={`Batch ${selectedBatch?.id || ''}`}
      />
    </>
  );
};

export default BatchesModal;
