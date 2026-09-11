const RestockFields = ({
  totalCost,
  setTotalCost,
  expirationDate,
  setExpirationDate,
  isExpiryTracked,
  errors,
  showErrors,
}) => (
  <div className="stocklog-section-row">
      <div className="stocklog-section">
        <label className="stocklog-label">Total Cost (Amount Paid) *</label>
        <input
          type="number"
          className={`stocklog-input ${showErrors && errors.totalCost ? 'is-invalid' : ''}`}
          value={totalCost}
          onChange={event => setTotalCost(event.target.value)}
          placeholder="₱ 0.00"
          min="0"
        />
        {showErrors && errors.totalCost && <p className="stocklog-error-msg">{errors.totalCost}</p>}
      </div>
      <div className="stocklog-section">
        <label className="stocklog-label">
          Expiration Date {isExpiryTracked ? '*' : '(Optional)'}
        </label>
        <input
          type="date"
          className={`stocklog-input ${showErrors && errors.expirationDate ? 'is-invalid' : ''}`}
          value={expirationDate}
          onChange={event => setExpirationDate(event.target.value)}
        />
        {showErrors && errors.expirationDate && <p className="stocklog-error-msg">{errors.expirationDate}</p>}
      </div>
  </div>
);

export default RestockFields;
