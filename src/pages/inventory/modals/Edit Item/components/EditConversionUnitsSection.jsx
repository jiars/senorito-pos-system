import React from 'react';

const EditConversionUnitsSection = ({
  conversions,
  unit,
  hasAttemptedSubmit,
  onAdd,
  onRemove,
  onChange
}) => (
  <div className="edit-modal-section">
    <h4 className="edit-modal-section-title">Recipe Conversion Units</h4>

    {conversions.length > 0 && (
      <div className="edit-conversion-header">
        <label className="edit-modal-label">Converted Unit *</label>
        <label className="edit-modal-label">
          Equivalent Amount in {unit || 'base unit'} *
        </label>
        <span />
      </div>
    )}

    {conversions.map((conversion) => {
      const unitEmpty = conversion.unit.trim() === '';
      const equivalent = Number(conversion.equivalent);
      const equivalentInvalid =
        !Number.isFinite(equivalent) || equivalent <= 0;

      return (
        <div className="edit-conversion-row" key={conversion.clientId}>
          <div className="edit-modal-group">
            <input
              type="text"
              className={`edit-modal-input ${hasAttemptedSubmit && unitEmpty ? 'is-invalid' : ''}`}
              placeholder="e.g. shot, tbsp"
              value={conversion.unit}
              onChange={(event) => onChange(
                conversion.clientId,
                'unit',
                event.target.value
              )}
            />
            {hasAttemptedSubmit && unitEmpty && (
              <p className="edit-modal-error-msg">Required.</p>
            )}
          </div>

          <div className="edit-modal-group">
            <input
              type="number"
              min="0"
              step="any"
              className={`edit-modal-input ${hasAttemptedSubmit && equivalentInvalid ? 'is-invalid' : ''}`}
              placeholder="Enter amount"
              value={conversion.equivalent}
              onChange={(event) => onChange(
                conversion.clientId,
                'equivalent',
                event.target.value
              )}
            />
            {hasAttemptedSubmit && equivalentInvalid && (
              <p className="edit-modal-error-msg">Must be &gt; 0.</p>
            )}
          </div>

          <button
            type="button"
            className="edit-conversion-remove"
            onClick={() => onRemove(conversion.clientId)}
            title="Remove"
          >
            <i className="bi bi-trash" />
          </button>
        </div>
      );
    })}

    <button
      type="button"
      className="edit-conversion-add"
      onClick={onAdd}
    >
      <i className="bi bi-plus" />
      Add conversion unit
    </button>
  </div>
);

export default EditConversionUnitsSection;
