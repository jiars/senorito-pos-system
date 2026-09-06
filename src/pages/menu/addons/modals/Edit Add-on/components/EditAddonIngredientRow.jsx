import React from 'react';

const EditAddonIngredientRow = ({ ing, dbIngredients, updateIngredient, removeIngredient, errors, hasAttemptedSubmit }) => {
  let rowCost = 0;
  let availableUnits = [];
  let selectedUnitData = null;

  if (ing.ingredientId) {
    const ref = dbIngredients.find(i => i.id === ing.ingredientId);
    if (ref) {
      availableUnits.push({ unit: ref.base_unit, equivalent: 1, label: `${ref.base_unit} (Base)` });
      if (ref.inventory_conversion_units) {
        ref.inventory_conversion_units.forEach(cu => {
          availableUnits.push({ unit: cu.converted_unit, equivalent: Number(cu.equivalent_base_amount), label: cu.converted_unit });
        });
      }
      
      selectedUnitData = availableUnits.find(u => u.unit === ing.unit) || availableUnits[0];

      if (ing.qty) {
        const baseQty = (parseFloat(ing.qty) || 0) * (selectedUnitData ? selectedUnitData.equivalent : 1);
        rowCost = baseQty * ref.cost_per_unit;
      }
    }
  }

  return (
    <div className="eao-ingredient-row" key={ing.id}>
      <div style={{ display: 'flex', flexDirection: 'column' }}>
        <select
          className={`eao-select ${hasAttemptedSubmit && errors[`ing_${ing.id}_id`] ? 'is-invalid' : ''}`}
          value={ing.ingredientId}
          onChange={(e) => updateIngredient(ing.id, 'ingredientId', e.target.value)}
        >
          <option value="">Select ingredient</option>
          {dbIngredients.map(i => (
            <option key={i.id} value={i.id}>
              {i.item_name} - ₱{i.cost_per_unit}/{i.base_unit}
            </option>
          ))}
        </select>
        {hasAttemptedSubmit && errors[`ing_${ing.id}_id`] && <p className="eao-error-text" style={{ fontSize: '0.65rem' }}>{errors[`ing_${ing.id}_id`]}</p>}
      </div>
      <div style={{ display: 'flex', flexDirection: 'column' }}>
        <input
          type="number"
          className={`eao-input ${hasAttemptedSubmit && errors[`ing_${ing.id}_qty`] ? 'is-invalid' : ''}`}
          placeholder="Qty"
          value={ing.qty}
          onChange={(e) => {
            const val = e.target.value;
            if (val === '' || parseFloat(val) >= 0) {
              updateIngredient(ing.id, 'qty', val);
            }
          }}
          onKeyDown={(e) => {
            if (e.key === '-' || e.key === 'e') e.preventDefault();
          }}
          min="0" step="any"
        />
        {hasAttemptedSubmit && errors[`ing_${ing.id}_qty`] && <p className="eao-error-text" style={{ fontSize: '0.65rem' }}>{errors[`ing_${ing.id}_qty`]}</p>}
      </div>
      <div style={{ display: 'flex', flexDirection: 'column' }}>
        {availableUnits.length > 0 ? (
          <select
            className={`eao-select ${hasAttemptedSubmit && errors[`ing_${ing.id}_unit`] ? 'is-invalid' : ''}`}
            value={ing.unit}
            onChange={(e) => updateIngredient(ing.id, 'unit', e.target.value)}
          >
            {availableUnits.map(u => (
              <option key={u.unit} value={u.unit}>{u.label}</option>
            ))}
          </select>
        ) : (
          <input
            type="text"
            className="eao-input"
            readOnly
            value="-"
            style={{ backgroundColor: '#f5f5f5', color: '#666' }}
          />
        )}
        {hasAttemptedSubmit && errors[`ing_${ing.id}_unit`] && <p className="eao-error-text" style={{ fontSize: '0.65rem' }}>{errors[`ing_${ing.id}_unit`]}</p>}
      </div>
      <div className="eao-currency-wrapper">
        <span className="eao-currency-symbol">₱</span>
        <input
          type="text"
          className="eao-input"
          readOnly
          value={rowCost > 0 ? rowCost.toFixed(2) : '0.00'}
        />
      </div>
      <button
        className="eao-btn-remove-ing"
        onClick={() => removeIngredient(ing.id)}
        title="Remove ingredient"
      >
        <i className="bi bi-x"></i>
      </button>
    </div>
  );
};

export default EditAddonIngredientRow;
