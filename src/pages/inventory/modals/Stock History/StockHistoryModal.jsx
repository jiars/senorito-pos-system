import React, { useState, useEffect } from 'react';
import { fetchItemAuditLogs } from '../../../../services/inventory/inventoryStockService';
import { formatCurrency } from '../../../../utils/currencyFormatters';
import './stockHistoryModal.css';

const ROWS_PER_PAGE = 10;

const StockHistoryModal = ({ isOpen, onClose, item }) => {
  const [currentPage, setCurrentPage] = useState(1);
  const [logs, setLogs] = useState([]);
  const [isLoading, setIsLoading] = useState(false);

  // Fetch logs when modal opens
  useEffect(() => {
    if (isOpen && item) {
      setCurrentPage(1);
      setIsLoading(true);
      fetchItemAuditLogs(item.id)
        .then(data => {
          setLogs(data || []);
        })
        .catch(err => console.error("Error fetching audit logs:", err))
        .finally(() => setIsLoading(false));
    }
  }, [isOpen, item]);

  if (!isOpen || !item) return null;

  const totalPages = Math.max(1, Math.ceil(logs.length / ROWS_PER_PAGE));
  const startIndex = (currentPage - 1) * ROWS_PER_PAGE;
  const currentRows = logs.slice(startIndex, startIndex + ROWS_PER_PAGE);

  const getActionChipClass = (action) => {
    switch (action) {
      case 'Manual Adjustment': return 'history-action-chip--correction';
      case 'Sale': return 'history-action-chip--sale';
      case 'Purchase': return 'history-action-chip--restock';
      case 'Wastage': return 'history-action-chip--wastage';
      default: return 'history-action-chip--correction'; // fallback
    }
  };

  const getChangeClass = (changeNumber) => {
    if (changeNumber > 0) return 'history-change--positive';
    if (changeNumber < 0) return 'history-change--negative';
    return 'history-change--neutral';
  };

  return (
    <div className="history-modal-overlay">
      <div className="history-modal-content" style={{ maxWidth: '1200px' }}>
        <div className="history-modal-header">
          <h3>Stock History</h3>
          <span className="history-modal-subtitle">{item.item_name}</span>
          <button className="history-modal-close" onClick={onClose} aria-label="Close">
            <i className="bi bi-x"></i>
          </button>
        </div>

        <div className="history-modal-body">
          {isLoading ? (
            <div style={{ textAlign: 'center', padding: '20px' }}>Loading history...</div>
          ) : (
            <div style={{ overflowX: 'auto' }}>
              <table className="history-table">
                <thead>
                  <tr>
                    <th>Date</th>
                    <th>Action</th>
                    <th>Change</th>
                    <th>Before</th>
                    <th>After</th>
                    <th>Batch</th>
                    <th>Cost Per Unit</th>
                    <th>Reason</th>
                    <th>Changed By</th>
                  </tr>
                </thead>
                <tbody>
                  {currentRows.length === 0 ? (
                    <tr>
                      <td colSpan="9" style={{ textAlign: 'center' }}>No history found for this item.</td>
                    </tr>
                  ) : (
                    currentRows.map((log) => {
                      // Calculate the true change
                      const diff = log.stock_after - log.stock_before;
                      const changeStr = diff > 0 ? `+${diff}` : `${diff}`;

                      // Format Date
                      const dateObj = new Date(log.created_at);
                      const dateStr = dateObj.toLocaleString('en-US', { month: 'short', day: 'numeric', hour: 'numeric', minute: '2-digit' });

                      // Batch Number & Cost
                      const batchNumber = log.inventory_batches?.batch_number || '-';
                      let costPerUnit = '-';
                      if (log.inventory_batches && log.inventory_batches.inventory_purchase_history && log.inventory_batches.inventory_purchase_history.length > 0) {
                        const cost = log.inventory_batches.inventory_purchase_history[0].cost_per_unit;
                        if (cost !== null && cost !== undefined) {
                          costPerUnit = formatCurrency(cost);
                        }
                      }

                      // Name
                      const changedBy = log.profiles ? `${log.profiles.first_name} ${log.profiles.last_name}` : 'Unknown';

                      return (
                        <tr key={log.id}>
                          <td>{dateStr}</td>
                          <td>
                            <span className={`history-action-chip ${getActionChipClass(log.action)}`}>
                              {log.action}
                            </span>
                          </td>
                          <td className={getChangeClass(diff)}>{changeStr}</td>
                          <td>{log.stock_before}</td>
                          <td>{log.stock_after}</td>
                          <td className="history-batch-text">{batchNumber}</td>
                          <td>{costPerUnit}</td>
                          <td>{log.reason_reference || '-'}</td>
                          <td>{changedBy}</td>
                        </tr>
                      );
                    })
                  )}
                </tbody>
              </table>
            </div>
          )}
        </div>

        {totalPages > 1 && (
          <div className="history-modal-footer">
            <span className="history-pagination-info">
              Page {currentPage} of {totalPages}
            </span>
            <div className="history-pagination-controls">
              <button
                className="history-pagination-btn"
                disabled={currentPage === 1}
                onClick={() => setCurrentPage(prev => Math.max(prev - 1, 1))}
              >
                Previous
              </button>
              <button
                className="history-pagination-btn"
                disabled={currentPage === totalPages}
                onClick={() => setCurrentPage(prev => Math.min(prev + 1, totalPages))}
              >
                Next
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default StockHistoryModal;
