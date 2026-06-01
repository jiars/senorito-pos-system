import React, { useState, useEffect } from 'react';
import './stockHistoryModal.css';

const historyData = [
  { id: 1, date: 'Mar. 6 8:36 AM', action: 'Correction', change: '-1', before: 22, after: 21, batch: '#1', reason: 'Physical count correction', changedBy: 'Lyanna Magtuloy' },
  { id: 2, date: 'Mar. 5 1:12 PM', action: 'Sale', change: '-1', before: 23, after: 22, batch: '#1', reason: 'POS Sale', changedBy: 'Kimberly Legaspi' },
  { id: 3, date: 'Mar. 4 3:30 PM', action: 'Batch Added', change: '+10', before: 13, after: 23, batch: '#2', reason: 'Weekly pastry delivery', changedBy: 'Lyanna Magtuloy' },
  { id: 4, date: 'Mar. 4 2:50 PM', action: 'Wastage', change: '-5', before: 18, after: 13, batch: '#1', reason: 'Wasted pieces from batch', changedBy: 'Lyanna Magtuloy' },
  { id: 5, date: 'Mar. 1 11:30 AM', action: 'Sale', change: '-2', before: 20, after: 18, batch: '#1', reason: 'POS Sale', changedBy: 'Kimberly Legaspi' },
  { id: 6, date: 'Feb. 28 12:30 PM', action: 'Initial Stock', change: '+20', before: 0, after: 20, batch: '#1', reason: 'Initial stock from supplier', changedBy: 'Lyanna Magtuloy' },
  { id: 7, date: 'Feb. 27 5:10 PM', action: 'Correction', change: '+2', before: 18, after: 20, batch: '#1', reason: 'End-of-day stock correction', changedBy: 'Lyanna Magtuloy' },
  { id: 8, date: 'Feb. 26 2:45 PM', action: 'Sale', change: '-3', before: 21, after: 18, batch: '#1', reason: 'POS Sale', changedBy: 'Kimberly Legaspi' },
  { id: 9, date: 'Feb. 25 9:20 AM', action: 'Restock', change: '+15', before: 6, after: 21, batch: '#1', reason: 'Supplier restock', changedBy: 'Lyanna Magtuloy' },
  { id: 10, date: 'Feb. 24 4:40 PM', action: 'Wastage', change: '-2', before: 8, after: 6, batch: '#1', reason: 'Damaged item disposal', changedBy: 'Lyanna Magtuloy' },
  { id: 11, date: 'Feb. 23 3:15 PM', action: 'Sale', change: '-4', before: 12, after: 8, batch: '#1', reason: 'POS Sale', changedBy: 'Kimberly Legaspi' },
  { id: 12, date: 'Feb. 22 10:00 AM', action: 'Initial Stock', change: '+12', before: 0, after: 12, batch: '#1', reason: 'Opening stock entry', changedBy: 'Lyanna Magtuloy' }
];

const ROWS_PER_PAGE = 10;

const StockHistoryModal = ({ isOpen, onClose, item }) => {
  const [currentPage, setCurrentPage] = useState(1);

  // Reset page when modal opens
  useEffect(() => {
    if (isOpen) {
      setCurrentPage(1);
    }
  }, [isOpen]);

  if (!isOpen || !item) return null;

  const totalPages = Math.ceil(historyData.length / ROWS_PER_PAGE);
  const startIndex = (currentPage - 1) * ROWS_PER_PAGE;
  const currentRows = historyData.slice(startIndex, startIndex + ROWS_PER_PAGE);

  const getActionChipClass = (action) => {
    switch (action) {
      case 'Correction': return 'history-action-chip--correction';
      case 'Sale': return 'history-action-chip--sale';
      case 'Batch Added': return 'history-action-chip--batch-added';
      case 'Restock': return 'history-action-chip--restock';
      case 'Wastage': return 'history-action-chip--wastage';
      case 'Initial Stock': return 'history-action-chip--initial-stock';
      default: return '';
    }
  };

  const getChangeClass = (changeStr) => {
    if (changeStr.startsWith('+')) return 'history-change--positive';
    if (changeStr.startsWith('-')) return 'history-change--negative';
    return 'history-change--neutral';
  };

  return (
    <div className="history-modal-overlay">
      <div className="history-modal-content">
        <div className="history-modal-header">
          <h3>Stock History</h3>
          <span className="history-modal-subtitle">{item.name}</span>
          <button className="history-modal-close" onClick={onClose} aria-label="Close">
            <i className="bi bi-x"></i>
          </button>
        </div>

        <div className="history-modal-body">
          <table className="history-table">
            <thead>
              <tr>
                <th>Date</th>
                <th>Action</th>
                <th>Change</th>
                <th>Before</th>
                <th>After</th>
                <th>Batch</th>
                <th>Reason</th>
                <th>Changed By</th>
              </tr>
            </thead>
            <tbody>
              {currentRows.map((row) => (
                <tr key={row.id}>
                  <td>{row.date}</td>
                  <td>
                    <span className={`history-action-chip ${getActionChipClass(row.action)}`}>
                      {row.action}
                    </span>
                  </td>
                  <td className={getChangeClass(row.change)}>{row.change}</td>
                  <td>{row.before}</td>
                  <td>{row.after}</td>
                  <td className="history-batch-text">{row.batch}</td>
                  <td>{row.reason}</td>
                  <td>{row.changedBy}</td>
                </tr>
              ))}
            </tbody>
          </table>
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
