import React from 'react';
import { calculateEstCost, calculateMargin, calculateProfit } from '../../../../../utils/menu/pricingCalculations';
import AddMenuIngredientRow from './AddMenuIngredientRow';

const AddMenuSinglePrice = ({
  singleRecipe,
  setSingleRecipe,
  setErrorMessage,
  hasAttemptedSubmit,
  errors,
  inventoryItems
}) => {
  /* ─── Handlers ─── */
  const addSingleIngredient = () => {
    setSingleRecipe({
      ...singleRecipe,
      ingredients: [...singleRecipe.ingredients, { id: Date.now(), ingredientId: '', qty: '', unit: '' }]
    });
  };

  const removeSingleIngredient = (id) => {
    if (singleRecipe.ingredients.length <= 1) {
      setErrorMessage('At least one ingredient is required.');
      setTimeout(() => setErrorMessage(''), 3000);
      return;
    }
    setErrorMessage('');
    setSingleRecipe({
      ...singleRecipe,
      ingredients: singleRecipe.ingredients.filter(ing => ing.id !== id)
    });
  };

  const updateSingleIngredient = (id, field, value) => {
    const newIngredients = singleRecipe.ingredients.map(ing => {
      if (ing.id !== id) return ing;
      const updated = { ...ing, [field]: value };
      if (field === 'ingredientId') {
        const ref = inventoryItems.find(i => i.id === value);
        if (ref) updated.unit = ref.base_unit;
      }
      return updated;
    });
    setSingleRecipe({ ...singleRecipe, ingredients: newIngredients });
  };

  /* ─── Calculations ─── */
  const estCost = calculateEstCost(singleRecipe.ingredients, inventoryItems);
  const profit = calculateProfit(singleRecipe.sellingPrice, estCost);
  const margin = calculateMargin(profit, singleRecipe.sellingPrice);

  return (
    <>
      <div className="ami-row">
        <div className="ami-section">
          <label className="ami-label">Selling Price *</label>
          <div className={`ami-currency-wrapper ${hasAttemptedSubmit && errors.sellingPrice ? 'is-invalid-border' : ''}`}>
            <span className="ami-currency-symbol">₱</span>
            <input
              type="number"
              className="ami-input"
              placeholder="0.00"
              value={singleRecipe.sellingPrice}
              onChange={(e) => setSingleRecipe({ ...singleRecipe, sellingPrice: e.target.value })}
              min="0" step="any"
            />
          </div>
          {hasAttemptedSubmit && errors.sellingPrice && <p className="ami-error-text">{errors.sellingPrice}</p>}
        </div>
        <div className="ami-section">
          <label className="ami-label">Est. Cost</label>
          <div className="ami-currency-wrapper">
            <span className="ami-currency-symbol">₱</span>
            <input type="text" className="ami-input" readOnly value={estCost.toFixed(2)} />
          </div>
        </div>
        <div className="ami-section">
          <label className="ami-label">Profit</label>
          <div className="ami-currency-wrapper">
            <span className="ami-currency-symbol">₱</span>
            <input type="text" className="ami-input" readOnly value={profit.toFixed(2)} />
          </div>
        </div>
        <div className="ami-section">
          <label className="ami-label">Margin</label>
          <input type="text" className="ami-input" readOnly value={`${margin.toFixed(2)}%`} />
        </div>
      </div>

      <hr className="ami-divider" />

      <div className="ami-section">
        <label className="ami-label">Recipe / Ingredient Deductions</label>
        <p className="ami-subtext">Select ingredients that will be deducted from inventory when sold.</p>

        <div className="ami-ingredients-table">
          <div className="ami-ingredient-row" style={{ marginBottom: '-0.25rem' }}>
            <label className="ami-label">Ingredient *</label>
            <label className="ami-label">Qty *</label>
            <label className="ami-label">Unit *</label>
            <label className="ami-label">Est. Cost</label>
            <div></div>
          </div>
          {singleRecipe.ingredients.map(ing => (
            <AddMenuIngredientRow
              key={ing.id}
              ing={ing}
              onUpdate={(f, v) => updateSingleIngredient(ing.id, f, v)}
              onRemove={() => removeSingleIngredient(ing.id)}
              idPrefix={`single_ing_${ing.id}`}
              inventoryItems={inventoryItems}
              hasAttemptedSubmit={hasAttemptedSubmit}
              errors={errors}
            />
          ))}
        </div>

        <button className="ami-btn-add-ing" onClick={addSingleIngredient}>
          <i className="bi bi-plus"></i> Add Ingredient
        </button>
      </div>
    </>
  );
};

export default AddMenuSinglePrice;
