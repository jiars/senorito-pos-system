import {
  formatAuditLog,
  getAuditActionClass,
  getAuditChangeClass,
  getAuditSourceClass,
} from '../../../../utils/inventory/inventoryAuditLogUtils';

const InventoryAuditTable = ({ logs, isLoading }) => {
  return (
    <div className="audit-table-wrapper">
      <table className="audit-main-table" style={{ tableLayout: 'fixed', minWidth: '1200px' }}>
        <thead>
          <tr>
            <th style={{ width: '110px', textAlign: 'left' }}>Date & Time</th>
            <th style={{ width: '140px', textAlign: 'left' }}>Item</th>
            <th style={{ width: '130px', textAlign: 'left' }}>Action</th>
            <th style={{ width: '120px', textAlign: 'left' }}>Source</th>
            <th style={{ width: '80px' }}>Change</th>
            <th style={{ width: '70px' }}>Before</th>
            <th style={{ width: '70px' }}>After</th>
            <th style={{ width: '90px' }}>Batch</th>
            <th style={{ width: '160px', textAlign: 'left' }}>Reason</th>
            <th style={{ width: '90px', textAlign: 'left' }}>Ref #</th>
            <th style={{ width: '100px', textAlign: 'left' }}>By</th>
          </tr>
        </thead>

        <tbody>
          {isLoading ? (
            <tr>
              <td colSpan="11" className="audit-empty-cell">
                Loading audit logs...
              </td>
            </tr>
          ) : logs.length === 0 ? (
            <tr>
              <td colSpan="11" className="audit-empty-cell">
                No audit logs found.
              </td>
            </tr>
          ) : (
            logs.map((log) => {
              const row = formatAuditLog(log);

              return (
                <tr key={log.id}>
                  <td className="audit-align-left">
                    <div className="audit-date-value">{row.date}</div>
                    <div className="audit-time-value">{row.time}</div>
                  </td>
                  <td className="audit-item-cell">{row.itemName}</td>
                  <td className="audit-align-left">
                    <span className={`audit-chip ${getAuditActionClass(log.action)}`}>
                      {row.action}
                    </span>
                  </td>
                  <td className="audit-align-left">
                    <span className={`audit-chip ${getAuditSourceClass(log.source)}`}>
                      {row.source}
                    </span>
                  </td>
                  <td className={getAuditChangeClass(log.quantity_change)}>{row.change}</td>
                  <td>{row.before}</td>
                  <td>{row.after}</td>
                  <td className="audit-batch-cell">{row.batchNumber}</td>
                  <td className="audit-reason-col">{row.reason}</td>
                  <td className="audit-reference-cell">{row.reference}</td>
                  <td className="audit-align-left">{row.performerName}</td>
                </tr>
              );
            })
          )}
        </tbody>
      </table>
    </div>
  );
};

export default InventoryAuditTable;
