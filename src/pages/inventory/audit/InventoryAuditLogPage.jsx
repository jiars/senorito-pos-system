import React, { useState, useEffect, useMemo } from 'react';
import { fetchAllAuditLogs } from '../../../services/inventory/inventoryStockService';
import './inventoryAuditLog.css';

const InventoryAuditLogPage = () => {
  const [logs, setLogs] = useState([]);
  const [isLoading, setIsLoading] = useState(true);

  const [searchTerm, setSearchTerm] = useState('');
  const [fromDate, setFromDate] = useState('');
  const [toDate, setToDate] = useState('');
  const [actionFilter, setActionFilter] = useState('All actions');
  const [sourceFilter, setSourceFilter] = useState('All sources');

  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 12;

  useEffect(() => {
    const loadLogs = async () => {
      try {
        setIsLoading(true);
        const data = await fetchAllAuditLogs();
        setLogs(data || []);
      } catch (err) {
        console.error("Failed to load audit logs", err);
      } finally {
        setIsLoading(false);
      }
    };
    loadLogs();
  }, []);

  const getActionChipClass = (action) => {
    switch (action) {
      case 'POS Sale': return 'audit-chip--teal';
      case 'Manual Adjustment': return 'audit-chip--teal';
      case 'Wastage': return 'audit-chip--red';
      case 'Purchase': return 'audit-chip--green';
      default: return 'audit-chip--teal';
    }
  };

  const getSourceChipClass = (source) => {
    switch (source) {
      case 'POS': return 'audit-chip--teal';
      case 'Stock Log Modal': return 'audit-chip--yellow';
      case 'Purchase Order': return 'audit-chip--green';
      default: return 'audit-chip--teal';
    }
  };

  const getChangeClass = (change) => {
    if (change > 0) return 'audit-change-positive';
    if (change < 0) return 'audit-change-negative';
    return '';
  };

  const filteredLogs = useMemo(() => {
    return logs.filter((log) => {
      let matches = true;

      // 1. Search (Item name only, starts with)
      if (searchTerm) {
        const term = searchTerm.toLowerCase();
        const itemName = log.inventory_items?.item_name?.toLowerCase() || '';
        if (!itemName.startsWith(term)) {
          matches = false;
        }
      }

      // 2. Dates
      if (fromDate) {
        const logDate = new Date(log.created_at);
        const from = new Date(fromDate);
        from.setHours(0, 0, 0, 0);
        if (logDate < from) matches = false;
      }
      if (toDate) {
        const logDate = new Date(log.created_at);
        const to = new Date(toDate);
        to.setHours(23, 59, 59, 999);
        if (logDate > to) matches = false;
      }

      // 3. Action
      if (actionFilter !== 'All actions' && log.action !== actionFilter) {
        matches = false;
      }

      // 4. Source
      if (sourceFilter !== 'All sources' && log.source !== sourceFilter) {
        matches = false;
      }

      return matches;
    });
  }, [logs, searchTerm, fromDate, toDate, actionFilter, sourceFilter]);

  useEffect(() => {
    setCurrentPage(1);
  }, [searchTerm, fromDate, toDate, actionFilter, sourceFilter]);

  const totalPages = Math.ceil(filteredLogs.length / itemsPerPage);
  const paginatedLogs = filteredLogs.slice((currentPage - 1) * itemsPerPage, currentPage * itemsPerPage);

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
            <option>POS Sale</option>
            <option>Manual Adjustment</option>
            <option>Wastage</option>
            <option>Purchase</option>
          </select>

          <select
            className="audit-select"
            value={sourceFilter}
            onChange={(e) => setSourceFilter(e.target.value)}
          >
            <option>All sources</option>
            <option>POS</option>
            <option>Stock Log Modal</option>
            <option>Purchase Order</option>
          </select>

          <button className="audit-reset-btn" onClick={() => {
            setSearchTerm('');
            setFromDate('');
            setToDate('');
            setActionFilter('All actions');
            setSourceFilter('All sources');
          }}>Reset</button>
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
              {isLoading ? (
                <tr>
                  <td colSpan="11" style={{ textAlign: 'center', padding: '40px' }}>Loading audit logs...</td>
                </tr>
              ) : filteredLogs.length === 0 ? (
                <tr>
                  <td colSpan="11" style={{ textAlign: 'center', padding: '40px', color: '#666' }}>No audit logs found.</td>
                </tr>
              ) : (
                paginatedLogs.map((log) => {
                  const logDate = new Date(log.created_at);
                  const formattedDate = logDate.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
                  const formattedTime = logDate.toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit' });
                  const unit = log.inventory_items?.base_unit || '';
                  const changeStr = log.quantity_change > 0 ? `+${log.quantity_change} ${unit}` : `${log.quantity_change} ${unit}`;
                  const batchNum = log.inventory_batches?.batch_number ? log.inventory_batches.batch_number : '-';
                  const byName = log.profiles ? `${log.profiles.first_name} ${log.profiles.last_name}` : 'System';

                  return (
                    <tr key={log.id}>
                      <td style={{ minWidth: '130px' }}>
                        <div style={{ fontWeight: 500 }}>{formattedDate}</div>
                        <div style={{ color: '#6b7280', fontSize: '11px' }}>{formattedTime}</div>
                      </td>
                      <td style={{ minWidth: '110px', maxWidth: '160px', whiteSpace: 'normal', fontWeight: 500 }}>
                        {log.inventory_items?.item_name || 'Unknown Item'}
                      </td>
                      <td style={{ width: '100px' }}>
                        <span className={`audit-chip ${getActionChipClass(log.action)}`}>
                          {log.action}
                        </span>
                      </td>
                      <td style={{ width: '120px' }}>
                        <span className={`audit-chip ${getSourceChipClass(log.source)}`}>
                          {log.source}
                        </span>
                      </td>
                      <td className={getChangeClass(log.quantity_change)}>{changeStr}</td>
                      <td>{log.stock_before}</td>
                      <td>{log.stock_after}</td>
                      <td style={{ fontWeight: 600, width: '80px' }}>{batchNum}</td>
                      <td className="audit-reason-col">{log.reason_reference || '-'}</td>
                      <td style={{ minWidth: '90px', fontWeight: 500, color: '#555' }}>{log.log_number || '-'}</td>
                      <td style={{ minWidth: '100px', maxWidth: '140px', whiteSpace: 'normal' }}>{byName}</td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>

        {totalPages > 0 && (
          <div className="audit-pagination">
            <span>Page {currentPage} of {totalPages}</span>
            <div className="audit-pagination-btns">
              <button
                className="audit-page-btn"
                disabled={currentPage === 1}
                onClick={() => setCurrentPage(p => p - 1)}
              >
                <i className="bi bi-chevron-left"></i>
              </button>
              <button className="audit-page-btn active">{currentPage}</button>
              <button
                className="audit-page-btn"
                disabled={currentPage === totalPages}
                onClick={() => setCurrentPage(p => p + 1)}
              >
                <i className="bi bi-chevron-right"></i>
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default InventoryAuditLogPage;
