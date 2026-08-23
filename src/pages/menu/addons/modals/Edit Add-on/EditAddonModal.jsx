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

  if (!isOpen) return null;

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
  const areIngredientsValid = () => {
    if (ingredients.length === 0) return true;
    return ingredients.every(ing => ing.ingredientId !== '' && ing.qty !== '');
  };

  const isFormValid = () => {
    const sp = parseFloat(sellingPrice);
    const spValid = !isNaN(sp) && sp > 0;
    return addonName.trim() !== '' && spValid && selectedCategories.length > 0 && areIngredientsValid();
  };

  /* ─── Handlers ─── */
  const toggleCategory = (catId) => {
    if (selectedCategories.includes(catId)) {
      setSelectedCategories(selectedCategories.filter(id => id !== catId));
    } else {
      setSelectedCategories([...selectedCategories, catId]);
    }
  };

  const handleSaveEdit = async () => {
    if (!addon || isSubmitting || !isFormValid()) return;
    setIsSubmitting(true);

    const addonPayload = {
      addon_name: addonName.trim(),
      selling_price: parseFloat(sellingPrice) || 0,
      estimated_cost: estCost,
      profit: profit,
      margin: margin,
      recipe_status: addon.recipe_status || 'Complete',
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

    setIsSubmitting(false);
    onClose();
  };

  const addIngredient = () => {
    setIngredients([
      ...ingredients,
      { id: Date.now(), ingredientId: '', qty: '', unit: '' }
    ]);
  };

  const removeIngredient = (id) => {
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
        <div>
          <select
            className="eao-select"
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
        </div>
        <div>
          <input
            type="number"
            className="eao-input"
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
        </div>
        <div>
          {availableUnits.length > 0 ? (
            <select
              className="eao-select"
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
                <label className="eao-label">Add-on Name</label>
                <input
                  type="text"
                  className="eao-input"
                  placeholder="e.g. Extra Shot"
                  value={addonName}
                  onChange={(e) => setAddonName(e.target.value)}
                />
              </div>

              {/* Available Toggle */}
              <div className="eao-section" style={{ marginTop: '0.75rem' }}>
                <label className="emi-toggle-container">
                  <input
                    type="checkbox"
                    style={{ display: 'none' }}
                    checked={isAvailable}
                    onChange={(e) => setIsAvailable(e.target.checked)}
                  />
                  <span className="emi-toggle-switch">
                    <span className="emi-toggle-slider"></span>
                  </span>
                  <span className="emi-toggle-label">Available for sale</span>
                </label>
              </div>

              <div className="eao-section">
                <label className="eao-label">Apply to Categories</label>
                <div className="eao-categories-list">
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
              </div>
            </div>

            {/* Right Column */}
            <div>
              <div className="eao-section">
                <label className="eao-label">Selling Price</label>
                <div className="eao-currency-wrapper">
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
                  <label className="eao-label" style={{ fontSize: '0.8rem' }}>Ingredient</label>
                  <label className="eao-label" style={{ fontSize: '0.8rem' }}>Qty</label>
                  <label className="eao-label" style={{ fontSize: '0.8rem' }}>Unit</label>
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
        <div className="eao-modal-footer" style={{ flexDirection: 'column', alignItems: 'stretch' }}>
          <button
            className="eao-btn-save"
            disabled={!isFormValid() || isSubmitting}
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
