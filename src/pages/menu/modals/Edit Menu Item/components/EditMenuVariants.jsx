import React from 'react';
import { calculateEstCost, calculateProfit, calculateMargin } from '../../../../../utils/menu/pricingCalculations';
import EditMenuIngredientRow from './EditMenuIngredientRow';
import RecipeStatusBadge from '../../../components/RecipeStatusBadge';

const EditMenuVariants = ({
  variants,
  setVariants,
  setErrorMessage,
  hasAttemptedSubmit,
  errors,
  inventoryItems
}) => {
  /* ─── Handlers ─── */
  const addVariant = () => {
    setVariants([
      ...variants,
      {
        id: Date.now(),
        name: '',
        isAvailable: true,
        sellingPrice: '',
        ingredients: [{ id: Date.now() + 1, ingredientId: '', qty: '', unit: '' }]
      }
    ]);
  };

  const removeVariant = (vid) => {
    if (variants.length <= 1) {
      setErrorMessage('At least one variant/size is required.');
      setTimeout(() => setErrorMessage(''), 3000);
      return;
    }
    setErrorMessage('');
    setVariants(variants.filter(v => v.id !== vid));
  };

  const updateVariant = (vid, field, value) => {
    setVariants(variants.map(v => v.id === vid ? { ...v, [field]: value } : v));
  };

  const addVariantIngredient = (vid) => {
    setVariants(variants.map(v => {
      if (v.id !== vid) return v;
      return {
        ...v,
        ingredients: [...v.ingredients, { id: Date.now(), ingredientId: '', qty: '', unit: '' }]
      };
    }));
  };

  const removeVariantIngredient = async (vid, iid) => {
    const variant = variants.find(v => v.id === vid);
    if (variant && variant.ingredients.length <= 1) {
      setErrorMessage('At least one ingredient is required per variant.');
      setTimeout(() => setErrorMessage(''), 3000);
      return;
    }

    setErrorMessage('');
    setVariants(variants.map(v => {
      if (v.id !== vid) return v;
      return {
        ...v,
        ingredients: v.ingredients.filter(ing => ing.id !== iid)
      };
    }));
  };

  const updateVariantIngredient = (vid, iid, field, value) => {
    setVariants(variants.map(v => {
      if (v.id !== vid) return v;
      const newIngs = v.ingredients.map(ing => {
        if (ing.id !== iid) return ing;
        const updated = { ...ing, [field]: value };
        if (field === 'ingredientId') {
          const ref = inventoryItems.find(i => i.id === value);
          if (ref) updated.unit = ref.base_unit;
        }
        return updated;
      });
      return { ...v, ingredients: newIngs };
    }));
  };

  return (
    <div className="emi-variants-list">
      {variants.map((v) => {
        const estCost = calculateEstCost(v.ingredients, inventoryItems);
        const profit = calculateProfit(v.sellingPrice, estCost);
        const margin = calculateMargin(profit, v.sellingPrice);

        return (
          <div className="emi-variant-card" key={v.id}>
            <div className="emi-variant-header">
              <div className="emi-section">
                <label className="emi-label">Size/ Variant Name *</label>
                <input
                  type="text"
                  className={`emi-input ${hasAttemptedSubmit && errors[`variant_${v.id}_name`] ? 'is-invalid' : ''}`}
                  placeholder="e.g. 16oz"
                  value={v.name}
                  onChange={(e) => updateVariant(v.id, 'name', e.target.value)}
                />
                {hasAttemptedSubmit && errors[`variant_${v.id}_name`] && <p className="emi-error-text">{errors[`variant_${v.id}_name`]}</p>}
              </div>
              <div className="emi-section" style={{ alignSelf: 'center', marginTop: '1.25rem' }}>
                <label className="emi-toggle-container">
                  <input
                    type="checkbox"
                    style={{ display: 'none' }}
                    checked={v.isAvailable}
                    onChange={(e) => updateVariant(v.id, 'isAvailable', e.target.checked)}
                  />
                  <span className="emi-toggle-switch">
                    <span className="emi-toggle-slider"></span>
                  </span>
                  <span className="emi-toggle-label" style={{ fontSize: '0.75rem' }}>Available for sale</span>
                </label>
              </div>
              {!String(v.id).includes('-') && (
                <button
                  className="emi-btn-remove-variant"
                  onClick={() => removeVariant(v.id)}
                  disabled={variants.length === 1}
                  title={variants.length === 1 ? "At least one variant required" : "Remove variant"}
                  style={{ opacity: variants.length === 1 ? 0.5 : 1 }}
                >
                  <i className="bi bi-trash"></i>
                </button>
              )}
            </div>

            <div className="emi-row">
              <div className="emi-section">
                <label className="emi-label">Selling Price *</label>
                <div className={`emi-currency-wrapper ${hasAttemptedSubmit && errors[`variant_${v.id}_price`] ? 'is-invalid-border' : ''}`}>
                  <span className="emi-currency-symbol">₱</span>
                  <input
                    type="number"
                    className="emi-input"
                    placeholder="0.00"
                    value={v.sellingPrice}
                    onChange={(e) => updateVariant(v.id, 'sellingPrice', e.target.value)}
                    min="0" step="any"
                  />
                </div>
                {hasAttemptedSubmit && errors[`variant_${v.id}_price`] && <p className="emi-error-text">{errors[`variant_${v.id}_price`]}</p>}
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

            <div className="emi-section">
              <div className="menu-recipe-heading">
                <div>
                  <label className="emi-label">Recipe / Ingredient Deductions</label>
                  <p className="emi-subtext">Select ingredients that will be deducted from inventory when sold.</p>
                </div>
                <RecipeStatusBadge
                  ingredients={v.ingredients}
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
                {v.ingredients.map(ing => (
                  <EditMenuIngredientRow
                    key={ing.id}
                    ing={ing}
                    onUpdate={(f, val) => updateVariantIngredient(v.id, ing.id, f, val)}
                    onRemove={() => removeVariantIngredient(v.id, ing.id)}
                    idPrefix={`var_${v.id}_ing_${ing.id}`}
                    inventoryItems={inventoryItems}
                    hasAttemptedSubmit={hasAttemptedSubmit}
                    errors={errors}
                  />
                ))}
              </div>

              <button className="emi-btn-add-ing" onClick={() => addVariantIngredient(v.id)}>
                <i className="bi bi-plus"></i> Add Ingredient
              </button>
            </div>
          </div>
        );
      })}

      <button className="emi-btn-add-variant" onClick={addVariant}>
        Add Variant/Size
      </button>
    </div>
  );
};

export default EditMenuVariants;
