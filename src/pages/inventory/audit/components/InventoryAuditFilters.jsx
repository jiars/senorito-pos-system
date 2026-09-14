const InventoryAuditFilters = ({ filters, onFilterChange, onReset }) => {
  return (
    <div className="audit-filter-bar">
      <div className="audit-search">
        <i className="bi bi-search"></i>
        <input
          type="text"
          placeholder="Search item, reason, source..."
          value={filters.searchTerm}
          onChange={(event) => onFilterChange('searchTerm', event.target.value)}
        />
      </div>

      <div className="audit-date-group">
        <span className="audit-date-label">From</span>
        <input
          type="date"
          className="audit-filter-date"
          title="From Date"
          value={filters.fromDate}
          onChange={(event) => onFilterChange('fromDate', event.target.value)}
        />
      </div>

      <div className="audit-date-group">
        <span className="audit-date-label">To</span>
        <input
          type="date"
          className="audit-filter-date"
          title="To Date"
          value={filters.toDate}
          onChange={(event) => onFilterChange('toDate', event.target.value)}
        />
      </div>

      <select
        className="audit-select"
        value={filters.action}
        onChange={(event) => onFilterChange('action', event.target.value)}
      >
        <option>All actions</option>
        <option>POS Sale</option>
        <option>Manual Adjustment</option>
        <option>Wastage</option>
        <option>Purchase</option>
        <option>Expired</option>
      </select>

      <select
        className="audit-select"
        value={filters.source}
        onChange={(event) => onFilterChange('source', event.target.value)}
      >
        <option>All sources</option>
        <option>POS</option>
        <option>Stock Log Modal</option>
        <option>Purchase Order</option>
        <option>System</option>
      </select>

      <button className="audit-reset-btn" onClick={onReset}>
        Reset
      </button>
    </div>
  );
};

export default InventoryAuditFilters;
