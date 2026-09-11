const labels = {
  restock: 'Quantity to Add',
  wastage: 'Quantity to Remove',
  correct: 'Actual Physical Count',
};

const StockQuantityFields = ({
  actionType,
  quantity,
  setQuantity,
  previewLabel,
  previewValue,
  error,
  showError,
}) => (
  <div className="stocklog-section-row">
    <div className="stocklog-section">
      <label className="stocklog-label">{labels[actionType]} *</label>
      <input
        type="number"
        className={`stocklog-input ${showError && error ? 'is-invalid' : ''}`}
        value={quantity}
        onChange={event => setQuantity(event.target.value)}
        placeholder="0"
        min="0"
      />
      {showError && error && <p className="stocklog-error-msg">{error}</p>}
    </div>
    <div className="stocklog-section">
      <label className="stocklog-label">{previewLabel}</label>
      <input type="text" className="stocklog-input" value={previewValue} readOnly />
    </div>
  </div>
);

export default StockQuantityFields;
