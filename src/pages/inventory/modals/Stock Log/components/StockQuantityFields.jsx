const labels = {
  restock: 'Quantity to Add',
  wastage: 'Quantity to Remove',
  correct: 'Actual Batch Count',
};

const StockQuantityFields = ({
  actionType,
  quantity,
  setQuantity,
  previewLabel,
  previewStock,
  previewChange,
  previewTone,
  selectedBatchStock,
  unit,
  error,
  showError,
}) => {
  const spilloverQuantity = Math.max(
    0,
    (Number(quantity) || 0) - selectedBatchStock,
  );

  return (
    <div className="stocklog-section-row">
      <div className="stocklog-section">
        <label className="stocklog-label">{labels[actionType]} *</label>
        <input
          type="number"
          className={`stocklog-input ${showError && error ? 'is-invalid' : ''}`}
          value={quantity}
          onChange={event => setQuantity(event.target.value)}
          placeholder="0"
          min="1"
        />
        {actionType === 'wastage' && (
          <div className="stocklog-subtext">
            {spilloverQuantity > 0
              ? `The selected batch only has ${selectedBatchStock} ${unit}. The remaining ${spilloverQuantity} ${unit} will be deducted from the next available batch.`
              : `Selected batch stock: ${selectedBatchStock} ${unit}. Any excess will continue to the next available batch.`}
          </div>
        )}
        {showError && error && <p className="stocklog-error-msg">{error}</p>}
      </div>
      <div className="stocklog-section">
        <label className="stocklog-label">{previewLabel}</label>
        <div className="stocklog-preview" aria-live="polite">
          <span>{previewStock}</span>
          {previewChange && (
            <span className={`stocklog-preview-change stocklog-preview-change--${previewTone}`}>
              ({previewChange})
            </span>
          )}
        </div>
      </div>
    </div>
  );
};

export default StockQuantityFields;
