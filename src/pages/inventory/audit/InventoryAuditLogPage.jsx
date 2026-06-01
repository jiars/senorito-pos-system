import React, { useState } from 'react';
import './inventoryAuditLog.css';

/* ═══════════════════════════════════════════════════
   Mock Data
═══════════════════════════════════════════════════ */
const MOCK_LOGS = [
  { id: 1, date: 'Mar 15, 11:14 AM', item: 'Cocoa Powder', action: 'Sale', source: 'POS', change: '-12 g', before: '4942.00', after: '4888.00', batch: '#1', reason: 'Sold x1 Milky Choco', ref: 'SC-260302-01', by: 'Kimberly Legaspi' },
  { id: 2, date: 'Mar 15, 11:14 AM', item: 'Milk', action: 'Sale', source: 'POS', change: '-200 ml', before: '60.00', after: '80.00', batch: '#1', reason: 'Sold x1 Milky Choco', ref: 'SC-260302-01', by: 'Kimberly Legaspi' },
  { id: 3, date: 'Mar 15, 11:14 AM', item: 'Sugar syrup', action: 'Sale', source: 'POS', change: '-15 ml', before: '300.00', after: '500.00', batch: '#1', reason: 'Sold x1 Milky Choco', ref: 'SC-260302-01', by: 'Kimberly Legaspi' },
  { id: 4, date: 'Mar 15, 11:14 AM', item: 'Ice', action: 'Sale', source: 'POS', change: '-120 g', before: '40.00', after: '140.00', batch: '#1', reason: 'Sold x1 Milky Choco', ref: 'SC-260302-01', by: 'Kimberly Legaspi' },
  { id: 5, date: 'Mar 15, 11:14 AM', item: '16oz cup', action: 'Sale', source: 'POS', change: '-1 pc', before: '40.00', after: '140.00', batch: '#1', reason: 'Sold x1 Milky Choco', ref: 'SC-260302-01', by: 'Kimberly Legaspi' },
  { id: 6, date: 'Mar 15, 11:14 AM', item: 'Straw', action: 'Sale', source: 'POS', change: '-1 pc', before: '40.00', after: '140.00', batch: '#1', reason: 'Sold x1 Milky Choco', ref: 'SC-260302-01', by: 'Kimberly Legaspi' },
  { id: 7, date: 'Mar 15, 11:14 AM', item: 'Coffee beans', action: 'Sale', source: 'POS', change: '-18 g', before: '40.00', after: '140.00', batch: '#1', reason: 'Sold x1 Hot Americano', ref: 'SC-260302-01', by: 'Kimberly Legaspi' },
  { id: 8, date: 'Mar 15, 11:14 AM', item: 'Water', action: 'Sale', source: 'POS', change: '-250 ml', before: '40.00', after: '140.00', batch: '#1', reason: 'Sold x1 Hot Americano', ref: 'SC-260302-01', by: 'Kimberly Legaspi' },
  { id: 9, date: 'Mar 15, 11:00 AM', item: 'Milk', action: 'Sale', source: 'POS', change: '-1 pc', before: '40.00', after: '140.00', batch: '#1', reason: 'Sold x1 Hot Americano', ref: 'SC-260302-01', by: 'Kimberly Legaspi' },
  { id: 10, date: 'Mar 15, 10:00 AM', item: 'Cookie', action: 'Wastage', source: 'Inventory', change: '-10 pcs', before: '40.00', after: '140.00', batch: '#1', reason: 'Wasted batch', ref: '-', by: 'Lyanna Magtuloy' },
  { id: 11, date: 'Mar 15, 9:00 AM', item: 'Sugar syrup', action: 'Batch Added', source: 'Purchase Order', change: '+2000 ml', before: '40.00', after: '140.00', batch: '#2', reason: 'Batch from purchase order', ref: 'PO-20260227-002', by: 'Lyanna Magtuloy' },
];

const InventoryAuditLogPage = () => {
  const [searchTerm, setSearchTerm] = useState('');
  const [fromDate, setFromDate] = useState('');
  const [toDate, setToDate] = useState('');
  const [actionFilter, setActionFilter] = useState('All actions');
  const [sourceFilter, setSourceFilter] = useState('All sources');

  const getActionChipClass = (action) => {
    switch (action) {
      case 'Sale': return 'audit-chip--teal';
      case 'Wastage': return 'audit-chip--red';
      case 'Batch Added': return 'audit-chip--green';
      default: return 'audit-chip--teal';
    }
  };

  const getSourceChipClass = (source) => {
    switch (source) {
      case 'POS': return 'audit-chip--teal';
      case 'Inventory': return 'audit-chip--green';
      case 'Purchase Order': return 'audit-chip--yellow';
      default: return 'audit-chip--teal';
    }
  };

  const getChangeClass = (change) => {
    if (change.startsWith('+')) return 'audit-change-positive';
    if (change.startsWith('-')) return 'audit-change-negative';
    return '';
  };

  return (
    <div className="audit-page">
      {/* ─── Header ─── */}
      <div className="audit-header">
        <div className="layout-page-heading" style={{ marginBottom: 0 }}>
          <h2>Inventory Audit Log</h2>
          <p>Track all inventory changes and adjustments over time.</p>
        </div>
        <div className="audit-actions">
          <button className="audit-btn audit-btn-outline">
            <i className="bi bi-download"></i> Export CSV
          </button>
        </div>
      </div>

      {/* ─── Main Panel (Filter Bar + Table) ─── */}
      <div className="audit-panel">
        
        {/* ─── Filter Bar ─── */}
        <div className="audit-filter-bar">
          <div className="audit-search">
            <i className="bi bi-search"></i>
            <input 
              type="text" 
              placeholder="Search item, reason, source..." 
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>

          <div className="audit-date-group">
            <span className="audit-date-label">From</span>
            <input 
              type="date" 
              className="audit-filter-date" 
              title="From Date"
              value={fromDate}
              onChange={(e) => setFromDate(e.target.value)}
            />
          </div>

          <div className="audit-date-group">
            <span className="audit-date-label">To</span>
            <input 
              type="date" 
              className="audit-filter-date" 
              title="To Date"
              value={toDate}
              onChange={(e) => setToDate(e.target.value)}
            />
          </div>

          <select 
            className="audit-select"
            value={actionFilter}
            onChange={(e) => setActionFilter(e.target.value)}
          >
            <option>All actions</option>
            <option>Sale</option>
            <option>Wastage</option>
            <option>Batch Added</option>
          </select>
          
          <select 
            className="audit-select"
            value={sourceFilter}
            onChange={(e) => setSourceFilter(e.target.value)}
          >
            <option>All sources</option>
            <option>POS</option>
            <option>Inventory</option>
            <option>Purchase Order</option>
          </select>
          
          <button className="audit-reset-btn">Reset</button>
        </div>

        <div className="audit-table-wrapper">
          <table className="audit-main-table">
            <thead>
              <tr>
                <th>Date & Time</th>
                <th>Item</th>
                <th>Action</th>
                <th>Source</th>
                <th>Change</th>
                <th>Before</th>
                <th>After</th>
                <th>Batch</th>
                <th>Reason</th>
                <th>Reference</th>
                <th>By</th>
              </tr>
            </thead>
            <tbody>
              {MOCK_LOGS.map((log) => (
                <tr key={log.id}>
                  <td>{log.date}</td>
                  <td style={{ maxWidth: '80px', whiteSpace: 'normal' }}>{log.item}</td>
                  <td>
                    <span className={`audit-chip ${getActionChipClass(log.action)}`}>
                      {log.action}
                    </span>
                  </td>
                  <td>
                    <span className={`audit-chip ${getSourceChipClass(log.source)}`}>
                      {log.source}
                    </span>
                  </td>
                  <td className={getChangeClass(log.change)}>{log.change}</td>
                  <td>{log.before}</td>
                  <td>{log.after}</td>
                  <td style={{ fontWeight: 600 }}>{log.batch}</td>
                  <td className="audit-reason-col">{log.reason}</td>
                  <td>{log.ref}</td>
                  <td style={{ maxWidth: '80px', whiteSpace: 'normal' }}>{log.by}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        
        {/* Pagination placeholder matching order history style */}
        <div className="audit-pagination">
          <span>Page 1 of 15</span>
          <div className="audit-pagination-btns">
            <button className="audit-page-btn"><i className="bi bi-chevron-left"></i></button>
            <button className="audit-page-btn active">1</button>
            <button className="audit-page-btn"><i className="bi bi-chevron-right"></i></button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default InventoryAuditLogPage;
