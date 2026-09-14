const InventoryValuationHeader = ({ onExport, onPrint }) => {
  const currentDate = new Date().toLocaleString('en-US', {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
    hour: 'numeric',
    minute: '2-digit',
  });

  return (
    <div className="val-header">
      <div className="layout-page-heading" style={{ marginBottom: 0 }}>
        <h2>Inventory Valuation Report</h2>
        <p>Current as of {currentDate}</p>
      </div>

      <div className="val-actions">
        <button className="val-btn val-btn-outline" onClick={onExport}>
          <i className="bi bi-database-down"></i> Export Data
        </button>
        <button className="val-btn val-btn-primary" onClick={onPrint}>
          <i className="bi bi-printer"></i> Print
        </button>
      </div>
    </div>
  );
};

export default InventoryValuationHeader;
