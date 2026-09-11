import React from 'react';

const ConversionUnitsSection = ({
  conversions, handleAddConversion, handleRemoveConversion, handleConversionChange,
  unit, getBaseUnitCost, hasAttemptedSubmit
}) => {

  return (
    <div className="inventory-modal-section">
      <h4 className="inventory-modal-section-title">Recipe Conversion Unit</h4>

      {conversions.length > 0 && (
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr auto', gap: '1rem', marginBottom: '0.5rem', alignItems: 'end' }}>
          <label className="inventory-form-label" style={{ marginBottom: 0 }}>Converted Unit *</label>
          <label className="inventory-form-label" style={{ marginBottom: 0 }}>
            Equivalent Amount in {unit || "base unit"} *
          </label>
          <div style={{ width: '32px' }}></div>
        </div>
      )}

      {conversions.map((conv) => {
        const eq = parseFloat(conv.equivalent);
        const isConvUnitEmpty = conv.unit === '';
        const isEqInvalid = isNaN(eq) || eq <= 0;
        const hasInput = !isConvUnitEmpty || conv.equivalent !== '';
        // Also show error if they attempted submit and fields are empty
        const showEmptyError = hasAttemptedSubmit && (isConvUnitEmpty || isEqInvalid);

        let helperText = null;
        if (conv.equivalent && !isNaN(eq) && eq > 0) {
          const baseCost = getBaseUnitCost();
          if (baseCost !== null && baseCost > 0) {
            const convCost = (baseCost * eq).toFixed(2);
            helperText = <span style={{ fontSize: '11px', color: '#666', marginTop: '4px' }}>Cost: ₱{convCost} / {conv.unit || 'unit'}</span>;
          }
        }

        return (
          <div key={conv.id} style={{ display: 'grid', gridTemplateColumns: '1fr 1fr auto', gap: '1rem', alignItems: 'flex-start', marginBottom: '0.5rem' }}>
            <div className="inventory-form-group" style={{ marginBottom: 0 }}>
              <input
                type="text"
                className={`inventory-form-input ${showEmptyError && isConvUnitEmpty ? 'inventory-form-input--error' : ''}`}
                placeholder="e.g. shot, tbsp"
                value={conv.unit}
                onChange={(e) => handleConversionChange(conv.id, 'unit', e.target.value)}
              />
              {showEmptyError && isConvUnitEmpty && (
                <span className="inventory-form-error">Required.</span>
              )}
            </div>
            <div className="inventory-form-group" style={{ marginBottom: 0 }}>
              <input
                type="number"
                min="0"
                step="any"
                className={`inventory-form-input ${showEmptyError && isEqInvalid ? 'inventory-form-input--error' : ''}`}
                placeholder="Enter amount"
                value={conv.equivalent}
                onChange={(e) => handleConversionChange(conv.id, 'equivalent', e.target.value)}
              />
              {helperText}
              {showEmptyError && isEqInvalid && (
                <span className="inventory-form-error">Must be &gt; 0.</span>
              )}
            </div>
            <button
              className="inventory-remove-conv-btn"
              style={{ marginTop: '0', padding: '0.6rem' }}
              onClick={() => handleRemoveConversion(conv.id)}
              title="Remove conversion"
            >
              <i className="bi bi-trash"></i>
            </button>
          </div>
        );
      })}

      <button className="inventory-add-conversion-btn" onClick={handleAddConversion}>
        <i className="bi bi-plus" style={{ marginRight: '0.25rem' }}></i>
        Add conversion unit
      </button>
    </div>
  );
};

export default ConversionUnitsSection;
