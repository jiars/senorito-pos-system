import React from 'react';
import { calculateEstCost, calculateProfit, calculateMargin } from '../../../../../utils/menu/pricingCalculations';
import EditMenuIngredientRow from './EditMenuIngredientRow';
import RecipeStatusBadge from '../../../components/RecipeStatusBadge';

const EditMenuSinglePrice = ({
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

  const removeSingleIngredient = async (id) => {
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
      <div className="emi-row">
        <div className="emi-section">
          <label className="emi-label">Selling Price *</label>
          <div className={`emi-currency-wrapper ${hasAttemptedSubmit && errors.sellingPrice ? 'is-invalid-border' : ''}`}>
            <span className="emi-currency-symbol">₱</span>
            <input
              type="number"
              className="emi-input"
              placeholder="0.00"
              value={singleRecipe.sellingPrice}
              onChange={(e) => setSingleRecipe({ ...singleRecipe, sellingPrice: e.target.value })}
              min="0" step="any"
            />
          </div>
          {hasAttemptedSubmit && errors.sellingPrice && <p className="emi-error-text">{errors.sellingPrice}</p>}
        </div>
        <div className="emi-section">
          <label className="emi-label">Est. Cost</label>
          <div className="emi-currency-wrapper">
            <span className="emi-currency-symbol">₱</span>
            <input type="text" className="emi-input" readOnly value={estCost.toFixed(2)} />
          </div>
        </div>
        <div className="emi-section">
          <label className="emi-label">Profit</label>
          <div className="emi-currency-wrapper">
            <span className="emi-currency-symbol">₱</span>
            <input type="text" className="emi-input" readOnly value={profit.toFixed(2)} />
          </div>
        </div>
        <div className="emi-section">
          <label className="emi-label">Margin</label>
          <input type="text" className="emi-input" readOnly value={`${margin.toFixed(2)}%`} />
        </div>
      </div>

      <hr className="emi-divider" />

      <div className="emi-section">
        <div className="menu-recipe-heading">
          <div>
            <label className="emi-label">Recipe / Ingredient Deductions</label>
            <p className="emi-subtext">Select ingredients that will be deducted from inventory when sold.</p>
          </div>
          <RecipeStatusBadge
            ingredients={singleRecipe.ingredients}
            inventoryItems={inventoryItems}
          />
        </div>

        <div className="emi-ingredients-table">
          <div className="emi-ingredient-row" style={{ marginBottom: '-0.25rem' }}>
            <label className="emi-label">Ingredient *</label>
            <label className="emi-label">Qty *</label>
            <label className="emi-label">Unit *</label>
            <label className="emi-label">Est. Cost</label>
            <div></div>
          </div>
          {singleRecipe.ingredients.map(ing => (
            <EditMenuIngredientRow
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

        <button className="emi-btn-add-ing" onClick={addSingleIngredient}>
          <i className="bi bi-plus"></i> Add Ingredient
        </button>
      </div>
    </>
  );
};

export default EditMenuSinglePrice;
