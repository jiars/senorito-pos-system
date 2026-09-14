const formatCurrency = (value) => {
  return Number(value).toLocaleString(undefined, {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  });
};

const InventoryValuationPrintLayout = ({
  items,
  categorySummary,
  searchTerm,
  category,
  sort,
  filteredTotal,
}) => {
  const generatedDate = new Date().toLocaleDateString('en-US', {
    month: 'long',
    day: 'numeric',
    year: 'numeric',
  });

  return (
    <div className="val-print-layout">
      <div className="print-val-header-container">
        <div className="print-val-title-row">
          <h2>Inventory Valuation Report</h2>
          <div className="print-val-meta">
            <span className="print-brand">SEÑORITO CAFÉ</span>
            <span>Generated: {generatedDate}</span>
            <span>Total Items: {items.length}</span>
          </div>
        </div>

        <div className="print-val-filters-box">
          <span><strong>Search:</strong> {searchTerm || 'None'}</span>
          <span><strong>Category:</strong> {category}</span>
          <span><strong>Total Value:</strong> ₱{formatCurrency(filteredTotal)}</span>
          <span><strong>Sort By:</strong> {sort.replace('Sort: ', '')}</span>
        </div>
      </div>

      <section className="print-val-section">
        <h3>Category Summary</h3>
        <table className="val-print-table">
          <thead>
            <tr>
              <th>Category</th>
              <th className="print-align-right">Value</th>
              <th className="print-align-right">% Of Total</th>
            </tr>
          </thead>
          <tbody>
            {categorySummary.length === 0 ? (
              <tr>
                <td colSpan="3" className="print-empty-cell">No data</td>
              </tr>
            ) : (
              categorySummary.map((summary) => (
                <tr key={summary.category}>
                  <td>{summary.category}</td>
                  <td className="print-align-right">
                    ₱{formatCurrency(summary.value)}
                  </td>
                  <td className="print-align-right">{summary.pct}%</td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </section>

      <section className="print-val-section">
        <h3>Detailed Items List</h3>
        <table className="val-print-table">
          <thead>
            <tr>
              <th>Item</th>
              <th>Category</th>
              <th>Stock</th>
              <th>Unit</th>
              <th>Cost/Unit</th>
              <th className="print-align-right">Total Value</th>
            </tr>
          </thead>
          <tbody>
            {items.length === 0 ? (
              <tr>
                <td colSpan="6" className="print-empty-cell">No items found.</td>
              </tr>
            ) : (
              <>
                {items.map((item) => (
                  <tr key={item.id}>
                    <td>{item.item}</td>
                    <td>{item.category}</td>
                    <td>{item.stock}</td>
                    <td>{item.unit}</td>
                    <td>₱{formatCurrency(item.cost)}</td>
                    <td className="print-align-right print-value-cell">
                      ₱{formatCurrency(item.value)}
                    </td>
                  </tr>
                ))}
                <tr className="val-print-table-grand">
                  <td colSpan="5" className="print-total-label">TOTAL VALUE</td>
                  <td className="print-total-value">
                    ₱{formatCurrency(filteredTotal)}
                  </td>
                </tr>
              </>
            )}
          </tbody>
        </table>
      </section>

      <div className="print-footer">
        Señorito Café — Point of Sale & Inventory Management System |
        {' '}Inventory Valuation Report | Generated {generatedDate}
      </div>
    </div>
  );
};

export default InventoryValuationPrintLayout;
