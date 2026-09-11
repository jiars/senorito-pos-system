const reasonOptions = {
  restock: ['Initial Stock', 'Supplier Delivery', 'Manual Stock Addition', 'Owner Adjustment'],
  wastage: ['Expired', 'Spoiled', 'Damaged', 'Spillage', 'Wrong Preparation', 'Burnt / Overcooked', 'Contaminated', 'Customer Return', 'Overproduction', 'Storage Issue', 'Missing Item'],
  correct: ['Physical Count Mismatch', 'Encoding Error', 'Unit Conversion Error', 'Duplicate Entry Correction', 'Unrecorded Stock Movement', 'System Sync Error', 'Batch Count Correction', 'Audit Adjustment'],
};

const StockReasonFields = ({
  actionType,
  reason,
  setReason,
  isCustomReason,
  setIsCustomReason,
  notes,
  setNotes,
  error,
  showError,
}) => {
  const handleReasonChange = event => {
    if (event.target.value === 'Others') {
      setIsCustomReason(true);
      setReason('');
      return;
    }
    setReason(event.target.value);
  };

  return (
    <div className="stocklog-section-row">
      <div className="stocklog-section">
        <label className="stocklog-label">Reason *</label>
        {isCustomReason ? (
          <div className="stocklog-custom-reason">
            <input
              type="text"
              className={`stocklog-input ${showError && error ? 'is-invalid' : ''}`}
              value={reason}
              onChange={event => setReason(event.target.value)}
              placeholder="Others (please specify)"
              autoFocus
            />
            <button
              type="button"
              className="stocklog-btn-cancel stocklog-custom-reason-cancel"
              onClick={() => {
                setIsCustomReason(false);
                setReason('');
              }}
              title="Cancel custom reason"
            >
              <i className="bi bi-x-lg" />
            </button>
          </div>
        ) : (
          <select
            className={`stocklog-select ${showError && error ? 'is-invalid' : ''}`}
            value={reason}
            onChange={handleReasonChange}
          >
            <option value="" disabled>Select reason...</option>
            {reasonOptions[actionType].map(option => (
              <option key={option} value={option}>{option}</option>
            ))}
            <option value="Others">Others (Please specify)</option>
          </select>
        )}
        {showError && error && <p className="stocklog-error-msg">{error}</p>}
      </div>
      <div className="stocklog-section">
        <label className="stocklog-label">
          {actionType === 'restock' ? 'Supplier (Optional)' : 'Notes (Optional)'}
        </label>
        <input
          type="text"
          className="stocklog-input"
          value={notes}
          onChange={event => setNotes(event.target.value)}
          placeholder="Enter details..."
        />
      </div>
    </div>
  );
};

export default StockReasonFields;
