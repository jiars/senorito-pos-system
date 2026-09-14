const StockBatchSelector = ({ actionType, batches, value, onChange, error, showError }) => (
  <div className="stocklog-section">
    <label className="stocklog-label">Select Batch *</label>
    <select
      className={`stocklog-select ${showError && error ? 'is-invalid' : ''}`}
      value={value}
      onChange={event => onChange(event.target.value)}
    >
      <option value="" disabled>Select a batch...</option>
      {batches.map(batch => (
        <option
          key={batch.id}
          value={batch.id}
          disabled={actionType === 'wastage' && Number(batch.quantity) <= 0}
        >
          {batch.batch_number} ({batch.quantity} left)
          {batch.expiration_date ? ` - Expires: ${batch.expiration_date}` : ''}
        </option>
      ))}
      {batches.length === 0 && <option value="">No batches available</option>}
    </select>
    {showError && error && <p className="stocklog-error-msg">{error}</p>}
    <div className="stocklog-subtext">
      {actionType === 'wastage'
        ? 'Extra deductions continue by expiration date, then received date.'
        : 'Enter the actual count of this batch. The item total will adjust by the difference.'}
    </div>
  </div>
);

export default StockBatchSelector;
