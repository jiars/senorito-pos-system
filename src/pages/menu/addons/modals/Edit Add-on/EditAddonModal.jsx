import React, { useState, useEffect } from 'react';
import './editAddonModal.css';

import { updateAddon } from '../../../../../services/menu/addonsService';

import { fetchInventoryItems } from '../../../../../services/inventory/inventoryItemsService';

const EditAddonModal = ({ isOpen, onClose, addon, refetchAddons, categories = [] }) => {
  const [addonName, setAddonName] = useState('');
  const [sellingPrice, setSellingPrice] = useState('');
  const [selectedCategories, setSelectedCategories] = useState([]);
  const [ingredients, setIngredients] = useState([]);
  const [isAvailable, setIsAvailable] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [dbIngredients, setDbIngredients] = useState([]);
  
  const [hasAttemptedSubmit, setHasAttemptedSubmit] = useState(false);
  const [errors, setErrors] = useState({});
  const [errorMessage, setErrorMessage] = useState('');

  React.useEffect(() => {
    const loadInventory = async () => {
      try {
        const items = await fetchInventoryItems();
        setDbIngredients(items || []);
      } catch (error) {
        console.error("Failed to load inventory items:", error);
      }
    };
    if (isOpen) loadInventory();
  }, [isOpen]);

  useEffect(() => {
    if (isOpen && addon) {
      setHasAttemptedSubmit(false);
      setErrors({});
      setErrorMessage('');
      setIsSubmitting(false);

      setAddonName(addon.addon_name || '');
      setSellingPrice(addon.selling_price !== undefined ? addon.selling_price.toString() : '');
      setIsAvailable(addon.pos_status === 'Available');

      const catIds = [];
      if (addon.addon_categories) {
        for (let i = 0; i < addon.addon_categories.length; i++) {
          if (addon.addon_categories[i].menu_category_id) {
            catIds.push(addon.addon_categories[i].menu_category_id);
          }
        }
      }
      setSelectedCategories(catIds);

      if (addon.addon_recipes && addon.addon_recipes.length > 0) {
        setIngredients(addon.addon_recipes.map(recipe => ({
          id: recipe.id,
          ingredientId: recipe.inventory_item_id,
          qty: recipe.quantity.toString(),
          unit: recipe.unit || (recipe.inventory_items ? recipe.inventory_items.base_unit : '')
        })));
      } else {
        setIngredients([
          { id: Date.now(), ingredientId: '', qty: '', unit: '' }
        ]);
      }
    }
  }, [isOpen, addon]);

  /* ─── Math Helpers ─── */
  const calculateEstCost = () => {
    return ingredients.reduce((total, ing) => {
      if (!ing.ingredientId || !ing.qty) return total;
      const ref = dbIngredients.find(i => i.id === ing.ingredientId);
      if (!ref) return total;

      let equivalent = 1;
      if (ing.unit && ing.unit !== ref.base_unit) {
        const conv = ref.inventory_conversion_units?.find(cu => cu.converted_unit === ing.unit);
        if (conv) equivalent = Number(conv.equivalent_base_amount);
      }

      const parsedQty = parseFloat(ing.qty) || 0;
      const baseQty = parsedQty * equivalent;
      return total + (baseQty * ref.cost_per_unit);
    }, 0);
  };

  const estCost = calculateEstCost();

  const calculateProfit = () => {
    const sp = parseFloat(sellingPrice) || 0;
    return sp - estCost;
  };

  const profit = calculateProfit();

  const calculateMargin = () => {
    const sp = parseFloat(sellingPrice) || 0;
    if (sp === 0) return 0;
    return (profit / sp) * 100;
  };

  const margin = calculateMargin();

  /* ─── Validation ─── */
  React.useEffect(() => {
    if (!isOpen) return;
    const newErrors = {};

    if (!addonName.trim()) newErrors.addonName = 'Add-on name is required.';
    if (!sellingPrice) {
      newErrors.sellingPrice = 'Price required.';
    } else if (Number(sellingPrice) <= 0) {
      newErrors.sellingPrice = 'Must be > 0.';
    }
    if (selectedCategories.length === 0) newErrors.categories = 'Select at least one category.';

    ingredients.forEach(ing => {
      if (!ing.ingredientId) newErrors[`ing_${ing.id}_id`] = 'Required.';
      if (!ing.qty) newErrors[`ing_${ing.id}_qty`] = 'Required.';
      if (!ing.unit) newErrors[`ing_${ing.id}_unit`] = 'Required.';
    });

    setErrors(newErrors);
  }, [addonName, sellingPrice, selectedCategories, ingredients, isOpen]);

  const isFormValid = Object.keys(errors).length === 0;

  /* ─── Handlers ─── */
  const toggleCategory = (catId) => {
    if (selectedCategories.includes(catId)) {
      setSelectedCategories(selectedCategories.filter(id => id !== catId));
    } else {
      setSelectedCategories([...selectedCategories, catId]);
    }
  };

  const handleSaveEdit = async () => {
    setHasAttemptedSubmit(true);
    if (!addon || isSubmitting || !isFormValid) return;
    setIsSubmitting(true);
    setErrorMessage('');

    try {
      const addonPayload = {
        addon_name: addonName.trim(),
        selling_price: parseFloat(sellingPrice) || 0,
        estimated_cost: estCost,
        profit: profit,
        margin: margin,
        pos_status: isAvailable ? 'Available' : 'Unavailable',
        archived: isAvailable ? false : (addon.archived !== undefined ? addon.archived : false)
      };

      const recipePayload = ingredients
        .filter(ing => ing.ingredientId && ing.qty)
        .map(ing => {
          const ref = dbIngredients.find(i => i.id === ing.ingredientId);
          let equivalent = 1;
          if (ing.unit && ing.unit !== ref?.base_unit) {
            const conv = ref?.inventory_conversion_units?.find(cu => cu.converted_unit === ing.unit);
            if (conv) equivalent = Number(conv.equivalent_base_amount);
          }
          const baseQty = parseFloat(ing.qty) * equivalent;

          return {
            inventory_item_id: ing.ingredientId,
            quantity: parseFloat(ing.qty),
            unit: ing.unit || ref?.base_unit,
            estimated_cost: baseQty * (ref ? ref.cost_per_unit : 0)
          };
        });

      await updateAddon(addon.id, addonPayload, selectedCategories, recipePayload);
      if (refetchAddons) {
        await refetchAddons();
      }
      onClose();
    } catch (error) {
      console.error('Failed to update addon:', error);
      setErrorMessage(error.message || 'An error occurred while saving the addon.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const addIngredient = () => {
    setIngredients([
      ...ingredients,
      { id: Date.now(), ingredientId: '', qty: '', unit: '' }
    ]);
  };

  const removeIngredient = (id) => {
    if (ingredients.length <= 1) {
      setErrorMessage('At least one ingredient is required.');
      setTimeout(() => setErrorMessage(''), 3000);
      return;
    }
    setErrorMessage('');
    setIngredients(ingredients.filter(ing => ing.id !== id));
  };

  const updateIngredient = (id, field, value) => {
    setIngredients(ingredients.map(ing => {
      if (ing.id !== id) return ing;
      const updated = { ...ing, [field]: value };
      if (field === 'ingredientId') {
        const ref = dbIngredients.find(i => i.id === value);
        if (ref) updated.unit = ref.base_unit;
      }
      return updated;
    }));
  };

  /* ─── Renderers ─── */
  const renderIngredientRow = (ing) => {
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

  if (!isOpen) return null;

  return (
    <div className="eao-modal-overlay">
      <div className="eao-modal-content">

        {/* Header */}
        <div className="eao-modal-header">
          <h3>Edit Add-on</h3>
          <button className="eao-modal-close" onClick={onClose}>
            <i className="bi bi-x-lg"></i>
          </button>
        </div>

        {/* Body */}
        <div className="eao-modal-body">

          <div className="eao-top-grid">

            {/* Left Column */}
            <div>
              <div className="eao-section">
                <label className="eao-label">Add-on Name *</label>
                <input
                  type="text"
                  className={`eao-input ${hasAttemptedSubmit && errors.addonName ? 'is-invalid' : ''}`}
                  placeholder="e.g. Extra Shot"
                  value={addonName}
                  onChange={(e) => setAddonName(e.target.value)}
                />
                {hasAttemptedSubmit && errors.addonName && <p className="eao-error-text">{errors.addonName}</p>}
              </div>

              {/* Available Toggle */}
              <div className="eao-section" style={{ marginTop: '0.75rem' }}>
                <label className="eao-toggle-container">
                  <input
                    type="checkbox"
                    style={{ display: 'none' }}
                    checked={isAvailable}
                    onChange={(e) => setIsAvailable(e.target.checked)}
                  />
                  <span className="eao-toggle-switch">
                    <span className="eao-toggle-slider"></span>
                  </span>
                  <span className="eao-toggle-label">Available for sale</span>
                </label>
              </div>

              <div className="eao-section">
                <label className="eao-label">Apply to Categories *</label>
                <div className={`eao-categories-list ${hasAttemptedSubmit && errors.categories ? 'is-invalid-border' : ''}`} style={hasAttemptedSubmit && errors.categories ? { padding: '0.5rem', borderRadius: '6px' } : {}}>
                  {categories.map((cat) => (
                    <label className="eao-checkbox-label" key={cat.id}>
                      <input
                        type="checkbox"
                        checked={selectedCategories.includes(cat.id)}
                        onChange={() => toggleCategory(cat.id)}
                      />
                      {cat.category_name}
                    </label>
                  ))}
                </div>
                {hasAttemptedSubmit && errors.categories && <p className="eao-error-text">{errors.categories}</p>}
              </div>
            </div>

            {/* Right Column */}
            <div>
              <div className="eao-section">
                <label className="eao-label">Selling Price *</label>
                <div className={`eao-currency-wrapper ${hasAttemptedSubmit && errors.sellingPrice ? 'is-invalid-border' : ''}`}>
                  <span className="eao-currency-symbol">₱</span>
                  <input
                    type="number"
                    className="eao-input"
                    placeholder="0.00"
                    value={sellingPrice}
                    onChange={(e) => {
                      const val = e.target.value;
                      if (val === '' || parseFloat(val) >= 0) {
                        setSellingPrice(val);
                      }
                    }}
                    onKeyDown={(e) => {
                      if (e.key === '-' || e.key === 'e') e.preventDefault();
                    }}
                    min="0" step="any"
                  />
                </div>
                {hasAttemptedSubmit && errors.sellingPrice && <p className="eao-error-text">{errors.sellingPrice}</p>}
              </div>

              <div className="eao-section">
                <label className="eao-label">Est. Cost</label>
                <div className="eao-currency-wrapper">
                  <span className="eao-currency-symbol">₱</span>
                  <input type="text" className="eao-input" readOnly value={estCost.toFixed(2)} />
                </div>
              </div>

              <div className="eao-section">
                <label className="eao-label">Profit</label>
                <div className="eao-currency-wrapper">
                  <span className="eao-currency-symbol">₱</span>
                  <input type="text" className="eao-input" readOnly value={profit.toFixed(2)} />
                </div>
              </div>

              <div className="eao-section">
                <label className="eao-label">Margin</label>
                <input type="text" className="eao-input" readOnly value={`${margin.toFixed(2)}%`} />
              </div>
            </div>

          </div>

          <div className="eao-bottom-section">
            <div className="eao-section">
              <label className="eao-label" style={{ fontSize: '1rem' }}>Recipe / Ingredient Deductions</label>
              <p className="eao-subtext">Select ingredients that will be deducted from inventory when sold.</p>

              <div className="eao-ingredients-table">
                <div className="eao-ingredient-row" style={{ marginBottom: '-0.25rem' }}>
                  <label className="eao-label" style={{ fontSize: '0.8rem' }}>Ingredient *</label>
                  <label className="eao-label" style={{ fontSize: '0.8rem' }}>Qty *</label>
                  <label className="eao-label" style={{ fontSize: '0.8rem' }}>Unit *</label>
                  <label className="eao-label" style={{ fontSize: '0.8rem' }}>Est. Cost</label>
                  <div></div>
                </div>
                {ingredients.map(ing => renderIngredientRow(ing))}
              </div>

              <button
                className="menu-btn"
                style={{
                  marginTop: '1rem',
                  alignSelf: 'flex-start',
                  backgroundColor: '#ffffff',
                  border: '1px solid #D9C0AE',
                  color: '#5C3827',
                  fontWeight: '600'
                }}
                onClick={addIngredient}
              >
                <i className="bi bi-plus"></i> Add Ingredient
              </button>
            </div>
          </div>

        </div>

        {/* Footer */}
        {errorMessage && (
          <div style={{ padding: '0.75rem 1.5rem', backgroundColor: '#F8D7DA', color: '#721C24', fontSize: '0.875rem' }}>
            <i className="bi bi-exclamation-triangle-fill" style={{ marginRight: '0.5rem' }}></i>
            {errorMessage}
          </div>
        )}

        {hasAttemptedSubmit && !isFormValid && (
          <div style={{ color: '#dc3545', fontSize: '0.85rem', padding: '0 1.5rem', marginBottom: '1rem', textAlign: 'right', fontWeight: '500' }}>
            Please fill in all required fields (*)
          </div>
        )}

        <div className="eao-modal-footer">
          <button className="eao-btn-cancel" onClick={onClose} disabled={isSubmitting}>
            Cancel
          </button>
          <button
            className="eao-btn-save"
            disabled={isSubmitting}
            onClick={handleSaveEdit}
          >
            {isSubmitting ? 'Saving...' : 'Save Changes'}
          </button>
        </div>

      </div>
    </div>
  );
};

export default EditAddonModal;
