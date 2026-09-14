const InventoryAuditHeader = ({ onExport }) => {
  return (
    <div className="audit-header">
      <div className="layout-page-heading" style={{ marginBottom: 0 }}>
        <h2>Inventory Audit Log</h2>
        <p>Track all inventory changes and adjustments over time.</p>
      </div>

      <div className="audit-actions">
        <button className="audit-btn audit-btn-outline" onClick={onExport}>
          <i className="bi bi-database-down"></i> Export Data
        </button>
      </div>
    </div>
  );
};

export default InventoryAuditHeader;
