const StockBatchSelector = ({ batches, value, onChange, error, showError }) => (
  <div className="stocklog-section">
    <label className="stocklog-label">Select Batch *</label>
    <select
      className={`stocklog-select ${showError && error ? 'is-invalid' : ''}`}
      value={value}
      onChange={event => onChange(event.target.value)}
    >
      {batches.map(batch => (
        <option key={batch.id} value={batch.id}>
          {batch.batch_number} ({batch.quantity} left)
          {batch.expiration_date ? ` - Expires: ${batch.expiration_date}` : ''}
        </option>
      ))}
      {batches.length === 0 && <option value="">No batches available</option>}
    </select>
    {showError && error && <p className="stocklog-error-msg">{error}</p>}
    <div className="stocklog-subtext">
      Extra deductions continue from the next oldest batch.
    </div>
  </div>
);

export default StockBatchSelector;
