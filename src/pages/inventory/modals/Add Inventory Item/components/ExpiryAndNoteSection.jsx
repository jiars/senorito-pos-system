import React from 'react';

const ExpiryAndNoteSection = ({
  trackExpiry, handleExpiryToggle,
  expiryDate, setExpiryDate,
  note, setNote,
  hasAttemptedSubmit, isExpiryValid, isExpiryEmpty, hasValidFutureDate
}) => {
  return (
    <div className="inventory-modal-section" style={{ borderBottom: 'none' }}>
      <div className="inventory-switch-group">
        <label className="inventory-switch">
          <input
            type="checkbox"
            checked={trackExpiry}
            onChange={handleExpiryToggle}
          />
          <span className="inventory-switch-slider"></span>
        </label>
        <span className="inventory-switch-label">
          <i className="bi bi-calendar-check"></i>
          Track Expiry for this item
        </span>
      </div>

      {trackExpiry && (
        <div className="inventory-form-group" style={{ marginTop: '0.5rem' }}>
          <label className="inventory-form-label">Expiration Date *</label>
          <div className="inventory-date-input-wrapper">
            <input
              type="date"
              className={`inventory-form-input ${hasAttemptedSubmit && (!isExpiryValid) ? 'inventory-form-input--error' : ''}`}
              value={expiryDate}
              onChange={(e) => setExpiryDate(e.target.value)}
            />
            {hasAttemptedSubmit && isExpiryEmpty && (
              <span className="inventory-form-error">Expiration date is required.</span>
            )}
            {hasAttemptedSubmit && !isExpiryEmpty && !hasValidFutureDate && (
              <span className="inventory-form-error">Enter a valid future expiration date.</span>
            )}
          </div>
        </div>
      )}

      <div className="inventory-form-group" style={{ marginTop: '0.5rem' }}>
        <label className="inventory-form-label">Note (optional)</label>
        <input
          type="text"
          className="inventory-form-input"
          placeholder="Add a note for this inventory item"
          value={note}
          onChange={(e) => setNote(e.target.value)}
        />
      </div>
    </div>
  );
};

export default ExpiryAndNoteSection;
