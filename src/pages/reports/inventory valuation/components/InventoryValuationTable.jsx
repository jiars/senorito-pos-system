const formatCurrency = (value) => {
  return Number(value).toLocaleString(undefined, {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  });
};

const InventoryValuationTable = ({
  items,
  filteredTotal,
  totalValuation,
  isLoading,
}) => {
  const filteredPercent =
    totalValuation > 0
      ? ((filteredTotal / totalValuation) * 100).toFixed(1)
      : '0.0';

  return (
    <div className="val-panel">
      <div className="val-table-header-row">
        <div className="val-table-title">
          <i className="bi bi-table"></i> All Items
        </div>
        <div className="val-table-summary-info">
          Showing {items.length} items | Filtered total:{' '}
          <strong>₱{formatCurrency(filteredTotal)}</strong>
        </div>
      </div>

      <div className="val-table-wrapper">
        <table className="val-main-table">
          <thead>
            <tr>
              <th>Item</th>
              <th>Category</th>
              <th>Stock</th>
              <th>Unit</th>
              <th>Reorder</th>
              <th>Cost/Unit</th>
              <th>Total Value</th>
              <th>% Of Total</th>
            </tr>
          </thead>
          <tbody>
            {isLoading ? (
              <tr>
                <td colSpan="8" className="val-empty-cell">
                  Loading valuation data...
                </td>
              </tr>
            ) : items.length === 0 ? (
              <tr>
                <td colSpan="8" className="val-empty-cell">
                  No items found.
                </td>
              </tr>
            ) : (
              <>
                {items.map((item) => (
                  <tr key={item.id}>
                    <td>{item.item}</td>
                    <td>{item.category}</td>
                    <td>{item.stock}</td>
                    <td>{item.unit}</td>
                    <td>{item.minimum}</td>
                    <td>₱{formatCurrency(item.cost)}</td>
                    <td className="val-value-cell">
                      ₱{formatCurrency(item.value)}
                    </td>
                    <td>{item.pct}%</td>
                  </tr>
                ))}
                <tr className="val-main-table-grand">
                  <td colSpan="6">FILTERED TOTAL</td>
                  <td>₱{formatCurrency(filteredTotal)}</td>
                  <td>{filteredPercent}%</td>
                </tr>
              </>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default InventoryValuationTable;
