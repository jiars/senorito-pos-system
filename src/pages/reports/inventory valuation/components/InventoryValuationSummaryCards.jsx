const formatCurrency = (value) => {
  return Number(value).toLocaleString(undefined, {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  });
};

const InventoryValuationSummaryCards = ({
  totalValuation,
  itemCount,
  categoryCount,
}) => (
  <div className="val-summary-cards">
    <div className="val-summary-card val-card--brown">
      <div className="val-summary-card-icon">
        <i className="bi bi-currency-dollar"></i>
      </div>
      <p className="val-card-value">₱{formatCurrency(totalValuation)}</p>
      <p className="val-card-label">Total Inventory Value</p>
    </div>

    <div className="val-summary-card val-card--blue">
      <div className="val-summary-card-icon">
        <i className="bi bi-box-seam"></i>
      </div>
      <p className="val-card-value">{itemCount}</p>
      <p className="val-card-label">Items</p>
    </div>

    <div className="val-summary-card val-card--green">
      <div className="val-summary-card-icon">
        <i className="bi bi-tags"></i>
      </div>
      <p className="val-card-value">{categoryCount}</p>
      <p className="val-card-label">Categories</p>
    </div>
  </div>
);

export default InventoryValuationSummaryCards;
