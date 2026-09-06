import React from 'react';

const EditMenuIngredientRow = ({ 
  ing, 
  onUpdate, 
  onRemove, 
  idPrefix, 
  inventoryItems, 
  hasAttemptedSubmit, 
  errors 
}) => {
  let rowCost = 0;
  let availableUnits = [];
  let selectedUnitData = null;

  if (ing.ingredientId) {
    const ref = inventoryItems.find(i => i.id === ing.ingredientId);
    if (ref) {
      // Collect available units
      availableUnits.push({ unit: ref.base_unit, equivalent: 1, label: `${ref.base_unit} (Base)` });
      if (ref.inventory_conversion_units) {
        ref.inventory_conversion_units.forEach(cu => {
          availableUnits.push({ 
            unit: cu.converted_unit, 
            equivalent: Number(cu.equivalent_base_amount), 
            label: cu.converted_unit 
          });
        });
      }

      // Find selected unit for calculation
      selectedUnitData = availableUnits.find(u => u.unit === ing.unit) || availableUnits[0];

      if (ing.qty) {
        const baseQty = (parseFloat(ing.qty) || 0) * (selectedUnitData ? selectedUnitData.equivalent : 1);
        rowCost = baseQty * ref.cost_per_unit;
      }
    }
  }

  return (
    <div className="emi-ingredient-row" key={ing.id}>
      <div className="emi-section">
        <select
          className={`emi-select ${hasAttemptedSubmit && errors[idPrefix + '_id'] ? 'is-invalid' : ''}`}
          value={ing.ingredientId}
          onChange={(e) => onUpdate('ingredientId', e.target.value)}
        >
          <option value="">Select ingredient</option>
          {inventoryItems.map(i => (
            <option key={i.id} value={i.id}>
              {i.item_name} - ₱{i.cost_per_unit}/{i.base_unit}
            </option>
          ))}
        </select>
        {hasAttemptedSubmit && errors[idPrefix + '_id'] && <p className="emi-error-text" style={{ fontSize: '0.65rem' }}>{errors[idPrefix + '_id']}</p>}
      </div>
      <div className="emi-section">
        <input
          type="number"
          className={`emi-input ${hasAttemptedSubmit && errors[idPrefix + '_qty'] ? 'is-invalid' : ''}`}
          placeholder="Qty"
          value={ing.qty}
          onChange={(e) => onUpdate('qty', e.target.value)}
          min="0" step="any"
        />
        {hasAttemptedSubmit && errors[idPrefix + '_qty'] && <p className="emi-error-text" style={{ fontSize: '0.65rem' }}>{errors[idPrefix + '_qty']}</p>}
      </div>
      <div className="emi-section">
        {availableUnits.length > 0 ? (
          <select
            className={`emi-select ${hasAttemptedSubmit && errors[idPrefix + '_unit'] ? 'is-invalid' : ''}`}
            value={ing.unit}
            onChange={(e) => onUpdate('unit', e.target.value)}
          >
            {availableUnits.map(u => (
              <option key={u.unit} value={u.unit}>{u.label}</option>
            ))}
          </select>
        ) : (
          <div className="emi-input" style={{ backgroundColor: '#f0f0f0', display: 'flex', alignItems: 'center' }}>
            -
          </div>
        )}
        {hasAttemptedSubmit && errors[idPrefix + '_unit'] && <p className="emi-error-text" style={{ fontSize: '0.65rem' }}>{errors[idPrefix + '_unit']}</p>}
      </div>
      <div className="emi-section emi-currency-wrapper">
        <span className="emi-currency-symbol">₱</span>
        <input
          type="text"
          className="emi-input"
          readOnly
          value={rowCost > 0 ? rowCost.toFixed(2) : '0.00'}
        />
      </div>
      <button
        className="emi-btn-remove-ing"
        onClick={onRemove}
        title="Remove ingredient"
      >
        <i className="bi bi-x"></i>
      </button>
    </div>
  );
};

export default EditMenuIngredientRow;
